
"use client";

import Link from "next/link";

import type { SellerApplication } from "../types";

interface Props {
  application: SellerApplication;
}

export default function SellerApplicationStatus({ application }: Props) {
  const isPending = application.status === "PENDING";
  const isApproved = application.status === "APPROVED";

  return (
    <section className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div>
        <p className="text-sm text-[var(--muted-foreground)]">
          Seller application status
        </p>

        <h2 className="mt-1 text-xl font-semibold">
          {isPending
            ? "Application under review"
            : isApproved
              ? "Seller application approved"
              : "Application rejected"}
        </h2>
      </div>

      <p className="text-sm text-[var(--muted-foreground)]">
        Business: {application.businessName}
      </p>

      <p>
        {isPending
          ? "Your application is waiting for an administrator's decision."
          : isApproved
            ? "Your application has been approved. You can continue to the seller workspace."
            : "You can review your application details and submit it again after addressing the rejection."}
      </p>

      {application.status === "REJECTED" &&
        application.rejectionReason && (
          <div className="rounded-lg border border-red-200 p-3">
            <p className="font-medium">Reason for rejection</p>
            <p className="mt-1 text-sm">{application.rejectionReason}</p>
          </div>
        )}

      {isApproved && (
        <Link
          href="/seller/dashboard"
          className="inline-flex rounded-lg bg-green-700 px-4 py-2 font-semibold text-white"
        >
          Continue to seller dashboard
        </Link>
      )}
    </section>
  );
}
