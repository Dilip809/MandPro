import { Types } from "mongoose";
import type { RequestHandler } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import HttpError from "../utils/HttpError.js";
import Product from "../models/Product.js";
import type { CreateProductInput, UpdateProductInput, UpdateProductStatusInput } from "../validators/productValidator.js";
import {
    PRODUCT_UNITS,
    type ProductUnit,
} from "../models/Product.js";

export const createProduct: RequestHandler = asyncHandler(
    async (req, res) => {
        const authUser = req.authUser;

        if (!authUser) {
            throw new HttpError(401, "Authentication required");
        }

        const input = req.body as CreateProductInput;

        const product = await Product.create({
            name: input.name,

            // With exactOptionalPropertyTypes, omit absent optional fields.
            ...(input.description !== undefined
                ? { description: input.description }
                : {}),

            category: input.category,
            unit: input.unit,
            price: input.price,
            stockQuantity: input.stockQuantity,

            // Convert the authenticated user's ID to a MongoDB ObjectId.
            sellerId: new Types.ObjectId(authUser.id),

            // The client cannot choose the initial status.
            status: "DRAFT",
        });

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: {
                product: {
                    id: product._id.toString(),
                    sellerId: product.sellerId.toString(),
                    name: product.name,
                    description: product.description,
                    category: product.category,
                    unit: product.unit,
                    price: product.price,
                    stockQuantity: product.stockQuantity,
                    status: product.status,
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt,
                },
            },
        });
    }
);

// Public: list active products
export const getProducts: RequestHandler = asyncHandler(
    async (req, res) => {
        const pageParam =
            typeof req.query.page === "string" ? req.query.page : undefined;

        const limitParam =
            typeof req.query.limit === "string" ? req.query.limit : undefined;

        const categoryParam =
            typeof req.query.category === "string"
                ? req.query.category.trim()
                : undefined;

        const unitParam =
            typeof req.query.unit === "string" ? req.query.unit : undefined;

        const page = pageParam === undefined ? 1 : Number(pageParam);
        const limit = limitParam === undefined ? 12 : Number(limitParam);

        if (
            !Number.isInteger(page) ||
            page < 1 ||
            !Number.isInteger(limit) ||
            limit < 1 ||
            limit > 50
        ) {
            throw new HttpError(
                400,
                "Page must be a positive integer and limit must be between 1 and 50"
            );
        }

        if (
            categoryParam !== undefined &&
            (categoryParam.length < 2 || categoryParam.length > 100)
        ) {
            throw new HttpError(
                400,
                "Category must contain between 2 and 100 characters"
            );
        }

        if (
            unitParam !== undefined &&
            !(PRODUCT_UNITS as readonly string[]).includes(unitParam)
        ) {
            throw new HttpError(400, "Invalid product unit");
        }

        const filter: {
            status: "ACTIVE";
            category?: string;
            unit?: ProductUnit;
        } = {
            status: "ACTIVE",
        };

        if (categoryParam) {
            filter.category = categoryParam;
        }

        if (unitParam) {
            filter.unit = unitParam as ProductUnit;
        }

        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort({ createdAt: -1, _id: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            Product.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            data: {
                products: products.map((product) => ({
                    id: product._id.toString(),
                    name: product.name,
                    description: product.description,
                    category: product.category,
                    unit: product.unit,
                    price: product.price,
                    stockQuantity: product.stockQuantity,
                    createdAt: product.createdAt,
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    }
);


// Private: list products of the authenticated seller
export const getMyProducts: RequestHandler = asyncHandler(
  async (req, res) => {
    const authUser = req.authUser;

    if (!authUser) {
      throw new HttpError(401, "Authentication required");
    }

    const pageParam =
      typeof req.query.page === "string" ? req.query.page : undefined;

    const limitParam =
      typeof req.query.limit === "string" ? req.query.limit : undefined;

    const page = pageParam === undefined ? 1 : Number(pageParam);
    const limit = limitParam === undefined ? 12 : Number(limitParam);

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 50
    ) {
      throw new HttpError(
        400,
        "Page must be a positive integer and limit must be between 1 and 50"
      );
    }

    const sellerId = new Types.ObjectId(authUser.id);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ sellerId })
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Product.countDocuments({ sellerId }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        products: products.map((product) => ({
          id: product._id.toString(),
          name: product.name,
          description: product.description,
          category: product.category,
          unit: product.unit,
          price: product.price,
          stockQuantity: product.stockQuantity,
          status: product.status,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  }
);


// Private: update a product of the authenticated seller
export const updateProduct: RequestHandler = asyncHandler(
  async (req, res) => {
    const authUser = req.authUser;

    if (!authUser) {
      throw new HttpError(401, "Authentication required");
    }

    const productId = req.params.id;

    if (
      typeof productId !== "string" ||
      !Types.ObjectId.isValid(productId)
    ) {
      throw new HttpError(400, "Invalid product ID");
    }

    const input = req.body as UpdateProductInput;

    const product = await Product.findOneAndUpdate(
      {
        _id: new Types.ObjectId(productId),
        sellerId: new Types.ObjectId(authUser.id),
      },
      {
        $set: input,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      throw new HttpError(404, "Product not found");
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: {
        product: {
          id: product._id.toString(),
          sellerId: product.sellerId.toString(),
          name: product.name,
          description: product.description,
          category: product.category,
          unit: product.unit,
          price: product.price,
          stockQuantity: product.stockQuantity,
          status: product.status,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      },
    });
  }
);


// Private: update status of the authenticated seller's product
export const updateProductStatus: RequestHandler = asyncHandler(
  async (req, res) => {
    const authUser = req.authUser;

    if (!authUser) {
      throw new HttpError(401, "Authentication required");
    }

    const productId = req.params.id;

    if (
      typeof productId !== "string" ||
      !Types.ObjectId.isValid(productId)
    ) {
      throw new HttpError(400, "Invalid product ID");
    }

    const { status } = req.body as UpdateProductStatusInput;

    const product = await Product.findOne({
      _id: new Types.ObjectId(productId),
      sellerId: new Types.ObjectId(authUser.id),
    });

    if (!product) {
      throw new HttpError(404, "Product not found");
    }

    if (product.status === "ARCHIVED") {
      throw new HttpError(
        400,
        "Restore the archived product before changing its status"
      );
    }

    product.status = status;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product status updated successfully",
      data: {
        product: {
          id: product._id.toString(),
          sellerId: product.sellerId.toString(),
          name: product.name,
          status: product.status,
          updatedAt: product.updatedAt,
        },
      },
    });
  }
);

// Restore an archived product to DRAFT
export const restoreProduct: RequestHandler = asyncHandler(
  async (req, res) => {
    const authUser = req.authUser;

    if (!authUser) {
      throw new HttpError(401, "Authentication required");
    }

    const productId = req.params.id;

    if (
      typeof productId !== "string" ||
      !Types.ObjectId.isValid(productId)
    ) {
      throw new HttpError(400, "Invalid product ID");
    }

    const product = await Product.findOne({
      _id: new Types.ObjectId(productId),
      sellerId: new Types.ObjectId(authUser.id),
    });

    if (!product) {
      throw new HttpError(404, "Product not found");
    }

    if (product.status !== "ARCHIVED") {
      throw new HttpError(
        400,
        "Only archived products can be restored"
      );
    }

    product.status = "DRAFT";
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product restored to draft successfully",
      data: {
        product: {
          id: product._id.toString(),
          sellerId: product.sellerId.toString(),
          name: product.name,
          status: product.status,
          updatedAt: product.updatedAt,
        },
      },
    });
  }
);
