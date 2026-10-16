import { Types } from "mongoose";
import type { RequestHandler } from "express";

import asyncHandler from "../utils/asyncHandler.js";
import HttpError from "../utils/HttpError.js";
import Product from "../models/Product.js";
import type { CreateProductInput } from "../validators/productValidator.js";

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