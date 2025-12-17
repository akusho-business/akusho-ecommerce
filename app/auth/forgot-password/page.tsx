"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await resetPassword(email);

      if (!result.success) {
        setError(result.error ?? "Failed to send reset email");
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4">
        <motion.div
          className="w-full max-w-md text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="font-heading text-2xl text-white mb-4">Check Your Email</h1>
          <p className="text-gray-400 mb-8">
            We&apos;ve sent a password reset link to <strong className="text-white">{email}</strong>
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Back Link */}
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl text-white mb-2">Forgot Password?</h1>
          <p className="text-gray-400">Enter your email to reset your password</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6">
            <div>
              <label className="block text-gray-300 text-sm mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-purple-500 text-white font-heading uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 hover:bg-purple-400 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}