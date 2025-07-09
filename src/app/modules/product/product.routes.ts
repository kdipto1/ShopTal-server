import express from "express";
import { ProductController } from "./product.controller";
import auth from "../../middlewares/auth";
import { ENUM_USER_ROLE } from "../../../enums/user";
import validateRequest from "../../middlewares/validateRequest";
import { ProductValidation } from "./product.validation";

const router = express.Router();

router.post("/", auth(ENUM_USER_ROLE.ADMIN), ProductController.create);
router.get("/", ProductController.getAllOrFilter);
router.get("/:id", ProductController.getById);
router.patch("/:id", auth(ENUM_USER_ROLE.ADMIN), ProductController.updateById);
router.delete("/:id", auth(ENUM_USER_ROLE.ADMIN), ProductController.deleteById);
router.patch(
  "/stock/:productId",
  auth(ENUM_USER_ROLE.ADMIN),
  validateRequest(ProductValidation.updateProductStockZodSchema),
  ProductController.updateProductStock,
);

export const ProductRoutes = router;
