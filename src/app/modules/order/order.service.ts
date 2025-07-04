import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import prisma from "../../../shared/prisma";
import { IOrder, IOrderPayload } from "./order.interfaces";
import { Order, OrderStatus, Prisma } from "@prisma/client";

const createOrder = async (
  userId: string,
  payload: IOrderPayload,
): Promise<Order> => {
  const { shippingAddress, items, couponCode } = payload;

  const newOrder = await prisma.$transaction(
    async (transaction: Prisma.TransactionClient) => {
      const user = await transaction.user.findUnique({
        where: { id: userId },
        include: {
          cart: {
            include: {
              cartItems: true,
            },
          },
        },
      });

      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
      }

      let totalAmount = 0;
      const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];

      for (const item of items) {
        const product = await transaction.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new ApiError(
            httpStatus.NOT_FOUND,
            `Product with id ${item.productId} not found`,
          );
        }

        if (product.quantity < item.quantity) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Product with id ${item.productId} is out of stock`,
          );
        }

        const price = product.price * item.quantity;
        totalAmount += price;

        orderItemsData.push({
          product: {
            connect: {
              id: item.productId,
            },
          },
          quantity: item.quantity,
          price: price,
        });

        await transaction.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      let couponId: string | undefined = undefined;

      if (couponCode) {
        const coupon = await transaction.coupon.findUnique({
          where: { code: couponCode },
        });

        if (!coupon) {
          throw new ApiError(httpStatus.NOT_FOUND, "Coupon not found");
        }

        if (coupon.expirationDate < new Date()) {
          throw new ApiError(httpStatus.BAD_REQUEST, "Coupon has expired");
        }

        if (coupon.used >= coupon.usageLimit) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Coupon has reached its usage limit",
          );
        }

        let discountedAmount = 0;
        if (coupon.discountType === "PERCENTAGE") {
          discountedAmount = totalAmount * (coupon.discountValue / 100);
        } else if (coupon.discountType === "FIXED_AMOUNT") {
          discountedAmount = coupon.discountValue;
        }
        totalAmount -= discountedAmount;

        await transaction.coupon.update({
          where: { id: coupon.id },
          data: {
            used: {
              increment: 1,
            },
          },
        });
        couponId = coupon.id;
      }

      const order = await transaction.order.create({
        data: {
          userId,
          shippingAddress,
          totalAmount,
          couponId,
          orderItems: {
            create: orderItemsData,
          },
        },
        include: {
          orderItems: true,
        },
      });

      await transaction.cartItem.deleteMany({
        where: {
          cartId: user.cart?.id,
        },
      });

      return order;
    },
  );

  return newOrder;
};

const getOrders = async (userId: string): Promise<IOrder[]> => {
  const orders = await prisma.order.findMany({
    where: {
      userId,
    },
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });
  return orders;
};

const updateOrder = async (
  orderId: string,
  status: OrderStatus,
): Promise<Order> => {
  const updatedOrder = await prisma.$transaction(
    async (transaction: Prisma.TransactionClient) => {
      const order = await transaction.order.findUnique({
        where: { id: orderId },
        include: {
          orderItems: true,
        },
      });

      if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
      }

      if (order.status === OrderStatus.CANCELED) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "This order has already been canceled",
        );
      }

      if (status === OrderStatus.CANCELED) {
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
      }

      const result = await transaction.order.update({
        where: { id: orderId },
        data: {
          status,
        },
      });

      return result;
    },
  );

  return updatedOrder;
};

export const OrderService = {
  createOrder,
  getOrders,
  updateOrder,
};
