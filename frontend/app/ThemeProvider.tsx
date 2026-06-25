"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "Light" | "Dark" | "System";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolvedTheme: "Light" | "Dark";
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "System",
  setTheme: () => {},
  resolvedTheme: "Light",
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getSystemTheme(): "Light" | "Dark" {
  if (typeof window === "undefined") return "Light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "Dark" : "Light";
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("System");
  const [resolvedTheme, setResolvedTheme] = useState<"Light" | "Dark">("Light");

  const resolve = (t: Theme): "Light" | "Dark" =>
    t === "System" ? getSystemTheme() : t;

  const applyTheme = (resolved: "Light" | "Dark") => {
    const root = document.documentElement;
    if (resolved === "Dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  // Initial load from localStorage
  useEffect(() => {
    let saved: Theme = "System";
    try {
      const s = localStorage.getItem("novaDvrSettings");
      if (s) {
        const parsed = JSON.parse(s);
        if (parsed.theme === "Dark")   saved = "Dark";
        else if (parsed.theme === "Light") saved = "Light";
        else if (parsed.theme === "System") saved = "System";
        // Legacy: map old "Dark"/"Light" strings
      }
    } catch { /* ignore */ }
    const resolved = resolve(saved);
    setThemeState(saved);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen to system preference changes when theme is "System"
  useEffect(() => {
    if (theme !== "System") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
      applyTheme(resolved);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  // Re-apply when theme state changes
  useEffect(() => {
    const resolved = resolve(theme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  const setTheme = (t: Theme) => {
    const resolved = resolve(t);
    setThemeState(t);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    try {
      const s = localStorage.getItem("novaDvrSettings");
      const existing = s ? JSON.parse(s) : {};
      localStorage.setItem("novaDvrSettings", JSON.stringify({ ...existing, theme: t }));
    } catch { /* ignore */ }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
