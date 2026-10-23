import type { ReactNode } from "react";
import GuestOnlyRoute from "@/components/auth/GuestOnlyRoute";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <GuestOnlyRoute>
      <main className="min-h-screen bg-background text-foreground">
        {children}
      </main>
    </GuestOnlyRoute>
  );
}