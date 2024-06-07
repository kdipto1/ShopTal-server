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
  const { searchTerm, ...filtersData } = filters;

  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      OR: ProductSearchAbleFields.filter(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        field => typeof filtersData[field] === "string",
      ).map(field => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
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
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  const product = await prisma.product.findFirstOrThrow({
    where: {
      id,
    },
  });
  const imageUrl: any = product.image;
  const publicId = imageUrl.split("/").pop().split(".")[0];
  try {
    const image = await cloudinary.uploader.destroy(`shoptal/${publicId}`);
    if (image.result !== "ok") {
      throw new ApiError(500, "Failed to delete product image");
    }
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
