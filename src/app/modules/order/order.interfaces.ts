import { Order, OrderItem } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type IOrderPayload = {
  shippingAddress: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  couponCode?: string;
};

export type IOrder = Order & {
  orderItems: OrderItem[];
};
