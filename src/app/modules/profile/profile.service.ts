import { Prisma } from "@prisma/client";
import prisma from "../../../shared/prisma";

const getById = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  return result;
};

const updateById = async (id: string, payload: Prisma.UserUpdateInput) => {
  const result = await prisma.user.update({
    where: {
      id,
    },
    data: {
      address: payload.address,
      firstName: payload.firstName,
      lastName: payload.lastName,
    },
  });
  return result;
};

export const ProfileService = {
  getById,
  updateById,
};
