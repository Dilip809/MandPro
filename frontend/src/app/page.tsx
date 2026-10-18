
import CurrentYear from "@/components/ui/CurrentYear";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-primary"
          >
            Mandipro
          </Link>

          <nav
            aria-label="Main navigation"
            className="flex items-center gap-3 sm:gap-5"
          >
            <a
              href="/products"
              className="hidden text-sm text-text-muted transition hover:text-foreground sm:inline"
            >
              Products
            </a>

            <a
              href="/login"
              className="text-sm font-medium transition hover:text-primary"
            >
              Login
            </a>

            <ThemeToggle />
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-28">
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
            <a
              href="/products"
              className="rounded-lg bg-primary px-5 py-3 font-semibold text-white transition hover:opacity-90"
            >
              Explore products
            </a>

            <a
              href="/register"
              className="rounded-lg border border-border bg-surface px-5 py-3 font-semibold transition hover:bg-surface-muted"
            >
              Create an account
            </a>
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
            <li className="flex gap-3">
              <span className="text-primary" aria-hidden="true">✓</span>
              Discover available produce and pricing.
            </li>
            <li className="flex gap-3">
              <span className="text-primary" aria-hidden="true">✓</span>
              Manage your account and orders.
            </li>
            <li className="flex gap-3">
              <span className="text-primary" aria-hidden="true">✓</span>
              Build toward a trusted multi-seller marketplace.
            </li>
          </ul>
        </div>
      </section>

      <footer className="mt-auto border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-6 text-sm text-text-muted sm:px-8">
          {/* © {new Date().getFullYear()} Mandipro. Fresh supply, simpler business. */}
          © <CurrentYear /> Mandipro. Fresh supply, simpler business.
        </div>
      </footer>
    </main>
  );
}
