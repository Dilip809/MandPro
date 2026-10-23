
import type { ReactNode } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import ClientProtectedRoute from "@/components/auth/ClientProtectedRoute";

export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <MainLayout>
      <ClientProtectedRoute>{children}</ClientProtectedRoute>
    </MainLayout>
  );
}
