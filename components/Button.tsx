"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  fullWidth?: boolean;
}

/**
 * Button Component
 * 
 * A reusable button with multiple variants and sizes.
 * Can be used as a regular button or as a link.
 * 
 * Usage:
 * <Button href="/shop">Shop Now</Button>
 * <Button onClick={handleClick} variant="secondary">Click Me</Button>
 * <Button type="submit" variant="primary">Submit</Button>
 */
export default function Button({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  fullWidth = false,
}: ButtonProps) {
  // Base styles
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-heading font-semibold
    rounded-lg
    transition-all duration-300
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? "w-full" : ""}
  `;

  // Variant styles
  const variants = {
    primary: `
      bg-akusho-neon text-akusho-deepest
      hover:bg-akusho-neon/90
      shadow-lg shadow-akusho-neon/25
      hover:shadow-akusho-neon/40
    `,
    secondary: `
      bg-purple-500 text-white
      hover:bg-purple-400
      shadow-lg shadow-purple-500/25
    `,
    outline: `
      border-2 border-akusho-neon text-akusho-neon
      hover:bg-akusho-neon hover:text-akusho-deepest
      bg-transparent
    `,
    ghost: `
      text-gray-600 dark:text-gray-300
      hover:bg-gray-100 dark:hover:bg-akusho-neon/10
      hover:text-gray-900 dark:hover:text-white
    `,
  };

  // Size styles
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`.replace(/\s+/g, ' ').trim();

  // If href is provided, render as Link
  if (href && !disabled) {
    return (
      <Link href={href}>
        <motion.span
          className={classes}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {children}
        </motion.span>
      </Link>
    );
  }

  // Otherwise render as button
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}