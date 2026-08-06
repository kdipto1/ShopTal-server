import { OrderStatus } from "@prisma/client";

export type AnalyticsRange = "7d" | "30d" | "90d";

export interface DashboardKpis {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  lowStockCount: number;
  cartAbandonmentRate: number;
  revenueDelta: number;
  ordersDelta: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface OrderStatusSlice {
  status: OrderStatus;
  count: number;
}

export interface TopProduct {
  id: string;
  name: string;
  unitsSold: number;
  revenue: number;
}

export interface SalesByCategory {
  categoryId: string;
  categoryName: string;
  units: number;
  revenue: number;
}

export interface RecentOrder {
  id: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  customer: {
    id: string;
    name: string;
    email: string;
  };
}

export interface DashboardAnalytics {
  range: AnalyticsRange;
  generatedAt: string;
  kpis: DashboardKpis;
  revenueTimeseries: RevenuePoint[];
  orderStatusBreakdown: OrderStatusSlice[];
  topSellingProducts: TopProduct[];
  salesByCategory: SalesByCategory[];
  recentOrders: RecentOrder[];
}
