"use client";

import { motion } from "framer-motion";
import NeonText from "./NeonText";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  centered = true,
  className = "",
}: SectionHeaderProps) {
  return (
    <motion.div
      className={`mb-12 ${centered ? "text-center" : ""} ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <NeonText as="h2" className="text-3xl md:text-4xl lg:text-5xl mb-4">
        {title}
      </NeonText>
      {subtitle && (
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">{subtitle}</p>
      )}
      <motion.div
        className="w-24 h-1 bg-gradient-to-r from-purple-600 dark:from-akusho-neonDark to-purple-400 dark:to-akusho-neon mx-auto mt-6"
        initial={{ width: 0 }}
        whileInView={{ width: 96 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />
    </motion.div>
  );
}