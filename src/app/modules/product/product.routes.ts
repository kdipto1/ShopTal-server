import express from "express";
import { ProductController } from "./product.controller";
import auth from "../../middlewares/auth";
import { ENUM_USER_ROLE } from "../../../enums/user";

const router = express.Router();

router.post("/", auth(ENUM_USER_ROLE.ADMIN), ProductController.create);
router.get("/", ProductController.getAllOrFilter);
router.get("/:id", ProductController.getById);
router.patch("/:id", auth(ENUM_USER_ROLE.ADMIN), ProductController.updateById);
router.delete("/:id", auth(ENUM_USER_ROLE.ADMIN), ProductController.deleteById);

export const ProductRoutes = router;
