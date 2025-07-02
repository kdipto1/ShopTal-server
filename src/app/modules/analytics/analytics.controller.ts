import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { AnalyticsService } from "./analytics.service";

const getProductPerformance = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AnalyticsService.getProductPerformance();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Products Performances Retrieved Successfully!",
      data: result,
    });
  },
);
const getCartsAbandonmentRate = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AnalyticsService.getCartsAbandonmentRate();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Products Performances Retrieved Successfully!",
      data: result,
    });
  },
);

const getTotalAllTableCounts = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AnalyticsService.getTotalAllTableCounts();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message:
        "Total counts of users, products, brands, categories, subcategories retrieved!",
      data: result,
    });
  },
);

export const AnalyticsController = {
  getProductPerformance,
  getCartsAbandonmentRate,
  getTotalAllTableCounts,
};
