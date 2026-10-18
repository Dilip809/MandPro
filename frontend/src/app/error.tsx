
"use client";

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold">
          Something went wrong
        </h1>

        <p className="text-text-muted">
          We couldn&apos;t load this page. Please try again.
        </p>

        {error.digest && (
          <p className="text-xs text-text-muted">
            Reference: {error.digest}
          </p>
        )}

        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-primary px-5 py-2.5 font-medium text-white transition hover:bg-primary-hover"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
