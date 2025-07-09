import { z } from "zod";
import { OrderStatus } from "@prisma/client";

const createOrderZodSchema = z.object({
  body: z.object({
    shippingAddress: z.string({
      required_error: "Shipping address is required",
    }),
    items: z.array(
      z.object({
        productId: z.string({
          required_error: "Product ID is required",
        }),
        quantity: z.number({
          required_error: "Quantity is required",
        }),
      }),
    ),
    couponCode: z.string().optional(),
  }),
});

const updateOrderZodSchema = z.object({
  body: z.object({
    status: z.enum(
      [
        OrderStatus.PENDING,
        OrderStatus.PROCESSING,
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
        OrderStatus.CANCELED,
      ],
      {
        required_error: "Status is required",
      },
    ),
  }),
});

export const OrderValidation = {
  createOrderZodSchema,
  updateOrderZodSchema,
};
