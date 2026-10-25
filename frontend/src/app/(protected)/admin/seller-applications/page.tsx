
"use client";

import { useState } from "react";
import Link from "next/link";

import {
  useApproveSellerApplicationMutation,
  useGetAdminSellerApplicationsQuery,
  useRejectSellerApplicationMutation,
} from "@/features/seller-applications/sellerApplicationApi";
import type {
  SellerApplication,
} from "@/features/seller-applications/types";

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = error.data;

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      return data.message;
    }
  }

  return "Something went wrong. Please try again.";
}

function getApplicationId(application: SellerApplication): string {
  return application._id ?? application.id ?? "";
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatBusinessType(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function AdminSellerApplicationsPage() {
  const {
    data,
    error: queryError,
    isLoading,
    isFetching,
    refetch,
  } = useGetAdminSellerApplicationsQuery();

  const [approveApplication, approveState] =
    useApproveSellerApplicationMutation();

  const [rejectApplication, rejectState] =
    useRejectSellerApplicationMutation();

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const applications = data?.data.applications ?? [];
  const pendingApplications = applications.filter(
    (application) => application.status === "PENDING",
  );

  async function handleApprove(application: SellerApplication) {
    const id = getApplicationId(application);

    if (!id) {
      setActionError("This application has no valid ID.");
      return;
    }

    const confirmed = window.confirm(
      `Approve the seller application for "${application.businessName}"?`,
    );

    if (!confirmed) return;

    setActionError(null);
    setActionSuccess(null);

    try {
      await approveApplication(id).unwrap();
      setActionSuccess(
        `Application for "${application.businessName}" approved successfully.`,
      );
      setRejectingId(null);
      setRejectionReason("");
    } catch (error: unknown) {
      setActionError(getErrorMessage(error));
    }
  }

  async function handleReject(application: SellerApplication) {
    const id = getApplicationId(application);
    const reason = rejectionReason.trim();

    if (!id) {
      setActionError("This application has no valid ID.");
      return;
    }

    if (!reason) {
      setActionError("Please enter a rejection reason.");
      return;
    }

    setActionError(null);
    setActionSuccess(null);

    try {
      await rejectApplication({
        id,
        rejectionReason: reason,
      }).unwrap();

      setActionSuccess(
        `Application for "${application.businessName}" rejected successfully.`,
      );
      setRejectingId(null);
      setRejectionReason("");
    } catch (error: unknown) {
      setActionError(getErrorMessage(error));
    }
  }

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
        <p role="status" className="text-text-muted">
          Loading seller applications...
        </p>
      </section>
    );
  }

  if (queryError && !data) {
    return (
      <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
        <h1 className="text-2xl font-bold">
          Seller applications
        </h1>
        <p role="alert" className="mt-4 text-red-600">
          {getErrorMessage(queryError)}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 rounded-lg border border-border px-4 py-2"
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/dashboard"
            className="text-sm text-text-muted hover:underline"
          >
            ← Admin dashboard
          </Link>
          <h1 className="mt-3 text-2xl font-bold">
            Seller applications
          </h1>
          <p className="mt-2 text-text-muted">
            Review applications and decide which applicants can sell on
            Mandipro.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="rounded-lg border border-border px-4 py-2 disabled:opacity-50"
        >
          {isFetching ? "Refreshing..." : "Refresh list"}
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-border p-4">
        <p className="text-sm text-text-muted">
          Pending applications
        </p>
        <p className="mt-1 text-3xl font-bold">
          {pendingApplications.length}
        </p>
      </div>

      {actionError && (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-red-300 p-3 text-red-700"
        >
          {actionError}
        </p>
      )}

      {actionSuccess && (
        <p
          role="status"
          className="mt-5 rounded-lg border border-green-300 p-3 text-green-700"
        >
          {actionSuccess}
        </p>
      )}

      {queryError && data && (
        <p role="alert" className="mt-4 text-amber-700">
          Could not refresh the list. Showing the last successfully loaded
          data.
        </p>
      )}

      {pendingApplications.length === 0 ? (
        <div className="mt-6 rounded-xl border border-border p-8 text-center">
          <h2 className="text-lg font-semibold">
            No pending applications
          </h2>
          <p className="mt-2 text-text-muted">
            New applications awaiting review will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5">
          {pendingApplications.map((application) => {
            const id = getApplicationId(application);
            const isRejecting = rejectingId === id;
            const isBusy =
              approveState.isLoading || rejectState.isLoading;

            return (
              <article
                key={id || application.businessName}
                className="rounded-xl border border-border p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="inline-flex rounded-full border border-amber-400 px-3 py-1 text-xs font-semibold">
                      Pending review
                    </span>
                    <h2 className="mt-3 text-xl font-semibold">
                      {application.businessName}
                    </h2>
                    <p className="mt-1 text-sm text-text-muted">
                      {formatBusinessType(application.businessType)}
                    </p>
                  </div>

                  <p className="text-sm text-text-muted">
                    Submitted {formatDate(application.createdAt)}
                  </p>
                </div>

                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm text-text-muted">
                      Contact phone
                    </dt>
                    <dd className="mt-1 font-medium">
                      {application.contactPhone}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm text-text-muted">
                      Business address
                    </dt>
                    <dd className="mt-1 whitespace-pre-wrap font-medium">
                      {application.businessAddress}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm text-text-muted">
                      Application ID
                    </dt>
                    <dd className="mt-1 break-all font-mono text-sm">
                      {id || "Not available"}
                    </dd>
                  </div>
                </dl>

                {isRejecting && (
                  <div className="mt-5 rounded-lg border border-border p-4">
                    <label
                      htmlFor={`reason-${id}`}
                      className="block text-sm font-medium"
                    >
                      Reason for rejection
                    </label>
                    <textarea
                      id={`reason-${id}`}
                      value={rejectionReason}
                      onChange={(event) =>
                        setRejectionReason(event.target.value)
                      }
                      rows={3}
                      maxLength={1000}
                      required
                      placeholder="Explain what the applicant needs to address."
                      className="mt-2 w-full rounded-lg border border-border bg-background p-3"
                    />
                    <p className="mt-1 text-xs text-text-muted">
                      {rejectionReason.trim().length} characters entered.
                    </p>

                    <div className="mt-3 flex flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={isBusy || !rejectionReason.trim()}
                        onClick={() => void handleReject(application)}
                        className="rounded-lg bg-red-700 px-4 py-2 text-white disabled:opacity-50"
                      >
                        {rejectState.isLoading
                          ? "Rejecting..."
                          : "Confirm rejection"}
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => {
                          setRejectingId(null);
                          setRejectionReason("");
                          setActionError(null);
                        }}
                        className="rounded-lg border border-border px-4 py-2 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {!isRejecting && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={isBusy || !id}
                      onClick={() => void handleApprove(application)}
                      className="rounded-lg bg-green-700 px-4 py-2 text-white disabled:opacity-50"
                    >
                      {approveState.isLoading
                        ? "Processing..."
                        : "Approve application"}
                    </button>

                    <button
                      type="button"
                      disabled={isBusy || !id}
                      onClick={() => {
                        setActionError(null);
                        setActionSuccess(null);
                        setRejectionReason("");
                        setRejectingId(id);
                      }}
                      className="rounded-lg border border-red-400 px-4 py-2 text-red-700 disabled:opacity-50"
                    >
                      Reject application
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
