"use client";

import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Show placeholder during SSR to prevent layout shift
  if (!mounted) {
    return (
      <div className={`p-2 w-9 h-9 rounded-lg bg-gray-200 dark:bg-purple-500/20 ${className}`} />
    );
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative p-2 rounded-lg transition-colors
        bg-gray-200 dark:bg-purple-500/20 
        hover:bg-gray-300 dark:hover:bg-purple-500/30
        text-gray-700 dark:text-purple-400 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 0 : 180 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {theme === "dark" ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </motion.div>
    </motion.button>
  );
}