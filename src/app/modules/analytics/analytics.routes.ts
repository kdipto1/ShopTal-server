import express from "express";
import auth from "../../middlewares/auth";
import { ENUM_USER_ROLE } from "../../../enums/user";
import { AnalyticsController } from "./analytics.controller";

const router = express.Router();

router.get(
  "/products/performance",
  auth(ENUM_USER_ROLE.ADMIN),
  AnalyticsController.getProductPerformance,
);

router.get(
  "/carts/abandonment-rate",
  auth(ENUM_USER_ROLE.ADMIN),
  AnalyticsController.getCartsAbandonmentRate,
);

router.get(
  "/counts",
  auth(ENUM_USER_ROLE.ADMIN),
  AnalyticsController.getTotalAllTableCounts,
);

export const AnalyticsRoutes = router;
