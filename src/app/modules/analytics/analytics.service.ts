import { OrderStatus, Prisma } from "@prisma/client";
import prisma from "../../../shared/prisma";
import {
  AnalyticsRange,
  DashboardAnalytics,
  DashboardKpis,
  OrderStatusSlice,
  RecentOrder,
  RevenuePoint,
  SalesByCategory,
  TopProduct,
} from "./analytics.interfaces";

const RANGE_DAYS: Record<AnalyticsRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

const REVENUE_STATUSES: OrderStatus[] = [
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

const LOW_STOCK_THRESHOLD = 5;
const ABANDONMENT_INACTIVE_DAYS = 7;

const startOfDay = (d: Date): Date => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const buildDateSeries = (days: number): string[] => {
  const series: string[] = [];
  const today = startOfDay(new Date());
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    series.push(d.toISOString().slice(0, 10));
  }
  return series;
};

const getRangeStart = (range: AnalyticsRange): Date => {
  const start = startOfDay(new Date());
  start.setDate(start.getDate() - (RANGE_DAYS[range] - 1));
  return start;
};

const getPreviousRangeStart = (range: AnalyticsRange): Date => {
  const days = RANGE_DAYS[range];
  const start = startOfDay(new Date());
  start.setDate(start.getDate() - days * 2 + 1);
  return start;
};

const pctChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(2));
};

