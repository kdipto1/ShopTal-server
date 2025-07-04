import express from "express";
import { OrderController } from "./order.controller";
import auth from "../../middlewares/auth";
import { ENUM_USER_ROLE } from "../../../enums/user";
import validateRequest from "../../middlewares/validateRequest";
import { OrderValidation } from "./order.validation";

const router = express.Router();

router.post(
  "/",
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
  validateRequest(OrderValidation.createOrderZodSchema),
  OrderController.createOrder,
);
router.get("/", auth(ENUM_USER_ROLE.ADMIN), OrderController.getAllOrFilter);

router.get(
  "/my",
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
  OrderController.getOrders,
);

router.patch(
  "/:orderId",
  auth(ENUM_USER_ROLE.ADMIN),
  validateRequest(OrderValidation.updateOrderZodSchema),
  OrderController.updateOrder,
);

export const OrderRoutes = router;
