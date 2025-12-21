"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Package,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ShoppingBag,
  Calendar,
  CreditCard,
  Box,
  Navigation,
  PackageCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface OrderItem {
  id: number;
  name: string;
  image?: string;
  image_url?: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  total_amount?: number;
  created_at: string;
  items: OrderItem[];
  awb_code?: string;
  courier_name?: string;
}

const statusConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  pending: {
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/30",
    icon: Clock,
    label: "Pending",
  },
  confirmed: {
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
    icon: CheckCircle,
    label: "Confirmed",
  },
  processing: {
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/30",
    icon: Package,
    label: "Processing",
  },
  ready_to_dispatch: {
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/30",
    icon: Box,
    label: "Ready to Ship",
  },
  shipped: {
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/30",
    icon: Truck,
    label: "Shipped",
  },
  out_for_delivery: {
    color: "text-teal-400",
    bg: "bg-teal-500/10 border-teal-500/30",
    icon: Navigation,
    label: "Out for Delivery",
  },
  delivered: {
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
    icon: PackageCheck,
    label: "Delivered",
  },
  cancelled: {
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
    icon: XCircle,
    label: "Cancelled",
  },
};

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      fetchOrders();
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Not logged in
  if (!authLoading && !user) {
    return (
      <main className="min-h-screen bg-akusho-deepest pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Package className="w-20 h-20 text-gray-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-3">Login Required</h1>
          <p className="text-gray-400 text-lg mb-8">
            Please login to view your orders
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-akusho-neon text-akusho-deepest font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-akusho-neon/30 transition-all"
          >
            Login to Continue
            <ChevronRight className="w-5 h-5" />
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
              <p className="text-gray-400 text-lg">Loading your orders...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-akusho-deepest pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3">
              <Package className="w-9 h-9 text-akusho-neon" />
              My Orders
            </h1>
            <p className="text-gray-400 mt-2 text-lg">
              Track and manage your orders
            </p>
          </div>
          <button
            onClick={fetchOrders}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-akusho-dark border border-purple-500/30 rounded-xl text-gray-300 hover:text-white hover:bg-purple-500/10 transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </motion.div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-akusho-darker rounded-2xl p-12 sm:p-16 border border-akusho-neon/20 text-center"
          >
            <ShoppingBag className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-3">
              No orders yet
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
              Your order history will appear here once you make a purchase
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 bg-akusho-neon text-akusho-deepest font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-akusho-neon/30 transition-all"
            >
              Start Shopping
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              const orderTotal = order.total || order.total_amount || 0;
              const itemCount = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* FIXED: Changed href from /orders/ to /account/orders/ */}
                  <Link href={`/account/orders/${order.order_number}`}>
                    <div className="bg-akusho-darker rounded-2xl border border-akusho-neon/20 overflow-hidden hover:border-akusho-neon/40 transition-all cursor-pointer group">
                      {/* Order Header */}
                      <div className="p-5 sm:p-6 border-b border-akusho-neon/10">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="text-gray-500 text-sm mb-1">Order Number</p>
                            <p className="font-bold text-white font-mono text-lg">
                              {order.order_number}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-gray-500 text-sm flex items-center gap-1 justify-end">
                                <Calendar className="w-4 h-4" />
                                {formatDate(order.created_at)}
                              </p>
                              <p className="font-bold text-white text-xl flex items-center gap-1 justify-end mt-1">
                                <CreditCard className="w-5 h-5 text-akusho-neon" />
                                {formatCurrency(orderTotal)}
                              </p>
                            </div>

                            <span
                              className={`px-4 py-2 rounded-xl text-sm font-semibold border flex items-center gap-2 ${status.bg} ${status.color}`}
                            >
                              <StatusIcon className="w-4 h-4" />
                              {status.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* AWB Info (if shipped) */}
                      {order.awb_code && (
                        <div className="px-5 sm:px-6 py-3 bg-akusho-dark/50 border-b border-akusho-neon/10 flex items-center gap-3">
                          <Truck className="w-5 h-5 text-cyan-400" />
                          <div>
                            <p className="text-gray-500 text-xs">Tracking Number</p>
                            <p className="text-white font-mono">{order.awb_code}</p>
                          </div>
                          {order.courier_name && (
                            <span className="ml-auto text-gray-500 text-sm">
                              {order.courier_name}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Order Items */}
                      <div className="p-5 sm:p-6">
                        <div className="flex flex-wrap gap-3">
                          {order.items?.slice(0, 4).map((item, idx) => (
                            <div
                              key={idx}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-akusho-dark border border-akusho-neon/20"
                            >
                              {item.image || item.image_url ? (
                                <Image
                                  src={item.image || item.image_url || ""}
                                  alt={item.name}
                                  width={80}
                                  height={80}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-600" />
                                </div>
                              )}
                            </div>
                          ))}
                          {order.items?.length > 4 && (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-akusho-neon/10 border border-akusho-neon/20 flex items-center justify-center">
                              <span className="text-sm font-bold text-akusho-neon">
                                +{order.items.length - 4}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <p className="text-gray-400">
                            {itemCount} {itemCount === 1 ? "item" : "items"}
                          </p>

                          <div className="flex items-center gap-2 text-akusho-neon font-medium group-hover:translate-x-1 transition-transform">
                            View Details
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}