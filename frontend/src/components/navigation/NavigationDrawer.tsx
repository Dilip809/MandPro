
"use client";

import { useEffect } from "react";

import NavigationItem from "./NavigationItem";
import type { NavigationItemConfig } from "./navigation.types";

type Props = {
  open: boolean;
  items: NavigationItemConfig[];
  onClose: () => void;
};

export default function NavigationDrawer({
  open,
  items,
  onClose,
}: Props) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/50"
      />

      <aside
        id="mobile-navigation"
        aria-label="Mobile navigation"
        className="absolute inset-y-0 right-0 flex w-80 max-w-[85vw] flex-col border-l border-border bg-surface p-5 shadow-xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            Menu
          </span>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-2 text-text-muted hover:bg-primary-soft hover:text-primary"
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
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          {items.map((item) => (
            <NavigationItem
              key={item.href}
              item={item}
              onNavigate={onClose}
            />
          ))}
        </nav>
      </aside>
    </div>
  );
}
