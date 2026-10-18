
import type { CustomerType } from "@/features/auth/types";

export type SellerApplicationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface CreateSellerApplicationInput {
  businessName: string;
  businessType: CustomerType;
  businessAddress: string;
  contactPhone: string;
}

export interface SellerApplication {
  _id?: string;
  id?: string;
  userId?: string;
  businessName: string;
  businessType: CustomerType;
  businessAddress: string;
  contactPhone: string;
  status: SellerApplicationStatus;
  rejectionReason?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SellerApplicationResponse {
  success: boolean;
  message?: string;
  data: {
    application: SellerApplication;
  };
}

export interface MySellerApplicationResponse {
  success: boolean;
  message?: string;
  data: {
    application: SellerApplication | null;
  };
}
