
"use client";

import { useCallback, useState } from "react";

import NavigationItem from "./NavigationItem";
import NavigationDrawer from "./NavigationDrawer";
import { NAVIGATION_ITEMS } from "./navigation.config";
import { getVisibleNavigation } from "./navigation.utils";
import type {
  NavigationProps,
  NavigationItemConfig,
} from "./navigation.types";

export default function Navigation({
  role,
  dashboardHref = "/",
  checkingSession = false,
  isAuthenticated = false,
  className = "",
}: NavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const items: NavigationItemConfig[] = getVisibleNavigation(
    NAVIGATION_ITEMS.filter((item) => item.label !== "Dashboard"),
    checkingSession ? undefined : role,
  );

  if (
    isAuthenticated &&
    !checkingSession &&
    dashboardHref !== "/" &&
    !items.some((item) => item.href === dashboardHref)
  ) {
    items.push({
      label: "Dashboard",
      href: dashboardHref,
    });
  }

  return (
    <>
      <div className={className}>
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-3 md:flex lg:gap-5"
        >
          {items.map((item) => (
            <NavigationItem key={item.href} item={item} />
          ))}
        </nav>

        <button
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen(true)}
          className="inline-flex items-center justify-center rounded-lg border border-border p-2 text-foreground transition hover:bg-primary-soft md:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <NavigationDrawer
        open={menuOpen}
        items={items}
        onClose={closeMenu}
      />
    </>
  );
}
