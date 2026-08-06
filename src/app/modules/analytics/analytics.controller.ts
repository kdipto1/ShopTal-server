import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsRange } from "./analytics.interfaces";

const getDashboardAnalytics = catchAsync(
  async (req: Request, res: Response) => {
    const range = (req.query.range as AnalyticsRange) || "30d";
    const result = await AnalyticsService.getDashboardAnalytics(range);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Dashboard analytics retrieved successfully!",
      data: result,
    });
  },
);

export const AnalyticsController = {
  getDashboardAnalytics,
};
