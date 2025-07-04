import express from "express";
import { CategoryController } from "./category.controller";
import auth from "../../middlewares/auth";
import { ENUM_USER_ROLE } from "../../../enums/user";

const router = express.Router();

router.post("/", auth(ENUM_USER_ROLE.ADMIN), CategoryController.create);
router.get("/", CategoryController.getAllOrFilter);
router.get("/navbar-category", CategoryController.getNavbarCategory);
router.get("/:id", CategoryController.getById);
router.patch("/:id", auth(ENUM_USER_ROLE.ADMIN), CategoryController.updateById);
router.delete(
  "/:id",
  auth(ENUM_USER_ROLE.ADMIN),
  CategoryController.deleteById,
);

export const CategoryRoutes = router;
