"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";

// Stats Card Component
function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  delay,
}: {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down";
  icon: React.ElementType;
  delay: number;
}) {
  return (
    <motion.div
      className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-purple-400" />
        </div>
        <div
          className={`flex items-center gap-1 text-sm ${
            changeType === "up" ? "text-green-400" : "text-red-400"
          }`}
        >
          {changeType === "up" ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
          )}
          {change}
        </div>
      </div>
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className="font-heading text-2xl text-white">{value}</p>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/products?active=false");
        const data = await res.json();
        setStats((prev) => ({
          ...prev,
          totalProducts: data.products?.length || 0,
        }));
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-heading text-3xl text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here is your store overview.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toString()}
          change="12%"
          changeType="up"
          icon={Package}
          delay={0.1}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toString()}
          change="8%"
          changeType="up"
          icon={ShoppingCart}
          delay={0.2}
        />
        <StatCard
          title="Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          change="23%"
          changeType="up"
          icon={DollarSign}
          delay={0.3}
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders.toString()}
          change="5%"
          changeType="down"
          icon={TrendingUp}
          delay={0.4}
        />
      </div>

      {/* Quick Actions */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Link href="/admin/products/new">
          <div className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-colors cursor-pointer group">
            <Package className="w-8 h-8 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-heading text-lg text-white mb-2">
              Add New Product
            </h3>
            <p className="text-gray-400 text-sm">
              Create a new product listing for your store
            </p>
          </div>
        </Link>

        <Link href="/admin/orders">
          <div className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-colors cursor-pointer group">
            <ShoppingCart className="w-8 h-8 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-heading text-lg text-white mb-2">
              Manage Orders
            </h3>
            <p className="text-gray-400 text-sm">
              View and process customer orders
            </p>
          </div>
        </Link>

        <Link href="/admin/categories">
          <div className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-colors cursor-pointer group">
            <TrendingUp className="w-8 h-8 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-heading text-lg text-white mb-2">
              Categories
            </h3>
            <p className="text-gray-400 text-sm">
              Organize your products into categories
            </p>
          </div>
        </Link>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        className="mt-8 bg-akusho-dark border border-purple-500/20 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="font-heading text-xl text-white mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-gray-500">
          <p>No recent activity to show</p>
          <p className="text-sm mt-2">Orders and updates will appear here</p>
        </div>
      </motion.div>
    </div>
  );
}