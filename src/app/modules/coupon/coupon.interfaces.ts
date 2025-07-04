import { Coupon } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ICouponPayload = {
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  expirationDate: Date;
  usageLimit: number;
};

export type ICoupon = Coupon;
