import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ENUM_USER_ROLE } from "../../../enums/user";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsValidation } from "./analytics.validation";

const router = express.Router();

router.get(
  "/dashboard",
  auth(ENUM_USER_ROLE.ADMIN),
  validateRequest(AnalyticsValidation.getDashboardAnalyticsZodSchema),
  AnalyticsController.getDashboardAnalytics,
);

export const AnalyticsRoutes = router;
