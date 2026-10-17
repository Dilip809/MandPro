
import { z } from "zod";

export const rejectSellerApplicationSchema = z
  .object({
    rejectionReason: z
      .string()
      .trim()
      .min(5, "Rejection reason must be at least 5 characters")
      .max(1000, "Rejection reason cannot exceed 1000 characters"),
  })
  .strict();

export type RejectSellerApplicationInput = z.infer<
  typeof rejectSellerApplicationSchema
>;
