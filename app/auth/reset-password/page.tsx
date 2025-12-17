"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check if user came from email link
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsValidSession(true);
      }
      setCheckingSession(false);
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }

    setIsLoading(false);
  };

  // Loading state
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-akusho-deepest">
        <Loader2 className="w-8 h-8 text-akusho-neon animate-spin" />
      </div>
    );
  }

  // Invalid session
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-akusho-deepest px-4 py-20">
        <motion.div
          className="w-full max-w-md bg-akusho-dark/80 backdrop-blur-md border border-akusho-neon/20 rounded-2xl p-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h2 className="font-heading text-2xl text-white mb-4">
            Invalid or Expired Link
          </h2>
          <p className="text-gray-400 mb-6">
            This password reset link is invalid or has expired. Please request a
            new one.
          </p>
          <Link href="/auth/forgot-password">
            <motion.button
              className="w-full py-3 bg-akusho-neon text-akusho-deepest font-heading uppercase tracking-wider rounded-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Request New Link
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-akusho-deepest px-4 py-20">
        <motion.div
          className="w-full max-w-md bg-akusho-dark/80 backdrop-blur-md border border-akusho-neon/20 rounded-2xl p-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-20 h-20 bg-akusho-neon/20 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <Check className="w-10 h-10 text-akusho-neon" />
          </motion.div>
          <h2 className="font-heading text-2xl text-white mb-4">
            Password Updated!
          </h2>
          <p className="text-gray-400 mb-6">
            Your password has been successfully reset. Redirecting to login...
          </p>
          <Link href="/auth/login">
            <motion.button
              className="w-full py-3 bg-akusho-neon text-akusho-deepest font-heading uppercase tracking-wider rounded-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Go to Login
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-akusho-deepest px-4 py-20">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-akusho-neon/10 blur-[150px] rounded-full" />
      </div>

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Card */}
        <div className="bg-akusho-dark/80 backdrop-blur-md border border-akusho-neon/20 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/">
              <span className="font-heading text-4xl text-white neon-text">
                AKUSHO
              </span>
            </Link>
            <h1 className="font-heading text-2xl text-white mt-6 mb-2">
              Reset Your Password
            </h1>
            <p className="text-gray-400">Enter your new password below</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  className="w-full pl-12 pr-12 py-3 bg-akusho-darker border border-akusho-neon/20 rounded-lg text-white placeholder-gray-500 focus:border-akusho-neon focus:ring-1 focus:ring-akusho-neon transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-akusho-darker border border-akusho-neon/20 rounded-lg text-white placeholder-gray-500 focus:border-akusho-neon focus:ring-1 focus:ring-akusho-neon transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-akusho-neon text-akusho-deepest font-heading uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Update Password"
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}