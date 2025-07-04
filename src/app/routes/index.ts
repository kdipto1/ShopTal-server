import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { UserRoutes } from '../modules/user/user.routes';
import { CategoryRoutes } from '../modules/category/category.routes';
import { SubcategoryRoutes } from '../modules/subcategory/subcategory.routes';
import { ProductRoutes } from '../modules/product/product.routes';
import { CartItemRoutes } from '../modules/cartItem/cartItem.routes';
import { BrandRoutes } from '../modules/brand/brand.routes';
import { ProfileRoutes } from '../modules/profile/profile.routes';
import { AnalyticsRoutes } from '../modules/analytics/analytics.routes';
import { OrderRoutes } from '../modules/order/order.routes';
import { PaymentRoutes } from '../modules/payment/payment.routes';
import { ReviewRoutes } from '../modules/review/review.routes';
import { CouponRoutes } from '../modules/coupon/coupon.routes';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/brands',
    route: BrandRoutes,
  },
  {
    path: '/categories',
    route: CategoryRoutes,
  },
  {
    path: '/subcategories',
    route: SubcategoryRoutes,
  },
  {
    path: '/products',
    route: ProductRoutes,
  },
  {
    path: '/cart-items',
    route: CartItemRoutes,
  },
  {
    path: '/profile',
    route: ProfileRoutes,
  },
  {
    path: '/analytics',
    route: AnalyticsRoutes,
  },
  {
    path: '/orders',
    route: OrderRoutes,
  },
  {
    path: '/payment',
    route: PaymentRoutes,
  },
  {
    path: '/reviews',
    route: ReviewRoutes,
  },
  {
    path: '/coupons',
    route: CouponRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
