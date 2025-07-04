import express from "express";
import { SubcategoryController } from "./subcategory.controller";
import auth from "@/app/middlewares/auth";
import { ENUM_USER_ROLE } from "@/enums/user";

const router = express.Router();

router.post("/", auth(ENUM_USER_ROLE.ADMIN), SubcategoryController.create);
router.get("/", SubcategoryController.getAllOrFilter);
router.get("/:id", SubcategoryController.getById);
router.patch(
  "/:id",
  auth(ENUM_USER_ROLE.ADMIN),
  SubcategoryController.updateById,
);
router.delete(
  "/:id",
  auth(ENUM_USER_ROLE.ADMIN),
  SubcategoryController.deleteById,
);

export const SubcategoryRoutes = router;
