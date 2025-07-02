import { Prisma, ProductCategory } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { IGenericResponse } from "../../../interfaces/common";
import { paginationHelpers } from "../../../helpers/paginationHelper";
import { IPaginationOptions } from "../../../interfaces/pagination";
import { ICategoryFilterRequest } from "./category.interfaces";
import { CategorySearchAbleFields } from "./category.constants";

const create = async (payload: Prisma.ProductCategoryCreateInput) => {
  const result = await prisma.productCategory.create({
    data: payload,
  });
  return result;
};

const getAllOrFilter = async (
  filters: ICategoryFilterRequest,
  options: IPaginationOptions,
): Promise<IGenericResponse<ProductCategory[]>> => {
  const { page, limit, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filtersData } = filters;

  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      OR: CategorySearchAbleFields.map(field => ({
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

  const whereConditions: Prisma.ProductCategoryWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.productCategory.findMany({
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

  const total = await prisma.productCategory.count({ where: whereConditions });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getNavbarCategory = async () => {
  const result = await prisma.productCategory.findMany({
    include: {
      productSubcategory: true,
      brands: {
        include: {
          brand: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // const total = await prisma.productCategory.count();
  return result;
};

const getById = async (id: string) => {
  const result = await prisma.productCategory.findUnique({
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
  const result = await prisma.productCategory.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  const result = await prisma.productCategory.delete({
    where: {
      id,
    },
  });
  return result;
};

export const CategoryService = {
  create,
  getAllOrFilter,
  getById,
  updateById,
  deleteById,
  getNavbarCategory,
};
