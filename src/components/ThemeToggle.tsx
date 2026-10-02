"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-24 h-8 rounded-lg bg-slate-800/40 border border-slate-700 animate-pulse" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 shadow-sm
        bg-white text-slate-800 border-slate-300 hover:bg-slate-100
        dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-700"
      title="Toggle Light / Dark Mode"
      type="button"
    >
      <span>{isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}</span>
    </button>
  );
}