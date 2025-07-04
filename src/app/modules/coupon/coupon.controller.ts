import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { CouponService } from './coupon.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { ICoupon } from './coupon.interfaces';

const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponService.createCoupon(req.body);

  sendResponse<ICoupon>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Coupon created successfully',
    data: result,
  });
});

const applyCoupon = catchAsync(async (req: Request, res: Response) => {
  const { couponCode, totalAmount } = req.body;
  const result = await CouponService.applyCoupon(couponCode, totalAmount);

  sendResponse<number>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Coupon applied successfully',
    data: result,
  });
});

const getSingleCoupon = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CouponService.getSingleCoupon(id);

  sendResponse<ICoupon>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Coupon retrieved successfully',
    data: result,
  });
});

const getAllCoupons = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponService.getAllCoupons();

  sendResponse<ICoupon[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Coupons retrieved successfully',
    data: result,
  });
});

export const CouponController = {
  createCoupon,
  applyCoupon,
  getSingleCoupon,
  getAllCoupons,
};
