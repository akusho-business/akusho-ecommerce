// ============================================
// FILE: app/account/orders/[orderNumber]/page.tsx
// PURPOSE: Customer order detail page with live tracking
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
  Phone,
  Mail,
  User,
  ShoppingBag,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

// Types
interface OrderItem {
  id: number;
  name: string;
  image?: string;
  image_url?: string;
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
  total: number;
  total_amount?: number;
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
  tracking_url: string | null;
}

// Status steps for timeline
const statusSteps = [
  { key: "pending", label: "Order Placed", icon: ShoppingBag },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "processing", label: "Processing", icon: Package },
  { key: "ready_to_dispatch", label: "Ready to Ship", icon: Box },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Navigation },
  { key: "delivered", label: "Delivered", icon: PackageCheck },
];

// Get current step index
const getStatusIndex = (status: string): number => {
  if (status === "cancelled") return -1;
  const index = statusSteps.findIndex((s) => s.key === status);
  return index >= 0 ? index : 0;
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
  const [error, setError] = useState<string | null>(null);

  const orderNumber = params.orderNumber as string;

  // Fetch order details
  useEffect(() => {
    async function fetchOrder() {
      if (!user || !orderNumber) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("orders")
          .select("*")
          .eq("order_number", orderNumber)
          .eq("user_id", user.id)
          .single();

        if (fetchError) {
          console.error("Error fetching order:", fetchError);
          setError("Order not found");
          return;
        }

        setOrder(data);

        // Auto-fetch tracking if order has AWB
        if (data?.awb_code && data?.status !== "cancelled" && data?.status !== "delivered") {
          fetchTracking(data.awb_code);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load order");
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
    } catch (err) {
      console.error("Error fetching tracking:", err);
    } finally {
      setIsTrackingLoading(false);
    }
  }, [order?.awb_code]);

  // Auto-refresh tracking every 5 minutes for shipped orders
  useEffect(() => {
    if (order?.awb_code && ["shipped", "out_for_delivery"].includes(order.status)) {
      const interval = setInterval(() => {
        fetchTracking();
      }, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [order?.status, order?.awb_code, fetchTracking]);

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Format date with time
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get icon for tracking activity
  const getActivityIcon = (activity: string, status: string, isLatest: boolean) => {
    if (isLatest) return Navigation;
    const lowerStatus = status?.toLowerCase() || "";
    const lowerActivity = activity?.toLowerCase() || "";
    
    if (lowerStatus.includes("delivered") || lowerActivity.includes("delivered")) return PackageCheck;
    if (lowerStatus.includes("out for delivery") || lowerActivity.includes("out for delivery")) return Truck;
    if (lowerStatus.includes("transit") || lowerActivity.includes("transit")) return Truck;
    if (lowerStatus.includes("pickup") || lowerActivity.includes("picked")) return Warehouse;
    if (lowerStatus.includes("hub") || lowerActivity.includes("hub")) return Box;
    return CircleDot;
  };

  // Not logged in
  if (!authLoading && !user) {
    return (
      <main className="min-h-screen bg-akusho-deepest pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Package className="w-20 h-20 text-gray-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-3">Login Required</h1>
          <p className="text-gray-400 text-lg mb-8">
            Please login to view your order details
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-akusho-neon text-akusho-deepest font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-akusho-neon/30 transition-all"
          >
            Login to Continue
          </Link>
        </div>
      </main>
    );
  }

  // Loading
  if (isLoading || authLoading) {
    return (
      <main className="min-h-screen bg-akusho-deepest pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-akusho-neon animate-spin mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Loading order details...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Order not found
  if (error || !order) {
    return (
      <main className="min-h-screen bg-akusho-deepest pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-3">Order Not Found</h1>
          <p className="text-gray-400 text-lg mb-8">
            This order doesn&apos;t exist or you don&apos;t have access to it
          </p>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 px-8 py-4 bg-akusho-neon text-akusho-deepest font-bold rounded-xl hover:shadow-lg hover:shadow-akusho-neon/30 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Orders
          </Link>
        </div>
      </main>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const orderTotal = order.total || order.total_amount || 0;

  return (
    <main className="min-h-screen bg-akusho-deepest pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="py-6"
        >
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-akusho-neon transition-colors text-lg"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to My Orders
          </Link>
        </motion.div>

        {/* Order Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-akusho-darker rounded-2xl border border-akusho-neon/20 p-6 sm:p-8 mb-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
            <div>
              <p className="text-gray-400 text-sm mb-1">Order Number</p>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-white font-mono">
                  {order.order_number}
                </h1>
                <button
                  onClick={() => copyToClipboard(order.order_number)}
                  className="p-2 text-gray-400 hover:text-akusho-neon transition-colors rounded-lg hover:bg-white/5"
                  title="Copy order number"
                >
                  <Copy className="w-5 h-5" />
                </button>
                {copied && (
                  <span className="text-sm text-akusho-neon font-medium">Copied!</span>
                )}
              </div>
            </div>

            <div className="text-right">
              <p className="text-gray-400 text-sm flex items-center gap-1 justify-end mb-1">
                <Calendar className="w-4 h-4" />
                {formatDate(order.created_at)}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-akusho-neon">
                {formatCurrency(orderTotal)}
              </p>
            </div>
          </div>

          {/* Status Timeline */}
          {order.status !== "cancelled" ? (
            <div className="relative">
              {/* Progress Line Background */}
              <div className="absolute top-6 left-0 right-0 h-1.5 bg-akusho-dark rounded-full mx-8 sm:mx-12" />
              
              {/* Progress Line Fill */}
              <motion.div
                className="absolute top-6 left-0 h-1.5 bg-gradient-to-r from-akusho-neon to-cyan-400 rounded-full mx-8 sm:mx-12"
                initial={{ width: 0 }}
                animate={{
                  width: `calc(${Math.min((currentStatusIndex / (statusSteps.length - 1)) * 100, 100)}% - 4rem)`,
                }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              />

              {/* Status Steps */}
              <div className="relative flex justify-between">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const StepIcon = step.icon;

                  // Skip some steps on mobile for space
                  const showOnMobile = [0, 2, 4, 6].includes(index);

                  return (
                    <div
                      key={step.key}
                      className={`flex flex-col items-center ${!showOnMobile ? "hidden sm:flex" : ""}`}
                    >
                      <motion.div
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2 transition-all z-10 ${
                          isCompleted
                            ? "bg-akusho-neon border-akusho-neon text-akusho-deepest"
                            : "bg-akusho-dark border-gray-600 text-gray-500"
                        } ${isCurrent ? "ring-4 ring-akusho-neon/30 scale-110" : ""}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: isCurrent ? 1.1 : 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <StepIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </motion.div>
                      <p
                        className={`mt-3 text-xs sm:text-sm font-medium text-center max-w-[80px] sm:max-w-none ${
                          isCompleted ? "text-white" : "text-gray-500"
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
            <div className="flex items-center justify-center gap-3 py-6 bg-red-500/10 rounded-xl border border-red-500/30">
              <XCircle className="w-8 h-8 text-red-500" />
              <span className="text-red-400 font-semibold text-xl">Order Cancelled</span>
            </div>
          )}
        </motion.div>

        {/* Live Tracking Section */}
        {order.awb_code && order.status !== "cancelled" && order.status !== "delivered" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-akusho-darker rounded-2xl border border-akusho-neon/20 p-6 sm:p-8 mb-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-akusho-neon/10 rounded-xl">
                  <Truck className="w-6 h-6 text-akusho-neon" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-xl">Live Tracking</h2>
                  <p className="text-gray-400">
                    {order.courier_name || "Courier"} • AWB: {order.awb_code}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchTracking()}
                  disabled={isTrackingLoading}
                  className="p-3 text-gray-400 hover:text-akusho-neon transition-colors rounded-xl hover:bg-white/5 disabled:opacity-50"
                  title="Refresh tracking"
                >
                  <RefreshCw className={`w-5 h-5 ${isTrackingLoading ? "animate-spin" : ""}`} />
                </button>
                {(tracking?.trackingUrl || order.tracking_url) && (
                  <a
                    href={tracking?.trackingUrl || order.tracking_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 text-gray-400 hover:text-akusho-neon transition-colors rounded-xl hover:bg-white/5"
                    title="Track on courier website"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Expected Delivery */}
            {(tracking?.estimatedDelivery || order.expected_delivery) && (
              <div className="mb-6 p-5 bg-akusho-neon/5 border border-akusho-neon/20 rounded-xl">
                <p className="text-gray-400 text-sm mb-1">Expected Delivery</p>
                <p className="text-2xl font-bold text-akusho-neon">
                  {formatDate(tracking?.estimatedDelivery || order.expected_delivery!)}
                </p>
              </div>
            )}

            {/* Tracking Timeline */}
            {tracking?.activities && tracking.activities.length > 0 ? (
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-akusho-neon via-cyan-500 to-gray-700" />

                <div className="space-y-1">
                  {tracking.activities.map((activity, index) => {
                    const isLatest = index === 0;
                    const IconComponent = getActivityIcon(activity.activity, activity.status, isLatest);

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`relative flex gap-4 p-3 rounded-xl ${isLatest ? "bg-akusho-neon/5" : ""}`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                            isLatest
                              ? "bg-akusho-neon text-akusho-deepest shadow-lg shadow-akusho-neon/50"
                              : "bg-akusho-dark text-gray-500 border border-gray-700"
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-base ${isLatest ? "text-white" : "text-gray-400"}`}>
                            {activity.activity || activity.status}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                            {activity.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {activity.location}
                              </span>
                            )}
                            {activity.date && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {formatDateTime(activity.date)}
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
              <div className="text-center py-10">
                {isTrackingLoading ? (
                  <Loader2 className="w-10 h-10 text-akusho-neon animate-spin mx-auto" />
                ) : (
                  <>
                    <Box className="w-14 h-14 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-lg">
                      Tracking updates will appear here once your shipment moves
                    </p>
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Preparing Message (Before AWB) */}
        {!order.awb_code && ["confirmed", "processing", "ready_to_dispatch"].includes(order.status) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-4 bg-purple-500/20 rounded-full"
              >
                <Package className="w-8 h-8 text-purple-400" />
              </motion.div>
              <div>
                <h3 className="font-bold text-white text-xl">Preparing Your Order</h3>
                <p className="text-gray-400">
                  Your order is being packed. Tracking will be available once shipped.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Delivered Success Message */}
        {order.status === "delivered" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-green-500/20 rounded-full">
                <PackageCheck className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xl">Order Delivered! 🎉</h3>
                <p className="text-gray-400">
                  {order.delivered_at
                    ? `Delivered on ${formatDate(order.delivered_at)}`
                    : "Your order has been delivered successfully"}
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
          className="bg-akusho-darker rounded-2xl border border-akusho-neon/20 p-6 sm:p-8 mb-6"
        >
          <h2 className="font-bold text-white text-xl mb-6 flex items-center gap-3">
            <Box className="w-6 h-6 text-akusho-neon" />
            Order Items
          </h2>

          <div className="space-y-4">
            {order.items?.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 p-4 bg-akusho-dark/50 rounded-xl"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-akusho-dark flex-shrink-0">
                  {item.image || item.image_url ? (
                    <Image
                      src={item.image || item.image_url || ""}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white text-lg truncate">{item.name}</h3>
                  <p className="text-gray-400 mt-1">Qty: {item.quantity}</p>
                  <p className="text-akusho-neon font-bold text-xl mt-2">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-6 pt-6 border-t border-akusho-neon/10 space-y-3">
            <div className="flex justify-between text-base">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white">
                {formatCurrency(order.subtotal || orderTotal - (order.shipping_cost || 0))}
              </span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-gray-400">Shipping</span>
              <span className="text-white">
                {order.shipping_cost ? formatCurrency(order.shipping_cost) : "FREE"}
              </span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-3 border-t border-akusho-neon/10">
              <span className="text-white">Total</span>
              <span className="text-akusho-neon">{formatCurrency(orderTotal)}</span>
            </div>
          </div>
        </motion.div>

        {/* Shipping Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-akusho-darker rounded-2xl border border-akusho-neon/20 p-6 sm:p-8 mb-6"
        >
          <h2 className="font-bold text-white text-xl mb-6 flex items-center gap-3">
            <MapPin className="w-6 h-6 text-akusho-neon" />
            Shipping Address
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-500" />
              <span className="text-white text-lg">{order.customer_name}</span>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
              <div className="text-gray-300">
                <p>{order.shipping_address}</p>
                <p>
                  {[order.shipping_city, order.shipping_state, order.shipping_pincode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>

            {order.customer_phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <span className="text-gray-300">{order.customer_phone}</span>
              </div>
            )}

            {order.customer_email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <span className="text-gray-300">{order.customer_email}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center py-6"
        >
          <p className="text-gray-400">
            Need help with your order?{" "}
            <Link href="/contact" className="text-akusho-neon hover:underline font-medium">
              Contact Support
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}