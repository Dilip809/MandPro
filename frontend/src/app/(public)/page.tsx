
import Link from "next/link";

export default function HomePage() {
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-28">
      <div>
        <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary">
          Wholesale fresh produce
        </span>

        <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Fresh vegetables for your business.
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-8 text-text-muted">
          A simpler way for restaurants, hotels, caterers, and food
          businesses to source fresh produce from trusted suppliers.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/products"
            className="rounded-lg bg-primary px-5 py-3 font-semibold text-white transition hover:opacity-90"
          >
            Explore products
          </Link>

          <Link
            href="/register"
            className="rounded-lg border border-border bg-surface px-5 py-3 font-semibold transition hover:bg-surface-muted"
          >
            Create an account
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm sm:p-10">
        <p className="text-sm font-medium text-primary">
          Built for business buyers
        </p>

        <h2 className="mt-3 text-2xl font-semibold">
          Your produce supply, organized.
        </h2>

        <ul className="mt-6 space-y-4 text-text-muted">
          <li>✓ Discover available produce and pricing.</li>
          <li>✓ Manage your account and orders.</li>
          <li>✓ Build toward a trusted multi-seller marketplace.</li>
        </ul>
      </div>
    </section>
  );
}
