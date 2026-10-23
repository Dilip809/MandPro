"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { getPostLoginPath } from "@/features/auth/getPostLoginPath";

function isUnauthorized(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  return "status" in error && error.status === 401;
}

export default function GuestOnlyRoute({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  const {
  data,
  error,
  isLoading,
  isFetching,
  isError,
  refetch,
} = useGetCurrentUserQuery();

const user = data?.data.user;
const unauthorized = isError && isUnauthorized(error);

  useEffect(() => {
    if (user?.status === "ACTIVE") {
      router.replace(getPostLoginPath(user));
    }
  }, [user, router]);

  if (isLoading || (!data && isFetching && !isError)) {
  return <p className="p-6 text-center">Checking session...</p>;
}

  // Fail closed for guest-only pages if session status cannot
  // be verified. A network error must not be mistaken for logout.
  // A network/server error is not proof that the user is logged out.
if (isError && !unauthorized) {
  return (
    <main className="p-6 text-center">
      <p>Unable to verify your session.</p>
      <button
        type="button"
        className="mt-3 rounded-lg border border-border px-4 py-2"
        onClick={() => void refetch()}
      >
        Try again
      </button>
    </main>
  );
}

  if (user?.status === "ACTIVE") {
    return null;
  }

  return <>{children}</>;
}