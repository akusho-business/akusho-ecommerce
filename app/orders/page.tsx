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
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface OrderItem {
  id: number;
  name: string;
  image?: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  items: OrderItem[];
}

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  pending: {
    color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30",
    icon: Clock,
    label: "Pending",
  },
  confirmed: {
    color: "text-blue-500 bg-blue-500/10 border-blue-500/30",
    icon: CheckCircle,
    label: "Confirmed",
  },
  processing: {
    color: "text-purple-500 bg-purple-500/10 border-purple-500/30",
    icon: Package,
    label: "Processing",
  },
  shipped: {
    color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/30",
    icon: Truck,
    label: "Shipped",
  },
  delivered: {
    color: "text-green-500 bg-green-500/10 border-green-500/30",
    icon: CheckCircle,
    label: "Delivered",
  },
  cancelled: {
    color: "text-red-500 bg-red-500/10 border-red-500/30",
    icon: XCircle,
    label: "Cancelled",
  },
};

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) {
        setIsLoading(false);
        return;
      }

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
    }

    if (!authLoading) {
      fetchOrders();
    }
  }, [user, authLoading]);

  // Not logged in
  if (!authLoading && !user) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-akusho-deepest pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Login to View Orders
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please login to see your order history
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-akusho-neon text-akusho-deepest font-semibold rounded-xl hover:bg-akusho-neonLight transition-colors"
            >
              Login
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Loading
  if (isLoading || authLoading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-akusho-deepest pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="h-8 w-48 bg-gray-200 dark:bg-akusho-dark rounded animate-pulse mb-8" />
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-akusho-darker rounded-2xl p-6 mb-4 border border-gray-200 dark:border-akusho-neon/20"
              >
                <div className="h-6 w-32 bg-gray-200 dark:bg-akusho-dark rounded animate-pulse mb-4" />
                <div className="h-20 bg-gray-100 dark:bg-akusho-dark rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-akusho-deepest pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-akusho-neon" />
            My Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage your orders
          </p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-akusho-darker rounded-2xl p-12 border border-gray-200 dark:border-akusho-neon/20 text-center"
          >
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No orders yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start shopping to see your orders here
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-akusho-neon text-akusho-deepest font-semibold rounded-xl hover:bg-akusho-neonLight transition-colors"
            >
              Browse Shop
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-akusho-darker rounded-2xl border border-gray-200 dark:border-akusho-neon/20 overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-4 md:p-6 border-b border-gray-100 dark:border-akusho-neon/10">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Order Number
                        </p>
                        <p className="font-bold text-gray-900 dark:text-white font-mono">
                          {order.order_number}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 justify-end">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(order.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1 justify-end">
                            <CreditCard className="w-4 h-4 text-akusho-neon" />
                            ₹{order.total_amount?.toFixed(2)}
                          </p>
                        </div>

                        <span
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border flex items-center gap-1.5 ${status.color}`}
                        >
                          <StatusIcon className="w-4 h-4" />
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4 md:p-6">
                    <div className="flex flex-wrap gap-3">
                      {order.items?.slice(0, 4).map((item, idx) => (
                        <div
                          key={idx}
                          className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-akusho-dark border border-gray-200 dark:border-akusho-neon/20"
                        >
                          <Image
                            src={item.image || "/placeholder.png"}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {order.items?.length > 4 && (
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-gray-100 dark:bg-akusho-dark border border-gray-200 dark:border-akusho-neon/20 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            +{order.items.length - 4}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.items?.length} item
                        {order.items?.length !== 1 ? "s" : ""}
                      </p>

                      <Link
                        href={`/orders/${order.order_number}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-akusho-neon hover:text-akusho-neonLight transition-colors"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}