import express from "express";
import auth from "../../middlewares/auth";
import { ENUM_USER_ROLE } from "../../../enums/user";
import { CartItemController } from "./cartItem.controller";

const router = express.Router();

router.post(
  "/",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  CartItemController.create,
);
router.get(
  "/",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  CartItemController.getAllOrFilter,
);

router.get(
  "/user-items",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  CartItemController.getUserCartItems,
);

router.get(
  "/:id",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  CartItemController.getById,
);
router.patch(
  "/:id",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  CartItemController.updateById,
);
router.delete(
  "/:id",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  CartItemController.deleteById,
);

export const CartItemRoutes = router;
