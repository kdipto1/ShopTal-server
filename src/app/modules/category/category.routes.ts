import express from "express";
import { CategoryController } from "./category.controller";

const router = express.Router();

router.post("/", CategoryController.create);
router.get("/", CategoryController.getAllOrFilter);
router.get("/:id", CategoryController.getById);
router.patch("/:id", CategoryController.updateById);
router.delete("/:id", CategoryController.deleteById);

export const CategoryRoutes = router;
