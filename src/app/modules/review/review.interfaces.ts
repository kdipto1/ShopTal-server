import { Review } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type IReviewPayload = {
  productId: string;
  rating: number;
  comment?: string;
};

export type IReview = Review;
