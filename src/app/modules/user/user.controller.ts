import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import pick from "../../../shared/pick";
import { UserFilterAbleFields } from "./user.constants";

const getAllOrFilter = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, UserFilterAbleFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await UserService.getAllOrFilter(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Accounts Retrieved Successfully!",
    meta: result.meta,
    data: result.data,
  });
});
const getById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.getById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Account Retrieved Successfully!",
    data: result,
  });
});
const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { userId } = req.user as any;
  const result = await UserService.getById(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile Retrieved Successfully!",
    data: result,
  });
});
const updateById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.updateById(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Account Updated Successfully!",
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.deleteById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Account Deleted Successfully!",
    data: result,
  });
});

export const UserController = {
  getAllOrFilter,
  getById,
  updateById,
  deleteById,
  getUserProfile,
};
