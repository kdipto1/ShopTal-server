import express from "express";
import { SubcategoryController } from "./subcategory.controller";

const router = express.Router();

router.post("/", SubcategoryController.create);
router.get("/", SubcategoryController.getAllOrFilter);
router.get("/:id", SubcategoryController.getById);
router.patch("/:id", SubcategoryController.updateById);
router.delete("/:id", SubcategoryController.deleteById);

export const SubcategoryRoutes = router;
