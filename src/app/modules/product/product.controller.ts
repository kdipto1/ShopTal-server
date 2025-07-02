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
    let name,
      price,
      quantity,
      // features,
      brandId,
      categoryId,
      subcategoryId,
      description;
    if (
      fields?.name &&
      fields?.price &&
      fields?.quantity &&
      // fields?.features &&
      fields?.brandId &&
      fields?.categoryId &&
      fields?.subcategoryId &&
      fields?.description
    ) {
      name = fields.name[0];
      price = Number(fields.price[0]);
      quantity = Number(fields.quantity[0]);

      // features = JSON.parse(fields.features[0]);
      brandId = fields.brandId[0];
      categoryId = fields.categoryId[0];
      // subcategoryId = fields.subcategoryId[0];
      subcategoryId = fields.subcategoryId[0];
      description = fields.description[0];
    }
    if (
      !name ||
      !price ||
      !quantity ||
      !brandId ||
      !categoryId ||
      !description
      // !subcategoryId
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

        let payload;

        if (subcategoryId) {
          const subcategory = await prisma.productSubcategory.findFirst({
            where: { id: subcategoryId },
          });

          if (!subcategory) {
            throw new ApiError(httpStatus.NOT_FOUND, "Subcategory not found");
          }
          payload = {
            name,
            price,
            quantity,
            brandId,
            image: imageUrl,
            // features,
            categoryId,
            subcategoryId,
            description,
          };
        } else {
          payload = {
            name,
            price,
            quantity,
            brandId,
            image: imageUrl,
            // features,
            categoryId,
            description,
          };
        }
        const result = await ProductService.create(payload);

        sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: "Product Created Successfully!",
          data: result,
        });
      } catch (error) {
        console.log(error);
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

    let name,
      price,
      quantity,
      // features,
      brandId,
      categoryId,
      subcategoryId,
      existingImage,
      description;
    let imageUrl;

    // Parse form fields
    if (
      fields?.name &&
      fields?.price &&
      fields?.quantity &&
      // fields?.features &&
      fields?.brandId &&
      fields?.categoryId &&
      fields?.subcategoryId &&
      fields?.description
    ) {
      name = fields.name[0];
      price = Number(fields.price[0]);
      quantity = Number(fields.quantity[0]);
      // features = JSON.parse(fields.features[0]);
      brandId = fields.brandId[0];
      categoryId = fields.categoryId[0];
      subcategoryId = fields.subcategoryId[0];
      description = fields.description[0];

      // Check if existing image is being kept
      existingImage = fields.existingImage ? fields.existingImage[0] : null;
    }

    // Validate required fields
    if (
      !name ||
      !price ||
      !quantity ||
      !brandId ||
      !categoryId ||
      !description
    ) {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: "Missing required fields",
      });
    }

    try {
      // Check if a new file is uploaded
      const file = files.file;
      let uploadResult;

      if (file && Array.isArray(file) && file.length > 0) {
        // Upload new image
        uploadResult = await cloudinary.uploader.upload(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (file[0] as any).filepath,
          {
            folder: "shoptal",
            format: "webp",
          },
        );
        imageUrl = uploadResult.url;
      } else if (existingImage) {
        // Keep existing image
        imageUrl = existingImage;
      } else {
        return sendResponse(res, {
          statusCode: httpStatus.BAD_REQUEST,
          success: false,
          message: "No image provided",
        });
      }

      // Validate related entities
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

        // Check if product exists
        const existingProduct = await prisma.product.findUnique({
          where: { id },
        });

        if (!existingProduct) {
          return sendResponse(res, {
            statusCode: httpStatus.NOT_FOUND,
            success: false,
            message: "Product not found",
          });
        }

        // Prepare payload for update

        let payload;
        if (subcategoryId) {
          const subcategory = await prisma.productSubcategory.findFirst({
            where: { id: subcategoryId },
          });
          if (!subcategory) {
            throw new ApiError(httpStatus.NOT_FOUND, "Subcategory not found");
          }
          payload = {
            name,
            price,
            quantity,
            brandId,
            image: imageUrl,
            // features,
            categoryId,
            subcategoryId,
            description,
          };
        } else {
          payload = {
            name,
            price,
            quantity,
            brandId,
            image: imageUrl,
            // features,
            categoryId,
            description,
          };
        }

        // Update product
        const result = await ProductService.updateById(id, payload);

        // If a new image was uploaded and there was a previous image, delete the old one
        if (uploadResult && existingProduct.image) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const existingImageUrl: any = existingProduct.image;
            const publicId = existingImageUrl.split("/").pop().split(".")[0];
            // Extract public ID from the existing image URL
            // const matches = existingProduct.image.match(/\/v\d+\/(.+)\.\w+$/);
            // if (matches) {
            // const publicId = `shoptal/${matches[1]}`;
            await cloudinary.uploader.destroy(`shoptal/${publicId}`);
            // }
          } catch (deleteError) {
            console.error("Failed to delete old image:", deleteError);
          }
        }

        sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: "Product Updated Successfully!",
          data: result,
        });
      } catch (error) {
        // If there's an error during validation or update,
        // delete the newly uploaded image if it exists
        if (uploadResult) {
          await cloudinary.uploader.destroy(uploadResult.public_id);
        }

        sendResponse(res, {
          statusCode: httpStatus.INTERNAL_SERVER_ERROR,
          success: false,
          message:
            error instanceof ApiError
              ? error.message
              : "Error updating product",
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
