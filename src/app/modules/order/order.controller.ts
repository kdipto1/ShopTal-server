import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { OrderService } from "./order.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { IOrder } from "./order.interfaces";
import { Order } from "@prisma/client";
import { OrderFilterAbleFields } from "./order.constants";
import pick from "../../../shared/pick";

const createOrder = catchAsync(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (req as any).user;
  const result = await OrderService.createOrder(user?.userId, req.body);

  sendResponse<Order>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order created successfully",
    data: result,
  });
});

const getOrders = catchAsync(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (req as any).user;
  const result = await OrderService.getOrders(user?.userId);

  sendResponse<IOrder[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Orders retrieved successfully",
    data: result,
  });
});

const updateOrder = catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const result = await OrderService.updateOrder(orderId, status);

  sendResponse<Order>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order updated successfully",
    data: result,
  });
});

const getAllOrFilter = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, OrderFilterAbleFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await OrderService.getAllOrFilter(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order's Retrieved Successfully!",
    data: result,
  });
});

export const OrderController = {
  createOrder,
  getOrders,
  updateOrder,
  getAllOrFilter,
};
