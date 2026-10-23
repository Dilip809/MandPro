
import type { AuthUser } from "./types";
import {
  canAccessSellerFeatures,
} from "./permissions";

export function getPostLoginPath(user: AuthUser): string {
  switch (user.role) {
    case "ADMIN":
      return "/admin/dashboard";

    case "DELIVERY_AGENT":
      return "/delivery/dashboard";

    case "SUPPORT_AGENT":
      return "/support/dashboard";

    case "SELLER":
      return "/seller/dashboard";

    case "CUSTOMER":
      return canAccessSellerFeatures(user)
        ? "/seller/dashboard"
        : "/";
  }
}
