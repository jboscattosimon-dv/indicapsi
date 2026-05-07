"use client";

import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Alternar tema"
      className={`
        w-9 h-9 rounded-full flex items-center justify-center
        text-[#9B9088] hover:text-[#C4897A] dark:text-[#9B9088] dark:hover:text-[#C4897A]
        hover:bg-[#F0EBE3] dark:hover:bg-[#2C2320]
        transition-all duration-200
        ${className}
      `}
    >
      {theme === "dark"
        ? <Sun size={16} strokeWidth={1.5} />
        : <Moon size={16} strokeWidth={1.5} />
      }
    </button>
  );
}
