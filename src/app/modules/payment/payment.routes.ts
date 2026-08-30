import express from "express";
import { PaymentController } from "./payment.controller";
import auth from "../../middlewares/auth";
import { ENUM_USER_ROLE } from "../../../enums/user";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentValidation } from "./payment.validation";

const router = express.Router();

router.post(
  "/create-payment-intent",
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
  validateRequest(PaymentValidation.createPaymentIntentZodSchema),
  PaymentController.createPaymentIntent,
);

router.post("/webhook", PaymentController.webhook);

export const PaymentRoutes = router;
