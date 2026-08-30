import express from "express";
import { AuthController } from "./auth.controller";
import { authRateLimiter } from "../../middlewares/rateLimit";
import validateRequest from "../../middlewares/validateRequest";
import { AuthValidation } from "./auth.validation";

const router = express.Router();

router.post("/signup", authRateLimiter, AuthController.signup);

router.post("/login", authRateLimiter, AuthController.login);

router.post(
  "/refresh-token",
  authRateLimiter,
  validateRequest(AuthValidation.refreshTokenZodSchema),
  AuthController.refreshToken,
);

router.post(
  "/forgot-password",
  authRateLimiter,
  validateRequest(AuthValidation.forgotPasswordZodSchema),
  AuthController.forgotPassword,
);

router.post(
  "/reset-password",
  authRateLimiter,
  validateRequest(AuthValidation.resetPasswordZodSchema),
  AuthController.resetPassword,
);

export const AuthRoutes = router;
