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

const sanitizeJson = (jsonString: string): string => {
  return jsonString
    .replace(/(\w+):/g, '"$1":')
    .replace(/:\s*([^",{}\[\]]+)/g, ': "$1"');
};

const create = catchAsync(async (req: Request, res: Response) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    console.log(fields, "+++++++++++++++++++++++");
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

    const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
    const price = Array.isArray(fields.price)
      ? parseFloat(fields.price[0])
      : parseFloat(fields.price as any);
    const quantity = Array.isArray(fields.quantity)
      ? parseInt(fields.quantity[0], 10)
      : parseInt(fields.quantity as any, 10);
    const brandName = Array.isArray(fields.brandName)
      ? fields.brandName[0]
      : fields.brandName;
    // const features = Array.isArray(fields.features)
    //   ? JSON.parse(fields.features[0])
    //   : JSON.parse(fields.features || "{}");
    const categoryId = Array.isArray(fields.categoryId)
      ? fields.categoryId[0]
      : fields.categoryId;
    const subcategoryId = Array.isArray(fields.subcategoryId)
      ? fields.subcategoryId[0]
      : fields.subcategoryId;

    let features;
    try {
      const rawFeatures = Array.isArray(fields.features)
        ? fields.features[0]
        : fields.features || "{}";
      const sanitizedFeatures = sanitizeJson(rawFeatures);
      features = JSON.parse(sanitizedFeatures);
    } catch (parseError) {
      console.error("Error parsing features JSON:", parseError);
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: "Invalid JSON format in features field",
      });
    }

    if (
      !name ||
      !price ||
      !quantity ||
      !brandName ||
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
        (uploadedFile as any).filepath,
        {
          folder: "shoptal",
        },
      );

      const imageUrl = uploadResult.url;

      try {
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
          brandName,
          image: imageUrl,
          features,
          categoryId,
          subcategoryId,
        };
        console.log(payload);
        const result = await ProductService.create(payload);

        sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: "Product Created Successfully!",
          data: result,
        });
      } catch (error) {
        console.error(error);
        sendResponse(res, {
          statusCode: httpStatus.INTERNAL_SERVER_ERROR,
          success: false,
          message: "Error creating product",
        });
      }
    } catch (error) {
      console.error(error);
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
