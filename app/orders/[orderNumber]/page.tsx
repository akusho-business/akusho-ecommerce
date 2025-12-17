"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  MapPin,
  Copy,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  CreditCard,
} from "lucide-react";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  total_amount: number;
  razorpay_payment_id: string;
  tracking_id: string | null;
  cancel_reason: string | null;
  expected_delivery: string | null;
  dispatched_at: string | null;
  delivered_at: string | null;
  created_at: string;
}

const statusSteps = [
  { key: "placed", label: "Order Placed", icon: CheckCircle },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Dispatched", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const getStepIndex = (status: string): number => {
  switch (status) {
    case "pending":
      return 0;
    case "processing":
      return 1;
    case "shipped":
      return 2;
    case "delivered":
      return 3;
    case "cancelled":
      return -1;
    default:
      return 0;
  }
};

export default function UserOrderDetailPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [params.orderNumber]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.orderNumber}`);
      const data = await res.json();

      if (data.order) {
        setOrder(data.order);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyTrackingId = () => {
    if (order?.tracking_id) {
      navigator.clipboard.writeText(order.tracking_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const parseShippingAddress = (address: string) => {
    try {
      return JSON.parse(address);
    } catch {
      return { address, city: "", state: "", pincode: "" };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-akusho-deepest flex items-center justify-center">
        <motion.div
          className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-akusho-deepest pt-24 px-4">
        <div className="max-w-2xl mx-auto text-center py-16">
          <Package className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-heading text-gray-900 dark:text-white mb-2">
            Order Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn't find an order with this number.
          </p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-6 py-3 bg-akusho-neon text-akusho-deepest font-heading rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === "cancelled";
  const shippingAddress = parseShippingAddress(order.shipping_address);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-akusho-deepest pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-akusho-neon mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>

        {/* Order Header Card */}
        <motion.div
          className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-2xl p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl sm:text-2xl font-heading text-gray-900 dark:text-white">
                  {order.order_number}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isCancelled
                      ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                      : order.status === "delivered"
                      ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                      : "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400"
                  }`}
                >
                  {isCancelled
                    ? "cancelled"
                    : order.status === "shipped"
                    ? "dispatched"
                    : order.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />₹
                  {order.total_amount?.toLocaleString()}
                </span>
                <span>•</span>
                <span>
                  {order.items?.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                  items
                </span>
                <span>•</span>
                <span className="text-green-600 dark:text-green-400">
                  razorpay
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-purple-500/10 text-gray-700 dark:text-purple-400 rounded-lg hover:bg-gray-200 dark:hover:bg-purple-500/20 transition-colors"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  View Details
                </>
              )}
            </button>
          </div>

          {/* Expected Delivery */}
          {order.expected_delivery && !isCancelled && order.status !== "delivered" && (
            <div className="flex items-center gap-2 px-4 py-3 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-xl">
              <Truck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-gray-700 dark:text-gray-300">
                Expected Delivery:{" "}
                <span className="font-semibold text-purple-600 dark:text-akusho-neon">
                  {new Date(order.expected_delivery).toLocaleDateString(
                    "en-IN",
                    {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </span>
              </span>
            </div>
          )}

          {/* Tracking Info */}
          {order.tracking_id && !isCancelled && (
            <div className="mt-4 px-4 py-3 bg-blue-50 dark:bg-akusho-neon/10 border border-blue-200 dark:border-akusho-neon/20 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600 dark:text-akusho-neon" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Tracking ID:{" "}
                    <span className="font-mono font-semibold text-blue-600 dark:text-akusho-neon">
                      {order.tracking_id}
                    </span>
                  </span>
                </div>
                <button
                  onClick={copyTrackingId}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 dark:text-akusho-neon hover:bg-blue-100 dark:hover:bg-akusho-neon/20 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}

          {/* No Tracking Yet */}
          {!order.tracking_id && order.status === "processing" && (
            <div className="mt-4 px-4 py-3 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-xl">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <span className="text-yellow-700 dark:text-yellow-400 font-medium">
                    Tracking ID will be available here once your order is
                    dispatched.
                  </span>
                  <p className="text-yellow-600 dark:text-yellow-500 text-sm mt-0.5">
                    Usually takes 24 hours from order placement.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Status Timeline */}
        {!isCancelled ? (
          <motion.div
            className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-2xl p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="font-heading text-lg text-gray-900 dark:text-white mb-6">
              Order Status Timeline
            </h2>

            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 dark:bg-purple-500/20 rounded-full">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-akusho-neon rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.max(0, (currentStep / (statusSteps.length - 1)) * 100)}%`,
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStep;
                  const isCurrent = index === currentStep;
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.key}
                      className="flex flex-col items-center"
                    >
                      <motion.div
                        className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                          isCompleted
                            ? "bg-gradient-to-br from-purple-500 to-akusho-neon"
                            : "bg-gray-200 dark:bg-purple-500/20"
                        }`}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: isCurrent ? 1.1 : 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon
                          className={`w-6 h-6 ${
                            isCompleted
                              ? "text-white"
                              : "text-gray-400 dark:text-gray-500"
                          }`}
                        />
                      </motion.div>
                      <span
                        className={`mt-3 text-sm font-medium text-center ${
                          isCompleted
                            ? "text-purple-600 dark:text-akusho-neon"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {step.label}
                      </span>
                      {index === 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {new Date(order.created_at).toLocaleDateString(
                            "en-IN",
                            { day: "2-digit", month: "2-digit", year: "numeric" }
                          )}
                        </span>
                      )}
                      {index === 2 && order.dispatched_at && (
                        <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {new Date(order.dispatched_at).toLocaleDateString(
                            "en-IN",
                            { day: "2-digit", month: "2-digit", year: "numeric" }
                          )}
                        </span>
                      )}
                      {index === 3 && order.delivered_at && (
                        <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {new Date(order.delivered_at).toLocaleDateString(
                            "en-IN",
                            { day: "2-digit", month: "2-digit", year: "numeric" }
                          )}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Cancelled Order Banner */
          <motion.div
            className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-heading text-lg text-red-600 dark:text-red-400 mb-1">
                  Order Cancelled
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {order.cancel_reason || "This order has been cancelled."}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Order Items */}
        {showDetails && (
          <motion.div
            className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-2xl p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-heading text-lg text-gray-900 dark:text-white mb-4">
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-akusho-darker rounded-xl"
                >
                  <div className="w-16 h-16 bg-gray-200 dark:bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-gray-400 dark:text-purple-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {item.name}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Qty: {item.quantity} × ₹{item.price?.toLocaleString()}
                    </p>
                  </div>
                  <p className="font-heading text-gray-900 dark:text-akusho-neon">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-purple-500/20 space-y-2">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>₹{order.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span>₹{order.shipping?.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount</span>
                  <span>-₹{order.discount?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-heading pt-2 border-t border-gray-200 dark:border-purple-500/20">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-purple-600 dark:text-akusho-neon">
                  ₹{order.total_amount?.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Shipping Address */}
        {showDetails && (
          <motion.div
            className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-heading text-lg text-gray-900 dark:text-white mb-4">
              Shipping Address
            </h2>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 dark:text-purple-400 mt-0.5" />
              <div>
                <p className="text-gray-900 dark:text-white font-medium">
                  {order.customer_name}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {shippingAddress.address}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {shippingAddress.city}, {shippingAddress.state} -{" "}
                  {shippingAddress.pincode}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  📞 {order.customer_phone}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  ✉️ {order.customer_email}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Need Help */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Need help with your order?{" "}
            <Link
              href="/contact"
              className="text-purple-600 dark:text-akusho-neon hover:underline"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}