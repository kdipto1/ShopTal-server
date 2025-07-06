import express from "express";
import { CouponController } from "./coupon.controller";
import auth from "../../middlewares/auth";
import { ENUM_USER_ROLE } from "../../../enums/user";
import validateRequest from "../../middlewares/validateRequest";
import { CouponValidation } from "./coupon.validation";

const router = express.Router();

router.get("/", auth(ENUM_USER_ROLE.ADMIN), CouponController.getAllOrFilter);

router.post(
  "/",
  auth(ENUM_USER_ROLE.ADMIN),
  validateRequest(CouponValidation.createCouponZodSchema),
  CouponController.createCoupon,
);

router.post(
  "/apply",
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
  CouponController.applyCoupon,
);

router.get(
  "/:id",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  CouponController.getSingleCoupon,
);

export const CouponRoutes = router;
