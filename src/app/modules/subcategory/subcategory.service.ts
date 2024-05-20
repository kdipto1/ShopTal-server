import { Prisma, ProductSubcategory } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { IGenericResponse } from "../../../interfaces/common";
import { paginationHelpers } from "../../../helpers/paginationHelper";
import { IPaginationOptions } from "../../../interfaces/pagination";

import { ISubcategoryFilterRequest } from "./subcategory.interfaces";
import { SubcategorySearchAbleFields } from "./subcategory.constants";

const create = async (payload: Prisma.ProductSubcategoryCreateInput) => {
  const result = await prisma.productSubcategory.create({
    data: payload,
  });
  return result;
};

const getAllOrFilter = async (
  filters: ISubcategoryFilterRequest,
  options: IPaginationOptions,
): Promise<IGenericResponse<ProductSubcategory[]>> => {
  const { page, limit, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filtersData } = filters;

  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      OR: SubcategorySearchAbleFields.filter(
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

  const whereConditions: Prisma.ProductSubcategoryWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.productSubcategory.findMany({
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

  const total = await prisma.productSubcategory.count({
    where: whereConditions,
  });

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
  const result = await prisma.productSubcategory.findUnique({
    where: {
      id,
    },
  });
  return result;
};

const updateById = async (
  id: string,
  payload: Prisma.ProductSubcategoryUpdateInput,
) => {
  const result = await prisma.productSubcategory.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  const result = await prisma.productSubcategory.delete({
    where: {
      id,
    },
  });
  return result;
};

export const SubcategoryService = {
  create,
  getAllOrFilter,
  getById,
  updateById,
  deleteById,
};
