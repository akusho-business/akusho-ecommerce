"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Shield, Loader2 } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      router.push("/admin");
    } else {
      setError(result.error || "Invalid credentials");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-akusho-deepest px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-akusho-neonDark/15 blur-[150px] rounded-full" />
      </div>

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Card */}
        <div className="bg-akusho-dark/80 backdrop-blur-md border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="font-heading text-3xl text-white mb-2">
              Admin Portal
            </h1>
            <p className="text-gray-400">Sign in to manage your store</p>
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
            {/* Email Field */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@akusho.com"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
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

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-purple-500 text-white font-heading uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 hover:bg-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Access Dashboard
                </>
              )}
            </motion.button>
          </form>

          {/* Back to Store */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
            >
              ← Back to Store
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}