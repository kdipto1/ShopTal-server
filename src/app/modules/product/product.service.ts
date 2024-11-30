import { Prisma, ProductCategory } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { IGenericResponse } from "../../../interfaces/common";
import { paginationHelpers } from "../../../helpers/paginationHelper";
import { IPaginationOptions } from "../../../interfaces/pagination";
import {
  IProductFilterRequest,
  ProductCreateInput,
} from "./product.interfaces";
import { ProductSearchAbleFields } from "./product.constants";
import cloudinary from "../../../config/cloudinaryConfig";
import ApiError from "../../../errors/ApiError";

const create = async (payload: ProductCreateInput) => {
  const result = await prisma.product.create({
    data: payload,
  });
  return result;
};

const getAllOrFilter = async (
  filters: IProductFilterRequest,
  options: IPaginationOptions,
): Promise<IGenericResponse<ProductCategory[]>> => {
  const { page, limit, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, minPrice, maxPrice, random, ...filtersData } = filters;

  const andConditions: Prisma.ProductWhereInput[] = [];
  if (searchTerm) {
    andConditions.push({
      OR: ProductSearchAbleFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (minPrice) {
    andConditions.push({
      price: {
        gte: Number(minPrice),
      },
    });
  }
  if (maxPrice) {
    andConditions.push({
      price: {
        lte: Number(maxPrice),
      },
    });
  }

  if (Object.keys(filtersData).length > 0) {
    andConditions.push({
      AND: Object.keys(filtersData).map(key => ({
        [key]: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          equals: (filtersData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.ProductWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // To get random products set search param : /product?random=true
  if (random) {
    // First, get total count of matching products
    const total = await prisma.product.count({ where: whereConditions });

    // Generate random skip value
    const randomSkip = Math.floor(Math.random() * Math.max(0, total - limit));

    const result = await prisma.product.findMany({
      where: whereConditions,
      skip: randomSkip,
      take: limit,
      orderBy: {
        // Optional: add additional randomization with random ordering
        id: "asc", // or any other field
      },
    });

    return {
      meta: {
        page: 1,
        limit,
        total,
      },
      data: result,
    };
  }

  const result = await prisma.product.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : { createdAt: "desc" },
  });

  const total = await prisma.product.count({ where: whereConditions });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getById = async (id: string) => {
  const result = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      brand: {
        select: {
          name: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
      subcategory: {
        select: {
          name: true,
        },
      },
    },
  });
  return result;
};

const updateById = async (
  id: string,
  payload: Prisma.ProductCategoryUpdateInput,
) => {
  const result = await prisma.product.update({
    where: {
      id,
    },
    data: {
      ...payload,
      updatedAt: new Date(),
    },
  });
  return result;
};

const deleteById = async (id: string) => {
  const product = await prisma.product.findFirstOrThrow({
    where: {
      id,
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imageUrl: any = product.image;
  const publicId = imageUrl.split("/").pop().split(".")[0];
  try {
    const image = await cloudinary.uploader.destroy(`shoptal/${publicId}`);
    if (image.result !== "ok") {
      throw new ApiError(500, "Failed to delete product image");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw new ApiError(500, "Failed to delete product image");
  }
  const result = await prisma.product.delete({
    where: {
      id,
    },
  });
  return result;
};

export const ProductService = {
  create,
  getAllOrFilter,
  getById,
  updateById,
  deleteById,
};
