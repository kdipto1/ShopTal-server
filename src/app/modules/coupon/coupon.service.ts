import { Coupon, Prisma } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { ICouponPayload } from './coupon.interfaces';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';

const createCoupon = async (payload: ICouponPayload): Promise<Coupon> => {
  const {
    code,
    discountType,
    discountValue,
    expirationDate,
    usageLimit,
  } = payload;

  const newCoupon = await prisma.coupon.create({
    data: {
      code,
      discountType,
      discountValue,
      expirationDate,
      usageLimit,
    },
  });

  return newCoupon;
};

const applyCoupon = async (
  couponCode: string,
  totalAmount: number
): Promise<number> => {
  const coupon = await prisma.coupon.findUnique({
    where: {
      code: couponCode,
    },
  });

  if (!coupon) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Coupon not found');
  }

  if (coupon.expirationDate < new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Coupon has expired');
  }

  if (coupon.used >= coupon.usageLimit) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Coupon has reached its usage limit');
  }

  let discountedAmount = 0;

  if (coupon.discountType === 'PERCENTAGE') {
    discountedAmount = totalAmount * (coupon.discountValue / 100);
  } else if (coupon.discountType === 'FIXED_AMOUNT') {
    discountedAmount = coupon.discountValue;
  }

  return totalAmount - discountedAmount;
};

const getSingleCoupon = async (id: string): Promise<Coupon | null> => {
  const result = await prisma.coupon.findUnique({
    where: {
      id,
    },
  });
  return result;
};

const getAllCoupons = async (): Promise<Coupon[]> => {
  const result = await prisma.coupon.findMany();
  return result;
};

export const CouponService = {
  createCoupon,
  applyCoupon,
  getSingleCoupon,
  getAllCoupons,
};
