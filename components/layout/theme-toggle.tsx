"use client";

import { Moon, Sun } from "lucide-react";

const storageKey = "mutsimoto-theme";

export function ThemeToggle() {
  function toggleTheme() {
    const nextTheme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    localStorage.setItem(storageKey, nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label="Toggle light and dark mode"
      title="Toggle light and dark mode"
    >
      <Sun className="theme-toggle__sun size-[18px]" aria-hidden="true" />
      <Moon className="theme-toggle__moon size-[18px]" aria-hidden="true" />
    </button>
  );
}
