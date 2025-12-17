"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Package,
  Eye,
  RefreshCw,
} from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  payment_status: string;
  items: OrderItem[];
  tracking_id: string | null;
  created_at: string;
}

interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  pending: { 
    icon: Clock, 
    color: "text-yellow-400", 
    bgColor: "bg-yellow-500/20",
    label: "Pending"
  },
  processing: { 
    icon: Package, 
    color: "text-blue-400", 
    bgColor: "bg-blue-500/20",
    label: "Processing"
  },
  shipped: { 
    icon: Truck, 
    color: "text-purple-400", 
    bgColor: "bg-purple-500/20",
    label: "Dispatched"
  },
  delivered: { 
    icon: CheckCircle, 
    color: "text-green-400", 
    bgColor: "bg-green-500/20",
    label: "Delivered"
  },
  cancelled: { 
    icon: XCircle, 
    color: "text-red-400", 
    bgColor: "bg-red-500/20",
    label: "Cancelled"
  },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();

      setOrders(data.orders || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  // Filter orders client-side for instant search
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(query) ||
      order.customer_name.toLowerCase().includes(query) ||
      order.customer_email.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl text-white mb-2">Orders</h1>
          <p className="text-gray-400">Manage and track customer orders</p>
        </div>
        <button
          onClick={() => fetchOrders(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <button
            onClick={() => setStatusFilter("all")}
            className={`p-4 rounded-xl border transition-colors ${
              statusFilter === "all"
                ? "bg-purple-500/20 border-purple-500"
                : "bg-akusho-dark border-purple-500/20 hover:border-purple-500/40"
            }`}
          >
            <p className="text-2xl font-heading text-white">{stats.total}</p>
            <p className="text-gray-400 text-sm">All Orders</p>
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`p-4 rounded-xl border transition-colors ${
              statusFilter === "pending"
                ? "bg-yellow-500/20 border-yellow-500"
                : "bg-akusho-dark border-purple-500/20 hover:border-yellow-500/40"
            }`}
          >
            <p className="text-2xl font-heading text-yellow-400">{stats.pending}</p>
            <p className="text-gray-400 text-sm">Pending</p>
          </button>
          <button
            onClick={() => setStatusFilter("processing")}
            className={`p-4 rounded-xl border transition-colors ${
              statusFilter === "processing"
                ? "bg-blue-500/20 border-blue-500"
                : "bg-akusho-dark border-purple-500/20 hover:border-blue-500/40"
            }`}
          >
            <p className="text-2xl font-heading text-blue-400">{stats.processing}</p>
            <p className="text-gray-400 text-sm">Processing</p>
          </button>
          <button
            onClick={() => setStatusFilter("shipped")}
            className={`p-4 rounded-xl border transition-colors ${
              statusFilter === "shipped"
                ? "bg-purple-500/20 border-purple-500"
                : "bg-akusho-dark border-purple-500/20 hover:border-purple-500/40"
            }`}
          >
            <p className="text-2xl font-heading text-purple-400">{stats.shipped}</p>
            <p className="text-gray-400 text-sm">Dispatched</p>
          </button>
          <button
            onClick={() => setStatusFilter("delivered")}
            className={`p-4 rounded-xl border transition-colors ${
              statusFilter === "delivered"
                ? "bg-green-500/20 border-green-500"
                : "bg-akusho-dark border-purple-500/20 hover:border-green-500/40"
            }`}
          >
            <p className="text-2xl font-heading text-green-400">{stats.delivered}</p>
            <p className="text-gray-400 text-sm">Delivered</p>
          </button>
          <button
            onClick={() => setStatusFilter("cancelled")}
            className={`p-4 rounded-xl border transition-colors ${
              statusFilter === "cancelled"
                ? "bg-red-500/20 border-red-500"
                : "bg-akusho-dark border-purple-500/20 hover:border-red-500/40"
            }`}
          >
            <p className="text-2xl font-heading text-red-400">{stats.cancelled}</p>
            <p className="text-gray-400 text-sm">Cancelled</p>
          </button>
        </div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search by order number, name, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-akusho-dark border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
        />
      </form>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-akusho-dark border border-purple-500/20 rounded-xl p-12 text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="font-heading text-xl text-white mb-2">No orders found</h3>
          <p className="text-gray-400">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Orders will appear here when customers make purchases"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

            return (
              <motion.div
                key={order.id}
                className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="text-white font-heading text-lg">
                        {order.order_number}
                      </span>
                      <span
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${status.bgColor} ${status.color}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                      {order.payment_status === "paid" && (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                          Paid
                        </span>
                      )}
                      {order.tracking_id && (
                        <span className="px-2 py-1 rounded-full text-xs bg-akusho-neon/20 text-akusho-neon">
                          🚚 {order.tracking_id}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <span>{order.customer_name}</span>
                      <span>•</span>
                      <span>{order.customer_email}</span>
                      <span>•</span>
                      <span>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-white font-heading text-lg">
                        ₹{order.total_amount?.toLocaleString()}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <Link href={`/admin/orders/${order.id}`}>
                      <motion.button
                        className="p-3 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Eye className="w-5 h-5" />
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}