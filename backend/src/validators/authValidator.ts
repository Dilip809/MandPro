
import { z } from "zod";
import { CUSTOMER_TYPES } from "../models/User.js";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters")
      .max(100, "Name cannot exceed 100 characters"),

    email: z
      .string()
      .trim()
      .email("Enter a valid email address")
      .max(254, "Email cannot exceed 254 characters")
      .transform((value) => value.toLowerCase()),

    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Enter a valid mobile number"),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .max(72, "Password cannot exceed 72 UTF-8 bytes")
      .refine(
        (value) => Buffer.byteLength(value, "utf8") <= 72,
        "Password cannot exceed 72 UTF-8 bytes"
      ),

    customerType: z.enum(CUSTOMER_TYPES),

    businessName: z
      .string()
      .trim()
      .min(2, "Business name must contain at least 2 characters")
      .max(150, "Business name cannot exceed 150 characters")
      .optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (
      data.customerType !== "INDIVIDUAL" &&
      !data.businessName
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["businessName"],
        message: "Business name is required for business accounts",
      });
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;