const getDashboardAnalytics = async (
  range: AnalyticsRange,
): Promise<DashboardAnalytics> => {
  const days = RANGE_DAYS[range];
  const rangeStart = getRangeStart(range);
  const previousRangeStart = getPreviousRangeStart(range);
  const dateSeries = buildDateSeries(days);
  const abandonmentCutoff = new Date();
  abandonmentCutoff.setDate(abandonmentCutoff.getDate() - ABANDONMENT_INACTIVE_DAYS);

  const revenueWhere: Prisma.OrderWhereInput = {
    status: { in: REVENUE_STATUSES },
    createdAt: { gte: rangeStart },
  };

  const previousRevenueWhere: Prisma.OrderWhereInput = {
    status: { in: REVENUE_STATUSES },
    createdAt: { gte: previousRangeStart, lt: rangeStart },
  };

  // Queries are split into sequential batches to avoid exhausting the
  // Prisma connection pool (configured limit is typically 1 on free tiers).
  // Each batch uses at most 5 connections concurrently.

  // Batch 1: window aggregates (current vs previous period).
  const [revenueAgg, previousRevenueAgg] = await Promise.all([
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      _count: { _all: true },
      where: revenueWhere,
    }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      _count: { _all: true },
      where: previousRevenueWhere,
    }),
  ]);

  // Batch 2: simple scalars + status groupBy.
  const [totalCustomers, lowStockCount, statusGroups] = await Promise.all([
    prisma.user.count(),
    prisma.product.count({
      where: { quantity: { lt: LOW_STOCK_THRESHOLD } },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  // Batch 3: heavy raw SQL (date series + sales by category).
  const [revenueSeriesRaw, salesByCategoryRaw] = await Promise.all([
    prisma.$queryRaw<{ date: string; revenue: number; orderCount: number }[]>`
      SELECT
        TO_CHAR(o."createdAt", 'YYYY-MM-DD') AS date,
        COALESCE(SUM(o."totalAmount"), 0)::float AS revenue,
        COUNT(o.id)::int AS "orderCount"
      FROM orders o
      WHERE o.status IN ('PROCESSING', 'SHIPPED', 'DELIVERED')
        AND o."createdAt" >= ${rangeStart}
      GROUP BY TO_CHAR(o."createdAt", 'YYYY-MM-DD')
    `,
    prisma.$queryRaw<
      { categoryId: string; categoryName: string; units: number; revenue: number }[]
    >`
      SELECT
        c.id AS "categoryId",
        c.name AS "categoryName",
        COALESCE(SUM(oi.quantity), 0)::int AS "units",
        COALESCE(SUM(oi.quantity * oi.price), 0)::float AS "revenue"
      FROM categories c
      LEFT JOIN products p ON p."categoryId" = c.id
      LEFT JOIN order_items oi ON oi."productId" = p.id
      LEFT JOIN orders o ON o.id = oi."orderId"
        AND o.status IN ('PROCESSING', 'SHIPPED', 'DELIVERED')
        AND o."createdAt" >= ${rangeStart}
      GROUP BY c.id, c.name
      HAVING COALESCE(SUM(oi.quantity), 0) > 0
      ORDER BY "revenue" DESC
    `,
  ]);

  // Batch 4a: top product IDs (needed before we can resolve names + revenue).
  const topSellingRaw = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });
  const productIds = topSellingRaw.map((r) => r.productId);

  // Batch 4b: remaining list/lookup queries, parallel.
  const [productDetails, recentOrders, abandonedCartCount, completedUserCount] =
    await Promise.all([
      productIds.length > 0
        ? prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true },
          })
        : Promise.resolve([] as { id: string; name: string }[]),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.cart.count({
        where: {
          cartItems: { some: {} },
          updatedAt: { lt: abandonmentCutoff },
          user: { orders: { none: {} } },
        },
      }),
      prisma.user.count({
        where: { orders: { some: { createdAt: { gte: rangeStart } } } },
      }),
    ]);

  let topProductRevenueMap = new Map<string, number>();
  if (productIds.length > 0) {
    const revenueRows = await prisma.$queryRaw<
      { productId: string; revenue: number }[]
    >`
      SELECT "productId", COALESCE(SUM(quantity * price), 0)::float AS revenue
      FROM order_items
      WHERE "productId" = ANY(${productIds}::text[])
      GROUP BY "productId"
    `;
    topProductRevenueMap = new Map(
      revenueRows.map((r) => [r.productId, Number(r.revenue)]),
    );
  }

  const totalRevenue = Number(revenueAgg._sum.totalAmount ?? 0);
  const totalOrders = revenueAgg._count._all;
  const averageOrderValue =
    totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;

  const previousRevenue = Number(previousRevenueAgg._sum.totalAmount ?? 0);
  const previousOrders = previousRevenueAgg._count._all;
  const revenueDelta = pctChange(totalRevenue, previousRevenue);
  const ordersDelta = pctChange(totalOrders, previousOrders);

  const abandonmentDenominator = abandonedCartCount + completedUserCount;
  const cartAbandonmentRate =
    abandonmentDenominator > 0
      ? Number(((abandonedCartCount / abandonmentDenominator) * 100).toFixed(2))
      : 0;

  const kpis: DashboardKpis = {
    totalRevenue,
    totalOrders,
    totalCustomers,
    averageOrderValue,
    lowStockCount,
    cartAbandonmentRate,
    revenueDelta,
    ordersDelta,
  };

  const seriesMap = new Map<string, RevenuePoint>();
  for (const d of dateSeries) {
    seriesMap.set(d, { date: d, revenue: 0, orderCount: 0 });
  }
  for (const row of revenueSeriesRaw) {
    const point = seriesMap.get(row.date);
    if (point) {
      point.revenue = Number(row.revenue) || 0;
      point.orderCount = Number(row.orderCount) || 0;
    }
  }
  const revenueTimeseries: RevenuePoint[] = Array.from(seriesMap.values());

  const orderStatusBreakdown: OrderStatusSlice[] = (
    Object.values(OrderStatus) as OrderStatus[]
  ).map((status) => ({
    status,
    count: statusGroups.find((g) => g.status === status)?._count._all ?? 0,
  }));

  const productNameMap = new Map(productDetails.map((p) => [p.id, p.name]));

  const topSellingProducts: TopProduct[] = topSellingRaw.map((row) => ({
    id: row.productId,
    name: productNameMap.get(row.productId) ?? "Unknown",
    unitsSold: row._sum.quantity ?? 0,
    revenue: topProductRevenueMap.get(row.productId) ?? 0,
  }));

  const salesByCategory: SalesByCategory[] = salesByCategoryRaw.map((row) => ({
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    units: Number(row.units) || 0,
    revenue: Number(row.revenue) || 0,
  }));

  const recentOrdersMapped: RecentOrder[] = recentOrders.map((o) => ({
    id: o.id,
    totalAmount: Number(o.totalAmount),
    status: o.status,
    createdAt: o.createdAt,
    customer: {
      id: o.user.id,
      name: `${o.user.firstName} ${o.user.lastName}`.trim() || o.user.email,
      email: o.user.email,
    },
  }));

  return {
    range,
    generatedAt: new Date().toISOString(),
    kpis,
    revenueTimeseries,
    orderStatusBreakdown,
    topSellingProducts,
    salesByCategory,
    recentOrders: recentOrdersMapped,
  };
};

export const AnalyticsService = {
  getDashboardAnalytics,
};
