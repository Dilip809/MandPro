import { z } from "zod";
import { PRODUCT_UNITS } from "../models/Product.js";

export const createProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Product name must contain at least 2 characters")
      .max(150, "Product name cannot exceed 150 characters"),

    description: z
      .string()
      .trim()
      .max(2000, "Description cannot exceed 2000 characters")
      .optional(),

    category: z
      .string()
      .trim()
      .min(2, "Category must contain at least 2 characters")
      .max(100, "Category cannot exceed 100 characters"),

    unit: z.enum(PRODUCT_UNITS),

    price: z
      .number()
      .finite()
      .positive("Price must be greater than zero"),

    stockQuantity: z
      .number()
      .finite()
      .min(0, "Stock quantity cannot be negative"),
  })
  .strict();

export type CreateProductInput = z.infer<
  typeof createProductSchema
>;