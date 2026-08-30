import Stripe from "stripe";
import { ICreatePaymentIntent } from "./payment.interfaces";
import { stripe } from "./payment.utils";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import config from "../../../config";

const createPaymentIntent = async (
  userId: string | undefined,
  payload: ICreatePaymentIntent,
) => {
  if (!userId)
    throw new ApiError(httpStatus.UNAUTHORIZED, "Authentication required");

  const { orderId } = payload;
  if (!orderId)
    throw new ApiError(httpStatus.BAD_REQUEST, "orderId is required");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });
  if (!order) throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  if (order.userId !== userId)
    throw new ApiError(httpStatus.FORBIDDEN, "You do not own this order");
  if (order.paymentStatus === PaymentStatus.PAID)
    throw new ApiError(httpStatus.BAD_REQUEST, "Order is already paid");

  const amount = Math.round(Number(order.totalAmount) * 100);
  if (amount <= 0)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Payment total must be greater than zero",
    );

  if (order.paymentIntentId) {
    const existingIntent = await stripe.paymentIntents.retrieve(
      order.paymentIntentId,
    );
    if (existingIntent.status === "succeeded") {
      throw new ApiError(httpStatus.BAD_REQUEST, "Order is already paid");
    }
    return {
      clientSecret: existingIntent.client_secret,
    };
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: { orderId: order.id, userId },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentIntentId: paymentIntent.id },
  });

  return {
    clientSecret: paymentIntent.client_secret,
  };
};

const markOrderPaid = async (paymentIntent: Stripe.PaymentIntent) => {
  const orderId = paymentIntent.metadata?.orderId;
  if (!orderId) return;

  await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
    const order = await transaction.order.findUnique({
      where: { id: orderId },
    });
    if (!order || order.paymentStatus === PaymentStatus.PAID) return;

    await transaction.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.PAID,
        status: OrderStatus.PROCESSING,
      },
    });

    const cart = await transaction.cart.findUnique({
      where: { userId: order.userId },
    });
    if (cart) {
      await transaction.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }
  });
};

const markOrderFailed = async (paymentIntent: Stripe.PaymentIntent) => {
  const orderId = paymentIntent.metadata?.orderId;
  if (!orderId) return;

  await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
    const order = await transaction.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });
    if (
      !order ||
      order.paymentStatus === PaymentStatus.PAID ||
      order.status === OrderStatus.CANCELED
    ) {
      return;
    }

    for (const item of order.orderItems) {
      await transaction.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            increment: item.quantity,
          },
        },
      });
    }

    if (order.couponId) {
      await transaction.coupon.update({
        where: { id: order.couponId },
        data: {
          used: {
            decrement: 1,
          },
        },
      });
    }

    await transaction.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.FAILED,
        status: OrderStatus.CANCELED,
      },
    });
  });
};

const handleWebhook = async (payload: Buffer, signature: string) => {
  if (!config.stripe.webhook_secret) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Stripe webhook secret is not configured",
    );
  }

  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    config.stripe.webhook_secret,
  );

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await markOrderPaid(paymentIntent);
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await markOrderFailed(paymentIntent);
      break;
    }
    default:
      break;
  }

  return { received: true };
};

export const PaymentService = {
  createPaymentIntent,
  handleWebhook,
};
