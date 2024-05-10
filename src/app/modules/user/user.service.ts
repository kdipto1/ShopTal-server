/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma, User } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../../interfaces/pagination";
import { IUserFilterRequest } from "./user.interfaces";
import { paginationHelpers } from "../../../helpers/paginationHelper";
import { UserSearchAbleFields } from "./user.constants";
import { IGenericResponse } from "../../../interfaces/common";
import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";

const getAllOrFilter = async (
  filters: IUserFilterRequest,
  options: IPaginationOptions,
): Promise<IGenericResponse<Partial<User>[]>> => {
  const { page, limit, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, phone, ...filtersData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: UserSearchAbleFields.filter(
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

  // if (phone) {
  //   andConditions.push({
  //     contactNo: {
  //       equals: Number(phone),
  //     },
  //   });
  // }

  if (Object.keys(filtersData).length > 0) {
    andConditions.push({
      AND: Object.keys(filtersData).map(key => ({
        [key]: {
          equals: (filtersData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.user.findMany({
    where: whereConditions,
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      phone: true,
      address: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : { createdAt: "desc" },
  });

  const total = await prisma.user.count({ where: whereConditions });
  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getById = async (id: string) => {
  const result = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  });
  return result;
};

const getUserProfile = async (userId: string) => {
  const result = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      first_name: true,
      address: true,
    },
  });
  return result;
};

const updateById = async (id: string, payload: Partial<User>) => {
  const result = await prisma.user.update({
    where: {
      id,
    },
    data: payload,
  });
  if (!result) throw new ApiError(httpStatus.NOT_MODIFIED, "Failed to update");
  return result;
};

const deleteById = async (id: string) => {
  const result = await prisma.user.delete({
    where: {
      id,
    },
  });
  if (!result) throw new ApiError(httpStatus.NOT_MODIFIED, "Failed to delete");
  return result;
};

export const UserService = {
  getAllOrFilter,
  getById,
  updateById,
  deleteById,
  getUserProfile,
};
