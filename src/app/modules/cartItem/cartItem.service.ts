import { CartItem, Prisma } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { IGenericResponse } from "../../../interfaces/common";
import { paginationHelpers } from "../../../helpers/paginationHelper";
import { IPaginationOptions } from "../../../interfaces/pagination";
import { CartItemSearchAbleFields } from "./cartItem.constants";
import { ICartItemFilterRequest } from "./cartItem.interfaces";

const create = async (payload: Prisma.CartItemCreateInput) => {
  const result = await prisma.cartItem.create({
    data: payload,
  });
  return result;
};

const getAllOrFilter = async (
  filters: ICartItemFilterRequest,
  options: IPaginationOptions,
): Promise<IGenericResponse<CartItem[]>> => {
  const { page, limit, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filtersData } = filters;

  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      OR: CartItemSearchAbleFields.map(field => ({
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

  const whereConditions: Prisma.CartItemWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.cartItem.findMany({
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

  const total = await prisma.cartItem.count({ where: whereConditions });

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
  const result = await prisma.cartItem.findUnique({
    where: {
      id,
    },
  });
  return result;
};

const updateById = async (id: string, payload: Prisma.CartItemUpdateInput) => {
  const result = await prisma.cartItem.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

const deleteById = async (id: string) => {
  const result = await prisma.cartItem.delete({
    where: {
      id,
    },
  });
  return result;
};

export const CartItemService = {
  create,
  getAllOrFilter,
  getById,
  updateById,
  deleteById,
};
