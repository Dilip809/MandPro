
"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "mandipro-theme";

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

function getThemeSnapshot(): Theme {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return isTheme(saved) ? saved : "system";
  } catch {
    return "system";
  }
}

function getServerSnapshot(): Theme {
  return "system";
}

function subscribeToThemeChanges(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function applyTheme(theme: Theme) {
  const prefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;

  const resolved =
    theme === "system" ? (prefersDark ? "dark" : "light") : theme;

  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToThemeChanges,
    getThemeSnapshot,
    getServerSnapshot,
  );

  function handleToggle() {
    const nextTheme: Record<Theme, Theme> = {
      system: "light",
      light: "dark",
      dark: "system",
    };

    const next = nextTheme[theme];

    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Continue applying the theme for this page view.
    }

    applyTheme(next);

    // Notify other tabs that the preference changed.
    window.dispatchEvent(new StorageEvent("storage", {
      key: STORAGE_KEY,
      newValue: next,
    }));
  }

  const labels: Record<Theme, string> = {
    system: "System",
    light: "Light",
    dark: "Dark",
  };

  const icons: Record<Theme, string> = {
    system: "◐",
    light: "☀",
    dark: "☾",
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={`Current theme: ${labels[theme]}. Switch theme`}
      title={`Theme: ${labels[theme]}`}
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground transition hover:bg-surface-muted"
    >
      <span aria-hidden="true">{icons[theme]}</span>
      <span>{labels[theme]}</span>
    </button>
  );
}
