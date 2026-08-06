import { ICreatePaymentIntent } from "./payment.interfaces";
import { stripe } from "./payment.utils";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";

const createPaymentIntent = async (userId: string | undefined, payload: ICreatePaymentIntent) => {
  if (!userId) throw new ApiError(httpStatus.UNAUTHORIZED, "Authentication required");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { cart: { include: { cartItems: { include: { product: true } } } } },
  });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  const subtotal = (user.cart?.cartItems || []).reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );
  if (subtotal <= 0) throw new ApiError(httpStatus.BAD_REQUEST, "Your cart is empty");

  let amount = subtotal;
  if (payload.couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: payload.couponCode } });
    if (!coupon || coupon.expirationDate < new Date() || coupon.used >= coupon.usageLimit) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Coupon is invalid or unavailable");
    }
    const discount = coupon.discountType === "PERCENTAGE"
      ? subtotal * (Math.min(coupon.discountValue, 100) / 100)
      : Math.min(coupon.discountValue, subtotal);
    amount = Math.max(0, subtotal - discount);
  }
  if (amount <= 0) throw new ApiError(httpStatus.BAD_REQUEST, "Payment total must be greater than zero");

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: { userId, couponCode: payload.couponCode || "" },
  });

  return {
    clientSecret: paymentIntent.client_secret,
  };
};

export const PaymentService = {
  createPaymentIntent,
};
