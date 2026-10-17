
import { z } from "zod";
import { CUSTOMER_TYPES } from "../models/User.js";

export const createSellerApplicationSchema = z
  .object({
    businessName: z
      .string()
      .trim()
      .min(2, "Business name must be at least 2 characters")
      .max(150, "Business name cannot exceed 150 characters"),

    businessType: z.enum(CUSTOMER_TYPES),

    businessAddress: z
      .string()
      .trim()
      .min(5, "Business address must be at least 5 characters")
      .max(500, "Business address cannot exceed 500 characters"),

    contactPhone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),
  })
  .strict();

export type CreateSellerApplicationInput = z.infer<
  typeof createSellerApplicationSchema
>;
