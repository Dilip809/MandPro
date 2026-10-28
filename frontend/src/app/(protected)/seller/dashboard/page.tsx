
// export const instant = false;

import Link from "next/link";

export default function SellerDashboardPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
      <h1 className="text-2xl font-bold">Seller Dashboard</h1>
      <p className="mt-2 text-text-muted">
        Manage your products, track orders, monitor sales, and update your
        seller profile.
      </p>
      <div className="mt-6">
        <Link
          href="/seller/products"
          className="inline-flex rounded-lg bg-primary px-5 py-3 font-medium text-white"
        >
          Manage Products
        </Link>
      </div>
    </section>
  );
}
