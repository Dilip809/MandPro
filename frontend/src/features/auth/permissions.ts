
import type { AuthUser } from "@/features/auth/types";

export type AppPermission =
  | "customer"
  | "seller"
  | "admin"
  | "delivery"
  | "support";

export function canAccessSellerFeatures(
  user: AuthUser | null | undefined,
): boolean {
  if (user?.status !== "ACTIVE") return false;

  return (
    user.role === "SELLER" ||
    (user.role === "CUSTOMER" &&
      user.sellerApprovalStatus === "APPROVED")
  );
}

export function canAccessCustomerFeatures(
  user: AuthUser | null | undefined,
): boolean {
  return (
    user?.status === "ACTIVE" &&
    (user.role === "CUSTOMER" || user.role === "SELLER")
  );
}

export function canAccessAdminFeatures(
  user: AuthUser | null | undefined,
): boolean {
  return user?.status === "ACTIVE" && user.role === "ADMIN";
}

export function canAccessDeliveryFeatures(
  user: AuthUser | null | undefined,
): boolean {
  return (
    user?.status === "ACTIVE" &&
    user.role === "DELIVERY_AGENT"
  );
}

export function canAccessSupportFeatures(
  user: AuthUser | null | undefined,
): boolean {
  return (
    user?.status === "ACTIVE" &&
    user.role === "SUPPORT_AGENT"
  );
}

export function hasPermission(
  user: AuthUser | null | undefined,
  permission: AppPermission,
): boolean {
  switch (permission) {
    case "customer":
      return canAccessCustomerFeatures(user);
    case "seller":
      return canAccessSellerFeatures(user);
    case "admin":
      return canAccessAdminFeatures(user);
    case "delivery":
      return canAccessDeliveryFeatures(user);
    case "support":
      return canAccessSupportFeatures(user);
    default:
      return false;
  }
}
