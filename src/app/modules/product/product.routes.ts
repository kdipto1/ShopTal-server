import express from "express";
import { ProductController } from "./product.controller";

const router = express.Router();

router.post("/", ProductController.create);
router.get("/", ProductController.getAllOrFilter);
router.get("/:id", ProductController.getById);
router.patch("/:id", ProductController.updateById);
router.delete("/:id", ProductController.deleteById);

export const ProductRoutes = router;
