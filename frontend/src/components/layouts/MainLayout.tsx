
import type { ReactNode } from "react";
import Header from "@/components/layouts/headers/Header";
import Footer from "@/components/layouts/Footer";

export default function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}
