import type { ReactNode } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// export const instant = false;

export default function DeliveryLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute requiredPermission="delivery">
      {children}
    </ProtectedRoute>
  );
}