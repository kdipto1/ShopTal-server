import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import pick from "../../../shared/pick";
import { ProductFilterAbleFields } from "./product.constants";
import { ProductService } from "./product.service";
import * as formidable from "formidable";
import cloudinary from "../../../config/cloudinaryConfig";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiError";

const create = catchAsync(async (req: Request, res: Response) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return sendResponse(res, {
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Error parsing form data",
      });
    }

    const file = files.file;
    if (!file || !Array.isArray(file) || file.length === 0) {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: "No file uploaded",
      });
    }
    const uploadedFile = file[0];
    let name, price, quantity, features, brandId, categoryId, subcategoryId;
    if (
      fields?.name &&
      fields?.price &&
      fields?.quantity &&
      fields?.features &&
      fields?.brandId &&
      fields?.categoryId &&
      fields?.subcategoryId
    ) {
      name = fields.name[0];
      price = Number(fields.price[0]);
      quantity = Number(fields.quantity[0]);

      features = JSON.parse(fields.features[0]);
      brandId = fields.brandId[0];
      categoryId = fields.categoryId[0];
      subcategoryId = fields.subcategoryId[0];
    }
    if (
      !name ||
      !price ||
      !quantity ||
      !brandId ||
      !categoryId ||
      !subcategoryId
    ) {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: "Missing required fields",
      });
    }

    try {
      const uploadResult = await cloudinary.uploader.upload(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (uploadedFile as any).filepath,
        {
          folder: "shoptal",
          format: "webp",
        },
      );
      const imageUrl = uploadResult.url;

      try {
        const brand = await prisma.brand.findFirst({
          where: { id: brandId },
        });

        if (!brand) {
          throw new ApiError(httpStatus.NOT_FOUND, "Brand not found");
        }
        const category = await prisma.productCategory.findFirst({
          where: { id: categoryId },
        });

        if (!category) {
          throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
        }

        const subcategory = await prisma.productSubcategory.findFirst({
          where: { id: subcategoryId },
        });

        if (!subcategory) {
          throw new ApiError(httpStatus.NOT_FOUND, "Subcategory not found");
        }

        const payload = {
          name,
          price,
          quantity,
          brandId,
          image: imageUrl,
          features,
          categoryId,
          subcategoryId,
        };
        const result = await ProductService.create(payload);

        sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: "Product Created Successfully!",
          data: result,
        });
      } catch (error) {
        if (error) {
          cloudinary.uploader.destroy(uploadResult.public_id);
        }
        sendResponse(res, {
          statusCode: httpStatus.INTERNAL_SERVER_ERROR,
          success: false,
          message: "Error creating product",
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      sendResponse(res, {
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Error uploading file",
      });
    }
  });
});

// const create = catchAsync(async (req: Request, res: Response) => {
//   const result = await ProductService.create(req, res);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Product Created Successfully!",
//     data: result,
//   });
// });

const getAllOrFilter = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ProductFilterAbleFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await ProductService.getAllOrFilter(filters, options);
  // console.log(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product's Retrieved Successfully!",
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.getById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product Retrieved Successfully!",
    data: result,
  });
});

const updateById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.updateById(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product Updated Successfully!",
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.deleteById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product Deleted Successfully!",
    data: result,
  });
});

export const ProductController = {
  create,
  getAllOrFilter,
  getById,
  updateById,
  deleteById,
};
