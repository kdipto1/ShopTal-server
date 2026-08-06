import { z } from "zod";
import { DiscountType } from "@prisma/client";

const createCouponZodSchema = z.object({
  body: z.object({
    code: z.string({
      required_error: "Code is required",
    }).trim().min(1).max(50),
    discountType: z.enum([DiscountType.PERCENTAGE, DiscountType.FIXED_AMOUNT], {
      required_error: "Discount type is required",
    }),
    discountValue: z.number({
      required_error: "Discount value is required",
    }).positive(),
    expirationDate: z.string({
      required_error: "Expiration date is required",
    }).datetime(),
    usageLimit: z.number({
      required_error: "Usage limit is required",
    }).int().positive(),
  }),
});

const updateCouponZodSchema = z.object({
  body: z.object({
    code: z.string().trim().min(1).max(50).optional(),
    discountType: z.enum([DiscountType.PERCENTAGE, DiscountType.FIXED_AMOUNT]).optional(),
    discountValue: z.number().positive().optional(),
    expirationDate: z.string().datetime().optional(),
    usageLimit: z.number().int().positive().optional(),
  }).strict(),
});

export const CouponValidation = {
  createCouponZodSchema,
  updateCouponZodSchema,
};
