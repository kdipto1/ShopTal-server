import prisma from "../../../shared/prisma";
// import { format, subMonths } from "date-fns";

const getTotalAllTableCounts = async () => {
  const userCounts = await prisma.user.count();
  const productCounts = await prisma.product.count();
  const categoryCounts = await prisma.productCategory.count();
  const subcategoryCounts = await prisma.productSubcategory.count();
  const brandCounts = await prisma.brand.count();

  return {
    userCounts,
    productCounts,
    categoryCounts,
    subcategoryCounts,
    brandCounts,
  };
};

const getProductPerformance = async () => {
  const products = await prisma.product.findMany({
    include: {
      cartItems: true,
    },
  });
  const productPerformance = products.map(product => ({
    id: product.id,
    name: product.name,
    quantity: product.quantity,
    cartItemsCount: product.cartItems.length,
  }));
  return productPerformance;
};

const getCartsAbandonmentRate = async () => {
  const carts = await prisma.cart.findMany({
    include: {
      cartItems: true,
    },
  });
  const abandonedCarts = carts.filter(cart => cart.cartItems.length === 0);
  const abandonmentRate = (abandonedCarts.length / carts.length) * 100;
  return abandonmentRate;
};

// interface ProductPerformanceMetrics {
//   date: string;
//   totalProducts: number;
//   totalValue: number;
//   newProductCount: number;
//   averagePrice: number;
// }

// interface CategoryPerformance {
//   categoryName: string;
//   totalProducts: number;
//   totalValue: number;
//   percentageOfTotal: number;
// }

// interface BrandPerformance {
//   brandName: string;
//   totalProducts: number;
//   totalValue: number;
//   averagePrice: number;
// }

// const getProductAnalytics = async () => {
//   try {
//     // Product Performance Over Time (Last 6 Months)
//     const productPerformanceTimeSeries: ProductPerformanceMetrics[] =
//       await Promise.all(
//         Array.from({ length: 6 }, async (_, i) => {
//           const endDate = subMonths(new Date(), i);
//           const startDate = subMonths(endDate, 1);

//           const result = await prisma.$queryRaw`
//           SELECT
//             ${format(startDate, "yyyy-MM")} AS date,
//             COUNT(*) AS "totalProducts",
//             COALESCE(SUM(price * quantity), 0) AS "totalValue",
//             COUNT(*) AS "newProductCount",
//             COALESCE(AVG(price), 0) AS "averagePrice"
//           FROM products
//           WHERE "createdAt" >= ${startDate}
//             AND "createdAt" < ${endDate}
//         `;

//           // Prisma returns an array, so we'll extract the first (and only) item
//           // const metrics = result[0] ;
//           // return metrics;
//         }).reverse(),
//       );

//     // Category Performance
//     const categoryPerformance: CategoryPerformance[] = await prisma.$queryRaw`
//       WITH total_value AS (
//         SELECT SUM(price * quantity) as total
//         FROM products
//       )
//       SELECT
//         c.name AS "categoryName",
//         COUNT(p.id) AS "totalProducts",
//         SUM(p.price * p.quantity) AS "totalValue",
//         (SUM(p.price * p.quantity) / (SELECT total FROM total_value)) * 100 AS "percentageOfTotal"
//       FROM products p
//       JOIN categories c ON p."categoryId" = c.id
//       GROUP BY c.name
//       ORDER BY "totalValue" DESC
//     `;

//     // Brand Performance
//     const brandPerformance: BrandPerformance[] = await prisma.$queryRaw`
//       SELECT
//         b.name AS "brandName",
//         COUNT(p.id) AS "totalProducts",
//         SUM(p.price * p.quantity) AS "totalValue",
//         AVG(p.price) AS "averagePrice"
//       FROM products p
//       JOIN brands b ON p."brandId" = b.id
//       GROUP BY b.name
//       ORDER BY "totalValue" DESC
//       LIMIT 10
//     `;

//     // Stock and Inventory Analysis
//     const inventoryAnalysis = await prisma.$queryRaw`
//       SELECT
//         c.name AS "categoryName",
//         SUM(p.quantity) AS "totalQuantity",
//         COUNT(p.id) AS "productCount",
//         AVG(p.price) AS "averagePrice"
//       FROM products p
//       JOIN categories c ON p."categoryId" = c.id
//       GROUP BY c.name
//       ORDER BY "totalQuantity" DESC
//     `;

//     // Price Range Distribution
//     const priceRangeDistribution = await prisma.$queryRaw`
//       SELECT
//         CASE
//           WHEN price < 50 THEN 'Budget (0-50)'
//           WHEN price BETWEEN 50 AND 200 THEN 'Mid-Range (50-200)'
//           WHEN price BETWEEN 200 AND 500 THEN 'Premium (200-500)'
//           ELSE 'Luxury (500+)'
//         END AS "priceRange",
//         COUNT(*) AS "productCount",
//         SUM(price * quantity) AS "totalValue"
//       FROM products
//       GROUP BY "priceRange"
//       ORDER BY "totalValue" DESC
//     `;

//     return {
//       productPerformanceTimeSeries,
//       categoryPerformance,
//       brandPerformance,
//       inventoryAnalysis,
//       priceRangeDistribution,
//     };
//   } catch (error) {
//     console.error(error);
//   }
// };

export const AnalyticsService = {
  getProductPerformance,
  getCartsAbandonmentRate,
  getTotalAllTableCounts,
  // getProductAnalytics,
};
