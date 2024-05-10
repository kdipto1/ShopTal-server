import express from "express";
import { UserController } from "./user.controller";
import auth from "../../middlewares/auth";
import { ENUM_USER_ROLE } from "../../../enums/user";

const router = express.Router();

router.get("/", UserController.getAllOrFilter);
router.get(
  "/profile",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  UserController.getUserProfile,
);
router.get("/:id", UserController.getById);
router.patch("/:id", UserController.updateById);
router.delete("/:id", UserController.deleteById);

export const UserRoutes = router;
