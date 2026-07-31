import { useCallback, useEffect, useState } from "react";

/**
 * useTheme — persisted dark/light mode controller.
 * Applies the `.dark` class on <html>; all UI colors are CSS variables,
 * so the flip is instant and layout-safe.
 */
export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "pklab_theme";

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
    // Respect the operating system preference on first visit
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  return { theme, toggleTheme, isDark: theme === "dark" };
}
