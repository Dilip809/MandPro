
"use client";

import Link from "next/link";
import { useCallback, useEffect, useSyncExternalStore } from "react";

import ThemeToggle from "@/components/ui/ThemeToggle";
import LogoutButton from "@/components/auth/LogoutButton";

import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { getPostLoginPath } from "@/features/auth/getPostLoginPath";
import Navigation from "@/components/navigation/Navigation";

function subscribe() {
  return () => { };
}

function getSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export default function Header() {
  const hasMounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCurrentUserQuery();

  const recheckSession = useCallback(() => {
    void refetch();
  }, [refetch]);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        recheckSession();
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [recheckSession]);

  const user = data?.data?.user;

  const isUnauthorized =
    isError &&
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 401;

  const checkingSession =
    !hasMounted || (isLoading && !data && !isError);

  const isActiveUser = user?.status === "ACTIVE";

  const dashboardHref =
    hasMounted && isActiveUser
      ? getPostLoginPath(user)
      : "/";

  // Derive the role from your existing authenticated user type.
  const role =
    hasMounted && isActiveUser
      ? user.role
      : undefined;


  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="shrink-0 text-2xl font-bold tracking-tight text-primary"
        >
          Mandipro
        </Link>

        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <Navigation
            role={role}
            dashboardHref={dashboardHref}
            checkingSession={checkingSession}
            isAuthenticated={isActiveUser}
          />

          {checkingSession ? (
            <span
              role="status"
              className="hidden text-sm text-text-muted lg:inline"
            >
              Checking session...
            </span>
          ) : isActiveUser ? (
            <>
              <span
                className="hidden max-w-32 truncate text-sm text-text-muted sm:inline"
                title={user.name}
              >
                {user.name}
              </span>

              <LogoutButton />
            </>
          ) : isUnauthorized || (!isError && !user) ? (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-medium transition hover:text-primary sm:inline"
              >
                Login
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={() => void refetch()}
              className="text-sm font-medium text-text-muted transition hover:text-primary"
            >
              Retry
            </button>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
