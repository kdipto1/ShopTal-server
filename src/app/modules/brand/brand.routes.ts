import express from "express";
import auth from "../../middlewares/auth";
import { ENUM_USER_ROLE } from "../../../enums/user";
import { BrandController } from "./brand.controller";

const router = express.Router();

router.post("/", auth(ENUM_USER_ROLE.ADMIN), BrandController.create);
router.get("/", BrandController.getAllOrFilter);
router.get("/:id", BrandController.getById);
router.patch("/:id", auth(ENUM_USER_ROLE.ADMIN), BrandController.updateById);
router.delete("/:id", auth(ENUM_USER_ROLE.ADMIN), BrandController.deleteById);

export const BrandRoutes = router;
