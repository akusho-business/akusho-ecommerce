"use client";

import { motion } from "framer-motion";

interface NeonTextProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  animate?: boolean;
}

export default function NeonText({
  children,
  className = "",
  as: Tag = "h1",
  animate = true,
}: NeonTextProps) {
  // In light mode: solid dark text with subtle shadow
  // In dark mode: white text with neon glow
  const baseClasses = "font-heading text-gray-900 dark:text-white dark:neon-text";

  if (!animate) {
    return <Tag className={`${baseClasses} ${className}`}>{children}</Tag>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <Tag className={`${baseClasses} dark:animate-pulse-neon ${className}`}>
        {children}
      </Tag>
    </motion.div>
  );
}