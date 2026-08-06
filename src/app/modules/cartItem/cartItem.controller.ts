import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { CartItemFilterAbleFields } from "./cartItem.constants";
import { CartItemService } from "./cartItem.service";

interface CartUser {
  userId?: string;
  role?: string;
}

const create = catchAsync(async (req: Request, res: Response) => {
  const user = (req as Request & { user?: CartUser }).user;

  const result = await CartItemService.create(req.body, user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Item added to cart Successfully!",
    data: result,
  });
});

const getUserCartItems = catchAsync(async (req: Request, res: Response) => {
  const user = (req as Request & { user?: CartUser }).user;
  const result = await CartItemService.getUserCartItems(user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Retrieved cart items successfully!",
    data: result,
  });
});

const getAllOrFilter = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, CartItemFilterAbleFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await CartItemService.getAllOrFilter(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart Item's Retrieved Successfully!",
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as Request & { user?: CartUser }).user;
  const result = await CartItemService.getById(id, user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart Item Retrieved Successfully!",
    data: result,
  });
});

const updateById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as Request & { user?: CartUser }).user;
  const result = await CartItemService.updateById(id, req.body, user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart Item Updated Successfully!",
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as Request & { user?: CartUser }).user;
  const result = await CartItemService.deleteById(id, user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart Item Deleted Successfully!",
    data: result,
  });
});

export const CartItemController = {
  create,
  getAllOrFilter,
  getById,
  updateById,
  deleteById,
  getUserCartItems,
};
