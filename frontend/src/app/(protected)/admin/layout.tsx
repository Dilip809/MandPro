
import type { ReactNode } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// export const instant = false;

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute requiredPermission="admin">
      {children}
    </ProtectedRoute>
  );
}
