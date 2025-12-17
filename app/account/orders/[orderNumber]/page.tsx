// ============================================
// FILE LOCATION: app/orders/[orderNumber]/page.tsx
// STATUS: NEW FILE - Create this folder and file
// PURPOSE: User order detail page with automatic live tracking
// ============================================

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  Copy,
  ExternalLink,
  RefreshCw,
  Box,
  CircleDot,
  Warehouse,
  PackageCheck,
  Navigation,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface OrderItem {
  id: number;
  name: string;
  image?: string;
  quantity: number;
  price: number;
  sku?: string;
}

interface TrackingActivity {
  date: string;
  status: string;
  activity: string;
  location: string;
}

interface TrackingData {
  status: string;
  awb: string;
  courier: string;
  estimatedDelivery: string | null;
  trackingUrl: string | null;
  activities: TrackingActivity[];
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  subtotal: number;
  shipping_cost: number;
  created_at: string;
  items: OrderItem[];
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  awb_code: string | null;
  courier_name: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  expected_delivery: string | null;
}

const statusSteps = [
  { key: "confirmed", label: "Order Confirmed", icon: CheckCircle },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: PackageCheck },
];

const statusConfig: Record<string, { color: string; glowColor: string }> = {
  pending: { color: "text-yellow-500", glowColor: "shadow-yellow-500/50" },
  confirmed: { color: "text-blue-500", glowColor: "shadow-blue-500/50" },
  processing: { color: "text-purple-500", glowColor: "shadow-purple-500/50" },
  shipped: { color: "text-cyan-500", glowColor: "shadow-cyan-500/50" },
  delivered: { color: "text-green-500", glowColor: "shadow-green-500/50" },
  cancelled: { color: "text-red-500", glowColor: "shadow-red-500/50" },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const orderNumber = params.orderNumber as string;

  // Fetch order details
  useEffect(() => {
    async function fetchOrder() {
      if (!user || !orderNumber) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("order_number", orderNumber)
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        setOrder(data);

        // Auto-fetch tracking if order has AWB
        if (data?.awb_code) {
          fetchTracking(data.awb_code);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      fetchOrder();
    }
  }, [user, authLoading, orderNumber]);

  // Fetch live tracking
  const fetchTracking = useCallback(async (awb?: string) => {
    const awbCode = awb || order?.awb_code;
    if (!awbCode) return;

    setIsTrackingLoading(true);
    try {
      const res = await fetch(`/api/shipping/track?awb=${awbCode}`);
      const data = await res.json();

      if (data.status !== "error") {
        setTracking(data);
      }
    } catch (error) {
      console.error("Error fetching tracking:", error);
    } finally {
      setIsTrackingLoading(false);
    }
  }, [order?.awb_code]);

  // Auto-refresh tracking every 5 minutes for shipped orders
  useEffect(() => {
    if (order?.status === "shipped" && order?.awb_code) {
      const interval = setInterval(() => {
        fetchTracking();
      }, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [order?.status, order?.awb_code, fetchTracking]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusIndex = (status: string) => {
    if (status === "cancelled") return -1;
    if (status === "pending") return 0;
    const index = statusSteps.findIndex((s) => s.key === status);
    return index >= 0 ? index + 1 : 1;
  };

  // Not logged in
  if (!authLoading && !user) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-akusho-deepest pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Login Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please login to view order details
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-akusho-neon text-akusho-deepest font-semibold rounded-xl"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  // Loading
  if (isLoading || authLoading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-akusho-deepest pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-gray-200 dark:bg-akusho-dark rounded" />
            <div className="h-48 bg-gray-200 dark:bg-akusho-dark rounded-2xl" />
            <div className="h-64 bg-gray-200 dark:bg-akusho-dark rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  // Order not found
  if (!order) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-akusho-deepest pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Order Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This order doesn&apos;t exist or you don&apos;t have access to it
          </p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-6 py-3 bg-akusho-neon text-akusho-deepest font-semibold rounded-xl"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Orders
          </Link>
        </div>
      </main>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const config = statusConfig[order.status] || statusConfig.pending;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-akusho-deepest pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="py-6"
        >
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-akusho-neon transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Orders
          </Link>
        </motion.div>

        {/* Order Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-akusho-darker rounded-2xl border border-gray-200 dark:border-akusho-neon/20 p-6 mb-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Order Number
              </p>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white font-mono">
                  {order.order_number}
                </h1>
                <button
                  onClick={() => copyToClipboard(order.order_number)}
                  className="p-1.5 text-gray-400 hover:text-akusho-neon transition-colors"
                  title="Copy order number"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {copied && (
                  <span className="text-xs text-akusho-neon">Copied!</span>
                )}
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 justify-end mb-1">
                <Calendar className="w-4 h-4" />
                {new Date(order.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-1 justify-end">
                <CreditCard className="w-5 h-5 text-akusho-neon" />
                ₹{order.total_amount?.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Status Progress */}
          {order.status !== "cancelled" ? (
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-akusho-dark rounded-full mx-8">
                <motion.div
                  className="h-full bg-gradient-to-r from-akusho-neon to-akusho-cyan rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min((currentStatusIndex / (statusSteps.length - 1)) * 100, 100)}%`,
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>

              {/* Status Steps */}
              <div className="relative flex justify-between">
                {statusSteps.map((step, index) => {
                  const isCompleted = index < currentStatusIndex;
                  const isCurrent = index === currentStatusIndex - 1;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <motion.div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCompleted || isCurrent
                            ? "bg-akusho-neon border-akusho-neon text-akusho-deepest"
                            : "bg-gray-100 dark:bg-akusho-dark border-gray-300 dark:border-akusho-neon/30 text-gray-400"
                        } ${isCurrent ? "ring-4 ring-akusho-neon/30" : ""}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <StepIcon className="w-5 h-5" />
                      </motion.div>
                      <p
                        className={`mt-2 text-xs md:text-sm font-medium text-center ${
                          isCompleted || isCurrent
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 py-4 bg-red-500/10 rounded-xl border border-red-500/30">
              <XCircle className="w-6 h-6 text-red-500" />
              <span className="text-red-500 font-medium">Order Cancelled</span>
            </div>
          )}
        </motion.div>

        {/* Live Tracking Section */}
        {order.awb_code && order.status !== "cancelled" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-akusho-darker rounded-2xl border border-gray-200 dark:border-akusho-neon/20 p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-akusho-neon/10 rounded-lg">
                  <Truck className="w-5 h-5 text-akusho-neon" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">
                    Live Tracking
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {order.courier_name || "Courier"} • AWB: {order.awb_code}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchTracking()}
                  disabled={isTrackingLoading}
                  className="p-2 text-gray-400 hover:text-akusho-neon transition-colors disabled:opacity-50"
                  title="Refresh tracking"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${isTrackingLoading ? "animate-spin" : ""}`}
                  />
                </button>
                {tracking?.trackingUrl && (
                  <a
                    href={tracking.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-akusho-neon transition-colors"
                    title="Track on courier website"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Expected Delivery */}
            {(tracking?.estimatedDelivery || order.expected_delivery) && (
              <div className="mb-6 p-4 bg-akusho-neon/5 border border-akusho-neon/20 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Expected Delivery
                </p>
                <p className="text-lg font-bold text-akusho-neon">
                  {new Date(
                    tracking?.estimatedDelivery || order.expected_delivery!
                  ).toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            )}

            {/* Tracking Timeline */}
            {tracking?.activities && tracking.activities.length > 0 ? (
              <div className="relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-akusho-neon via-akusho-cyan to-gray-600" />

                <div className="space-y-4">
                  {tracking.activities.map((activity, index) => {
                    const isLatest = index === 0;
                    const IconComponent =
                      index === 0
                        ? Navigation
                        : activity.status?.toLowerCase().includes("delivered")
                        ? PackageCheck
                        : activity.status?.toLowerCase().includes("transit")
                        ? Truck
                        : activity.status?.toLowerCase().includes("pickup")
                        ? Warehouse
                        : CircleDot;

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative flex gap-4"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isLatest
                              ? "bg-akusho-neon text-akusho-deepest shadow-lg shadow-akusho-neon/50"
                              : "bg-gray-200 dark:bg-akusho-dark text-gray-500"
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>

                        <div className="flex-1 pb-4">
                          <p
                            className={`font-medium ${
                              isLatest
                                ? "text-gray-900 dark:text-white"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {activity.activity || activity.status}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-500">
                            {activity.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {activity.location}
                              </span>
                            )}
                            {activity.date && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(activity.date).toLocaleString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                {isTrackingLoading ? (
                  <motion.div
                    className="w-8 h-8 border-4 border-akusho-neon/30 border-t-akusho-neon rounded-full mx-auto"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <>
                    <Box className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Tracking updates will appear here once shipment moves
                    </p>
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Shipping waiting message */}
        {!order.awb_code && order.status === "processing" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-3 bg-purple-500/20 rounded-full"
              >
                <Package className="w-6 h-6 text-purple-400" />
              </motion.div>
              <div>
                <h3 className="font-bold text-white">Preparing Your Order</h3>
                <p className="text-sm text-gray-400">
                  Your order is being packed. Tracking will be available once shipped.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-akusho-darker rounded-2xl border border-gray-200 dark:border-akusho-neon/20 p-6 mb-6"
        >
          <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Box className="w-5 h-5 text-akusho-neon" />
            Order Items
          </h2>

          <div className="space-y-4">
            {order.items?.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 p-3 bg-gray-50 dark:bg-akusho-dark/50 rounded-xl"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-gray-200 dark:bg-akusho-dark flex-shrink-0">
                  <Image
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Qty: {item.quantity}
                  </p>
                  <p className="text-akusho-neon font-semibold mt-1">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-akusho-neon/10 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
              <span className="text-gray-900 dark:text-white">
                ₹{(order.subtotal || order.total_amount - (order.shipping_cost || 0)).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Shipping</span>
              <span className="text-gray-900 dark:text-white">
                {order.shipping_cost ? `₹${order.shipping_cost.toLocaleString()}` : "Free"}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 dark:border-akusho-neon/10">
              <span className="text-gray-900 dark:text-white">Total</span>
              <span className="text-akusho-neon">
                ₹{order.total_amount?.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Shipping Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-akusho-darker rounded-2xl border border-gray-200 dark:border-akusho-neon/20 p-6"
        >
          <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-akusho-neon" />
            Shipping Address
          </h2>

          <div className="text-gray-600 dark:text-gray-400">
            <p className="font-medium text-gray-900 dark:text-white">
              {order.customer_name}
            </p>
            <p>{order.shipping_address}</p>
            <p>
              {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}
            </p>
            <p className="mt-2">{order.customer_phone}</p>
            <p>{order.customer_email}</p>
          </div>
        </motion.div>

        {/* Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Need help with your order?{" "}
            <Link
              href="/contact"
              className="text-akusho-neon hover:underline"
            >
              Contact Support
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}