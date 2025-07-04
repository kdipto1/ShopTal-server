import express from "express";
import { PaymentController } from "./payment.controller";
import auth from "../../middlewares/auth";
import { ENUM_USER_ROLE } from "../../../enums/user";

const router = express.Router();

router.post(
  "/create-payment-intent",
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
  PaymentController.createPaymentIntent,
);

export const PaymentRoutes = router;
