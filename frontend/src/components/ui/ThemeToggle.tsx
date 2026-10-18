
"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "mandipro-theme";

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

function applyTheme(theme: Theme) {
  const prefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;

  const resolvedTheme =
    theme === "system" ? (prefersDark ? "dark" : "light") : theme;

  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.style.colorScheme = resolvedTheme;
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    let storedTheme: string | null = null;

    try {
      storedTheme = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // Continue using the system preference if storage is unavailable.
    }

    const initialTheme = isTheme(storedTheme) ? storedTheme : "system";

    if (initialTheme !== theme) {
      setTheme(initialTheme);
      return;
    }

    applyTheme(theme);

    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // The current theme still works if storage is unavailable.
    }

    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );

    const handleSystemThemeChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [theme]);

  function handleToggle() {
    const nextTheme: Record<Theme, Theme> = {
      system: "light",
      light: "dark",
      dark: "system",
    };

    setTheme(nextTheme[theme]);
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
