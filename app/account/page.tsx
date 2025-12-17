"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Loader2, Save, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
  });

  // Load profile data when available
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        address_line1: profile.address_line1 || "",
        address_line2: profile.address_line2 || "",
        city: profile.city || "",
        state: profile.state || "",
        postal_code: profile.postal_code || "",
        country: profile.country || "",
      });
    }
  }, [profile]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const result = await updateProfile(formData);

      if (!result.success) {
        setError(result.error || "Failed to update profile");
      } else {
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl text-white mb-2">Account Settings</h1>
            <p className="text-gray-400">Manage your profile and preferences</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Info */}
            <div className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6 space-y-4">
              <h2 className="font-heading text-lg text-white mb-4">Account Information</h2>

              {/* Email (read-only) */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-akusho-darker/50 border border-purple-500/10 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6 space-y-4">
              <h2 className="font-heading text-lg text-white mb-4">Shipping Address</h2>

              {/* Address Line 1 */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">Address Line 1</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={formData.address_line1}
                    onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="Street address"
                  />
                </div>
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">Address Line 2</label>
                <input
                  type="text"
                  value={formData.address_line2}
                  onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                  className="w-full px-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="Apartment, suite, etc."
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="Maharashtra"
                  />
                </div>
              </div>

              {/* Postal Code & Country */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Postal Code</label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full px-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="400001"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="India"
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
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}