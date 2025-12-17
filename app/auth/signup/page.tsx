"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp(
        formData.email,
        formData.password,
        formData.fullName
      );

      if (!result.success) {
        setError(result.error || "Failed to create account");
      } else {
        router.push("/auth/login?message=Account created successfully. Please sign in.");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join the AKUSHO community</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6 space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="••••••••"
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
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </motion.button>
        </form>

        {/* Sign In Link */}
        <p className="mt-6 text-center text-gray-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-purple-400 hover:text-purple-300">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}