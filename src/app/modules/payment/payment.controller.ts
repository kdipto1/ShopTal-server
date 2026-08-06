import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { PaymentService } from "./payment.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as Request & { user?: { userId: string } }).user?.userId;
  const result = await PaymentService.createPaymentIntent(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment intent created successfully",
    data: result,
  });
});

export const PaymentController = {
  createPaymentIntent,
};
