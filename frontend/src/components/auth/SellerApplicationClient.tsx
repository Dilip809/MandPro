"use client";

import SellerApplicationForm from "@/features/seller-applications/components/SellerApplicationForm";
import SellerApplicationStatus from "@/features/seller-applications/components/SellerApplicationStatus";
import { useGetMySellerApplicationQuery } from "@/features/seller-applications/sellerApplicationApi";

export default function SellerApplicationClient() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMySellerApplicationQuery();

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p>Loading your seller application...</p>
      </main>
    );
  }

  if (isError) {
    const message =
      typeof error === "object" &&
      error !== null &&
      "data" in error &&
      typeof error.data === "object" &&
      error.data !== null &&
      "message" in error.data &&
      typeof error.data.message === "string"
        ? error.data.message
        : "Unable to load your seller application.";

    return (
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-12">
        <p role="alert">{message}</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-lg border border-border px-4 py-2"
        >
          Try again
        </button>
      </main>
    );
  }

  const application = data?.data.application;

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">
          Become a Mandipro seller
        </h1>
        <p className="text-(--muted-foreground)">
          Tell us about your business to apply for seller access.
        </p>
      </header>

      {application && (
        <SellerApplicationStatus application={application} />
      )}

      {(!application || application.status === "REJECTED") && (
        <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
          <h2 className="text-xl font-semibold">
            {application
              ? "Resubmit your application"
              : "Business details"}
          </h2>
          <SellerApplicationForm />
        </section>
      )}
    </main>
  );
}