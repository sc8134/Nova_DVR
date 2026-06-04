"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSavedSearchesMonitor } from "./hooks/useSavedSearchesMonitor";

type Theme = "Light" | "Dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "Light",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("Light");

  // Run global background saved searches keyword monitor
  useSavedSearchesMonitor();

  // Read from localStorage on first render and apply immediately
  useEffect(() => {
    let saved: Theme = "Light";
    try {
      const s = localStorage.getItem("novaDvrSettings");
      if (s) {
        const parsed = JSON.parse(s);
        if (parsed.theme === "Dark") saved = "Dark";
      }
    } catch {}
    setThemeState(saved);
    applyTheme(saved);
  }, []);

  // Re-apply whenever theme state changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    if (t === "Dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    applyTheme(t); // apply instantly — don't wait for useEffect
    // Persist
    try {
      const s = localStorage.getItem("novaDvrSettings");
      const existing = s ? JSON.parse(s) : {};
      localStorage.setItem("novaDvrSettings", JSON.stringify({ ...existing, theme: t }));
    } catch {}
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
