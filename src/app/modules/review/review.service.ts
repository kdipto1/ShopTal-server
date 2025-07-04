import { Prisma, Review } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { IReviewPayload } from './review.interfaces';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';

const createReview = async (
  userId: string,
  payload: IReviewPayload
): Promise<Review> => {
  const { productId, rating, comment } = payload;

  const newReview = await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
    const product = await transaction.product.findUnique({
      where: { id: productId },
      include: {
        reviews: true,
      },
    });

    if (!product) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }

    const review = await transaction.review.create({
      data: {
        userId,
        productId,
        rating,
        comment,
      },
    });

    const reviews = await transaction.review.findMany({
      where: {
        productId,
      },
    });

    const totalRating = reviews.reduce((acc: number, review: Review) => acc + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await transaction.product.update({
      where: { id: productId },
      data: {
        averageRating,
      },
    });

    return review;
  });

  return newReview;
};

const getReviews = async (productId: string): Promise<Review[]> => {
  const reviews = await prisma.review.findMany({
    where: {
      productId,
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
  return reviews;
};

export const ReviewService = {
  createReview,
  getReviews,
};
