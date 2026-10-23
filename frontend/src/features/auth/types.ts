
export const USER_ROLES = [
  "CUSTOMER",
  "SELLER",
  "ADMIN",
  "DELIVERY_AGENT",
  "SUPPORT_AGENT",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type UserStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "PENDING"
  | "REJECTED"
  | "INACTIVE";

export type SellerApprovalStatus =
  | "NOT_APPLIED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export type CustomerType =
  | "INDIVIDUAL"
  | "HOTEL_RESTAURANT"
  | "FOOD_STALL"
  | "CATERER"
  | "STREET_VENDOR"
  | "RETAIL_SHOP"
  | "WHOLESALER"
  | "OTHER_BUSINESS";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  customerType?: CustomerType;
  businessName?: string;
  role: UserRole;
  status: UserStatus;
  sellerApprovalStatus?: SellerApprovalStatus;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type CurrentUserResponse = ApiResponse<{
  user: AuthUser;
}>;
