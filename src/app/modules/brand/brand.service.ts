// import { Brand, Prisma } from "@prisma/client";
// import prisma from "../../../shared/prisma";
// import { IBrandFilterRequest } from "./brand.interfaces";
// import { IPaginationOptions } from "../../../interfaces/pagination";
// import { IGenericResponse } from "../../../interfaces/common";
// import { paginationHelpers } from "../../../helpers/paginationHelper";
// import { BrandSearchAbleFields } from "./brand.constants";

// const create = async (payload: Prisma.BrandCreateInput) => {
//   const result = await prisma.brand.create({
//     data: payload,
//   });
//   return result;
// };

// const getAllOrFilter = async (
//   filters: IBrandFilterRequest,
//   options: IPaginationOptions,
// ): Promise<IGenericResponse<Brand[]>> => {
//   const { page, limit, skip } = paginationHelpers.calculatePagination(options);
//   const { searchTerm, ...filtersData } = filters;

//   const andConditions = [];
//   if (searchTerm) {
//     andConditions.push({
//       OR: BrandSearchAbleFields.map(field => ({
//         [field]: {
//           contains: searchTerm,
//           mode: "insensitive",
//         },
//       })),
//     });
//   }

//   if (Object.keys(filtersData).length > 0) {
//     andConditions.push({
//       AND: Object.keys(filtersData).map(key => ({
//         [key]: {
//           // eslint-disable-next-line @typescript-eslint/no-explicit-any
//           equals: (filtersData as any)[key],
//         },
//       })),
//     });
//   }

//   const whereConditions: Prisma.BrandWhereInput =
//     andConditions.length > 0 ? { AND: andConditions } : {};

//   const result = await prisma.brand.findMany({
//     where: whereConditions,
//     skip,
//     take: limit,
//     orderBy:
//       options.sortBy && options.sortOrder
//         ? {
//             [options.sortBy]: options.sortOrder,
//           }
//         : { createdAt: "desc" },
//   });

//   const total = await prisma.brand.count({ where: whereConditions });

//   return {
//     meta: {
//       page,
//       limit,
//       total,
//     },
//     data: result,
//   };
// };

// const getById = async (id: string) => {
//   const result = await prisma.brand.findUnique({
//     where: {
//       id,
//     },
//   });
//   return result;
// };

// const updateById = async (id: string, payload: Prisma.BrandUpdateInput) => {
//   const result = await prisma.brand.update({
//     where: {
//       id,
//     },
//     data: payload,
//   });
//   return result;
// };

// const deleteById = async (id: string) => {
//   const result = await prisma.brand.delete({
//     where: {
//       id,
//     },
//   });
//   return result;
// };

// export const BrandService = {
//   create,
//   getAllOrFilter,
//   getById,
//   updateById,
//   deleteById,
// };

import { Brand, Prisma } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { IBrandFilterRequest } from "./brand.interfaces";
import { IPaginationOptions } from "../../../interfaces/pagination";
import { IGenericResponse } from "../../../interfaces/common";
import { paginationHelpers } from "../../../helpers/paginationHelper";
import { BrandSearchAbleFields } from "./brand.constants";

// Update create function to handle multiple categories
const create = async (
  payload: Prisma.BrandCreateInput & { categories?: string[] },
) => {
  const { categories, ...brandData } = payload;

  const result = await prisma.brand.create({
    data: {
      ...brandData,
      categories:
        categories && categories.length > 0
          ? {
              create: categories.map(categoryId => ({
                category: { connect: { id: categoryId } },
              })),
            }
          : undefined,
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  });

  return result;
};

// Update getAllOrFilter to include categories
const getAllOrFilter = async (
  filters: IBrandFilterRequest,
  options: IPaginationOptions,
): Promise<IGenericResponse<Brand[]>> => {
  const { page, limit, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filtersData } = filters;
  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: BrandSearchAbleFields.map(field => ({
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

  const whereConditions: Prisma.BrandWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.brand.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : { createdAt: "desc" },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  });

  const total = await prisma.brand.count({ where: whereConditions });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// Update getById to include categories
const getById = async (id: string) => {
  const result = await prisma.brand.findUnique({
    where: {
      id,
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  });
  return result;
};

// Update updateById to handle multiple categories
const updateById = async (
  id: string,
  payload: Prisma.BrandUpdateInput & { categories?: string[] },
) => {
  const { categories, ...brandData } = payload;

  const result = await prisma.brand.update({
    where: {
      id,
    },
    data: {
      ...brandData,
      categories: categories
        ? {
            // Remove existing category relationships
            deleteMany: {},
            // Create new category relationships
            create: categories.map(categoryId => ({
              category: { connect: { id: categoryId } },
            })),
          }
        : undefined,
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  });

  return result;
};

// Delete remains the same
const deleteById = async (id: string) => {
  const result = await prisma.brand.delete({
    where: {
      id,
    },
  });
  return result;
};

export const BrandService = {
  create,
  getAllOrFilter,
  getById,
  updateById,
  deleteById,
};
