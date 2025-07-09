import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { PaymentService } from "./payment.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.createPaymentIntent(req.body);

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
