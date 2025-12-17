"use client";

import { motion } from "framer-motion";

interface AnimeGlowWrapperProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: "soft" | "medium" | "strong";
}

export default function AnimeGlowWrapper({
  children,
  className = "",
  glowColor = "#00A8FF",
  intensity = "medium",
}: AnimeGlowWrapperProps) {
  const intensityStyles = {
    soft: `0 0 20px ${glowColor}33, 0 0 40px ${glowColor}22`,
    medium: `0 0 30px ${glowColor}55, 0 0 60px ${glowColor}33`,
    strong: `0 0 40px ${glowColor}77, 0 0 80px ${glowColor}55, 0 0 120px ${glowColor}33`,
  };

  // Light mode shadow (subtle purple)
  const lightShadow = {
    soft: "0 4px 15px rgba(139, 92, 246, 0.1)",
    medium: "0 4px 20px rgba(139, 92, 246, 0.15)",
    strong: "0 4px 30px rgba(139, 92, 246, 0.2)",
  };

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Light mode shadow */}
      <div 
        className="absolute inset-0 dark:hidden rounded-lg"
        style={{ boxShadow: lightShadow[intensity] }}
      />
      
      {/* Dark mode glow */}
      <div 
        className="absolute inset-0 hidden dark:block rounded-lg"
        style={{ boxShadow: intensityStyles[intensity] }}
      />
      
      {/* Glow backdrop - only in dark mode */}
      <div
        className="absolute inset-0 blur-xl opacity-0 dark:opacity-50 -z-10 rounded-lg"
        style={{ backgroundColor: glowColor }}
      />
      
      {children}
    </motion.div>
  );
}