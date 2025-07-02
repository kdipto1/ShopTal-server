import express from "express";
import auth from "../../middlewares/auth";
import { ENUM_USER_ROLE } from "../../../enums/user";
import { ProfileController } from "./profile.controller";

const router = express.Router();

router.get(
  "/",
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
  ProfileController.getById,
);
router.patch(
  "/",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  ProfileController.updateById,
);

export const ProfileRoutes = router;
