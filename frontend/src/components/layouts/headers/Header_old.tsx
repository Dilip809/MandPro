
"use client";

import Link from "next/link";
import { useCallback, useEffect, useSyncExternalStore } from "react";

import ThemeToggle from "@/components/ui/ThemeToggle";
import LogoutButton from "@/components/auth/LogoutButton";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { getPostLoginPath } from "@/features/auth/getPostLoginPath";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();

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

  // Do not render session-dependent links until hydration completes.
  const dashboardHref =
    hasMounted && user?.status === "ACTIVE"
      ? getPostLoginPath(user)
      : "/";

  const isHomeActive = pathname === "/";
  const isDashboardActive =
    dashboardHref !== "/" && pathname === dashboardHref;

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <h2
          className="text-2xl font-bold tracking-tight text-primary"
        >
          Mandipro
        </h2>

        <nav
          aria-label="Main navigation"
          className="flex items-center gap-3 sm:gap-5"
        >
          <Link
            href="/"
            className={`text-sm font-medium transition hover:text-primary ${isHomeActive
                ? "text-primary bg-primary-soft border-b-2 border-primary-hover pb-1"
                : "text-text-muted"
              }`}
          >
            Home
          </Link>

          {hasMounted &&
            user?.status === "ACTIVE" &&
            dashboardHref !== "/" && (
              <Link
                href={dashboardHref}
                className={`text-sm font-medium transition hover:text-primary ${isDashboardActive
                    ? "text-primary bg-primary-soft border-b-2 border-primary-hover pb-1"
                    : "text-text-muted"
                  }`}
              >
                Dashboard
              </Link>
            )}

          <Link
            href="/products"
            className="hidden text-sm text-text-muted transition hover:text-foreground sm:inline"
          >
            Products
          </Link>

          <Link
            href="/about"
            className="hidden text-sm text-text-muted transition hover:text-foreground sm:inline"
          >
            About
          </Link>

          {checkingSession ? (
            <span role="status" className="text-sm text-text-muted">
              Checking session...
            </span>
          ) : user?.status === "ACTIVE" ? (
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
                className="text-sm font-medium transition hover:text-primary"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="hidden text-sm font-medium transition hover:text-primary sm:inline"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={() => void refetch()}
              className="text-sm font-medium text-text-muted transition hover:text-primary"
            >
              Retry session check
            </button>
          )}

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
