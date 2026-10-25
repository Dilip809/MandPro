
// export const instant = false;

import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="mt-2 text-text-muted">
        Manage seller applications, users, and marketplace operations.
      </p>
      <div className="mt-6">
  <Link
    href="/admin/seller-applications"
    className="inline-flex items-center rounded-lg border border-border px-4 py-3 font-medium transition-colors hover:bg-surface"
  >
    Review seller applications →
  </Link>
</div>
    </section>
  );
}
