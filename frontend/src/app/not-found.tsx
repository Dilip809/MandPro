
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-md space-y-4 text-center">
        <p className="text-sm font-semibold text-primary">
          404 — Page not found
        </p>

        <h1 className="text-3xl font-bold">
          We couldn&apos;t find that page
        </h1>

        <p className="text-text-muted">
          The page may have moved, or the address may be incorrect.
        </p>

        <Link
          href="/"
          className="inline-flex rounded-lg bg-primary px-5 py-2.5 font-medium text-white transition hover:bg-primary-hover"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
