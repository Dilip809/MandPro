
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import type { UserRole } from "@/features/auth/types";
import { usePathname } from "next/navigation";
import type { AppPermission } from "@/features/auth/permissions";
import { hasPermission } from "@/features/auth/permissions";
import {
  useSyncExternalStore,
} from "react";
type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: AppPermission;
};

const subscribe = () => () => {};

function getServerSnapshot() {
  return false;
}

function getClientSnapshot() {
  return true;
}

function isUnauthorized(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("status" in error)) {
    return false;
  }

  return error.status === 401;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  requiredPermission,
}: ProtectedRouteProps) {
  const pathname = usePathname();

  const {
  data,
  error,
  isLoading,
  isFetching,
  isError,
  refetch,
} = useGetCurrentUserQuery(undefined, {
  refetchOnMountOrArgChange: true,
});

  const user = data?.data?.user;
  const unauthorized = isError && isUnauthorized(error);

  const mounted = useSyncExternalStore(
  subscribe,
  getClientSnapshot,
  getServerSnapshot,
);

if (!mounted) {
  return (
    <div className="flex min-h-60 items-center justify-center">
      <p className="text-text-muted">Checking your session...</p>
    </div>
  );
}

  if (isLoading || (isFetching && !user && !isError)) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <p className="text-text-muted">Checking your session...</p>
      </div>
    );
  }

  if (unauthorized || !user) {
    if (isError && !unauthorized) {
      return (
        <div className="mx-auto max-w-xl p-8 text-center">
          <h1 className="text-xl font-semibold">
            Unable to verify your session
          </h1>
          <p className="mt-2 text-text-muted">
            Check your connection and try again.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 rounded-lg bg-primary px-4 py-2 font-semibold text-white"
          >
            Try again
          </button>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-xl space-y-3 p-8 text-center">
        <h1 className="text-xl font-semibold">
          Sign in to continue
        </h1>
        <p className="text-text-muted">
          You can keep browsing Mandipro, but this feature requires an account.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href={`/login?next=${encodeURIComponent(pathname || "/")}`}
            className="rounded-lg bg-primary px-4 py-2 font-semibold text-white"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-border px-4 py-2 font-medium"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  if (user.status !== "ACTIVE") {
  return (
    <div className="mx-auto max-w-xl p-8 text-center">
      <h1 className="text-xl font-semibold">
        Account access restricted
      </h1>
      <p className="mt-2 text-text-muted">
        Your account must be active to access this page.
      </p>
    </div>
  );
}

    const hasRequiredRole =
    !allowedRoles || allowedRoles.includes(user.role);

  const hasRequiredPermission =
    !requiredPermission || hasPermission(user, requiredPermission);

  if (!hasRequiredRole || !hasRequiredPermission) {
    return (
      <div className="mx-auto max-w-xl space-y-3 p-8 text-center">
        <h1 className="text-xl font-semibold">Access denied</h1>
        <p className="text-text-muted">
          You do not have permission to view this page.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg border border-border px-4 py-2 font-medium"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
