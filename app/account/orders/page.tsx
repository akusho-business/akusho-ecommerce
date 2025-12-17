"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Package,
  LogOut,
  Loader2,
  ShoppingBag,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface Order {
  id: number;
  created_at: string;
  total_amount: number;
  status: string;
  items: {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }[];
}

const statusConfig: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  pending: { icon: Clock, color: "text-yellow-400", label: "Pending" },
  confirmed: { icon: CheckCircle, color: "text-blue-400", label: "Confirmed" },
  shipped: { icon: Truck, color: "text-purple-400", label: "Shipped" },
  delivered: { icon: CheckCircle, color: "text-green-400", label: "Delivered" },
  cancelled: { icon: XCircle, color: "text-red-400", label: "Cancelled" },
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, profile, isLoading, signOut } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching orders:", error);
        } else {
          setOrders(data || []);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoadingOrders(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-akusho-deepest">
        <Loader2 className="w-8 h-8 text-akusho-neon animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-akusho-deepest pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-heading text-4xl text-white neon-text mb-2">
            My Orders
          </h1>
          <p className="text-gray-400">Track and manage your orders</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-akusho-dark/80 backdrop-blur-md border border-akusho-neon/20 rounded-xl p-6">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-akusho-neon/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-heading text-4xl text-akusho-neon">
                    {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <h2 className="font-heading text-xl text-white">
                  {profile?.full_name || "User"}
                </h2>
                <p className="text-gray-400 text-sm">{user.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                <Link
                  href="/account"
                  className="flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:bg-akusho-neon/10 hover:text-akusho-neon transition-colors"
                >
                  <User className="w-5 h-5" />
                  Profile
                </Link>
                <Link
                  href="/account/orders"
                  className="flex items-center gap-3 p-3 rounded-lg bg-akusho-neon/10 text-akusho-neon"
                >
                  <Package className="w-5 h-5" />
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {loadingOrders ? (
              <div className="bg-akusho-dark/80 backdrop-blur-md border border-akusho-neon/20 rounded-xl p-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-akusho-neon animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              /* Empty State */
              <div className="bg-akusho-dark/80 backdrop-blur-md border border-akusho-neon/20 rounded-xl p-12 text-center">
                <div className="w-20 h-20 bg-akusho-neon/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-10 h-10 text-akusho-neon/50" />
                </div>
                <h3 className="font-heading text-xl text-white mb-2">
                  No Orders Yet
                </h3>
                <p className="text-gray-400 mb-6">
                  Start shopping to see your orders here!
                </p>
                <Link href="/shop">
                  <motion.button
                    className="px-6 py-3 bg-akusho-neon text-akusho-deepest font-heading uppercase tracking-wider rounded-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Browse Products
                  </motion.button>
                </Link>
              </div>
            ) : (
              /* Orders List */
              <div className="space-y-4">
                {orders.map((order, index) => {
                  const status = statusConfig[order.status] || statusConfig.pending;
                  const StatusIcon = status.icon;

                  return (
                    <motion.div
                      key={order.id}
                      className="bg-akusho-dark/80 backdrop-blur-md border border-akusho-neon/20 rounded-xl p-6 hover:border-akusho-neon/40 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {/* Order Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-gray-400 text-sm">
                            Order #{order.id}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className={`flex items-center gap-2 ${status.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {status.label}
                          </span>
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex -space-x-3">
                          {order.items.slice(0, 3).map((item, i) => (
                            <div
                              key={i}
                              className="w-12 h-12 bg-akusho-darker rounded-lg border-2 border-akusho-dark flex items-center justify-center"
                            >
                              <Package className="w-5 h-5 text-akusho-neon/50" />
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-12 h-12 bg-akusho-neon/20 rounded-lg border-2 border-akusho-dark flex items-center justify-center">
                              <span className="text-xs text-akusho-neon font-medium">
                                +{order.items.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm">
                            {order.items.length} item
                            {order.items.length > 1 ? "s" : ""}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {order.items
                              .slice(0, 2)
                              .map((i) => i.name)
                              .join(", ")}
                            {order.items.length > 2 && "..."}
                          </p>
                        </div>
                      </div>

                      {/* Order Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-akusho-neon/10">
                        <div>
                          <p className="text-gray-400 text-sm">Total</p>
                          <p className="font-heading text-xl text-white">
                            ₹{order.total_amount.toLocaleString()}
                          </p>
                        </div>
                        <button className="flex items-center gap-2 text-akusho-neon hover:underline">
                          View Details
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}