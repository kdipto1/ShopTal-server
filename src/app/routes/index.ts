import express from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { UserRoutes } from "../modules/user/user.routes";
import { CategoryRoutes } from "../modules/category/category.routes";
import { SubcategoryRoutes } from "../modules/subcategory/subcategory.routes";
import { ProductRoutes } from "../modules/product/product.routes";
import { CartItemRoutes } from "../modules/cartItem/cartItem.routes";
import { BrandRoutes } from "../modules/brand/brand.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/brands",
    route: BrandRoutes,
  },
  {
    path: "/categories",
    route: CategoryRoutes,
  },
  {
    path: "/subcategories",
    route: SubcategoryRoutes,
  },
  {
    path: "/products",
    route: ProductRoutes,
  },
  {
    path: "/carts",
    route: CartItemRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
