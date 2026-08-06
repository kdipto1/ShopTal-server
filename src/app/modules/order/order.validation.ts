import { z } from "zod";
import { OrderStatus } from "@prisma/client";

const createOrderZodSchema = z.object({
  body: z.object({
    shippingAddress: z.string({
      required_error: "Shipping address is required",
    }).trim().min(5).max(500),
    items: z.array(
      z.object({
        productId: z.string({
          required_error: "Product ID is required",
        }),
        quantity: z.number({
          required_error: "Quantity is required",
        }).int().positive().max(100),
      }),
    ).min(1).max(50),
    couponCode: z.string().trim().max(50).optional(),
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
