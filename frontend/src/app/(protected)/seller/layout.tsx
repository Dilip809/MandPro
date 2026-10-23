import type { ReactNode } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// export const instant = false;

export default function SellerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute requiredPermission="seller">
      {children}
    </ProtectedRoute>
  );
}