import { z } from "zod";
import { DiscountType } from "@prisma/client";

const createCouponZodSchema = z.object({
  body: z.object({
    code: z.string({
      required_error: "Code is required",
    }),
    discountType: z.enum([DiscountType.PERCENTAGE, DiscountType.FIXED_AMOUNT], {
      required_error: "Discount type is required",
    }),
    discountValue: z.number({
      required_error: "Discount value is required",
    }),
    expirationDate: z.string({
      required_error: "Expiration date is required",
    }),
    usageLimit: z.number({
      required_error: "Usage limit is required",
    }),
  }),
});

export const CouponValidation = {
  createCouponZodSchema,
};
