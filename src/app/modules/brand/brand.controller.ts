import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { BrandService } from "./brand.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import pick from "../../../shared/pick";
import { BrandFilterAbleFields } from "./brand.constants";

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await BrandService.create(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Brand Created Successfully!",
    data: result,
  });
});

const getAllOrFilter = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, BrandFilterAbleFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await BrandService.getAllOrFilter(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Brand's Retrieved Successfully!",
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BrandService.getById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Brand Retrieved Successfully!",
    data: result,
  });
});

const updateById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BrandService.updateById(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Brand Updated Successfully!",
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BrandService.deleteById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Brand Deleted Successfully!",
    data: result,
  });
});

export const BrandController = {
  create,
  getAllOrFilter,
  getById,
  updateById,
  deleteById,
};
