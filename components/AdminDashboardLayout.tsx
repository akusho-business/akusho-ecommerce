"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Store,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Sidebar navigation items
const sidebarItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    name: "Finance",
    href: "/admin/finance",
    icon: Wallet,
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Admin";

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-akusho-deepest">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-akusho-darker border-b border-gray-200 dark:border-purple-500/20 z-40 flex items-center justify-between px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <span
            className="font-heading text-xl font-bold text-purple-600 dark:text-purple-400"
            style={{ textShadow: "0 0 10px rgba(168, 85, 247, 0.5)" }}
          >
            AKUSHO
          </span>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-purple-500/20 px-2 py-0.5 rounded">
            Admin
          </span>
        </Link>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-purple-500/10 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-akusho-darker border-r border-gray-200 dark:border-purple-500/20 flex-col z-50">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-200 dark:border-purple-500/20">
          <Link href="/admin" className="flex items-center gap-2">
            <span
              className="font-heading text-xl font-bold text-purple-600 dark:text-purple-400"
              style={{ textShadow: "0 0 10px rgba(168, 85, 247, 0.5)" }}
            >
              AKUSHO
            </span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-purple-500/20 px-2 py-0.5 rounded">
              Admin
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-purple-500/10 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-purple-500" : ""}`} />
                <span>{item.name}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto text-purple-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Back to Store */}
        <div className="p-4 border-t border-gray-200 dark:border-purple-500/20">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-purple-500/10 rounded-xl transition-colors"
          >
            <Store className="w-5 h-5" />
            <span>Back to Store</span>
          </Link>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200 dark:border-purple-500/20">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-akusho-dark rounded-xl">
            <div
              className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white font-bold"
              style={{ boxShadow: "0 0 15px rgba(168, 85, 247, 0.4)" }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-akusho-darker z-50 flex flex-col"
            >
              {/* Header */}
              <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-purple-500/20">
                <Link href="/admin" className="flex items-center gap-2" onClick={() => setIsSidebarOpen(false)}>
                  <span className="font-heading text-xl font-bold text-purple-600 dark:text-purple-400">
                    AKUSHO
                  </span>
                  <span className="text-xs font-medium bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded">
                    Admin
                  </span>
                </Link>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {sidebarItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href ||
                    (item.href !== "/admin" && pathname?.startsWith(item.href));

                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-purple-500/10"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? "text-purple-500" : ""}`} />
                        <span>{item.name}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Back to Store */}
              <div className="p-4 border-t border-gray-200 dark:border-purple-500/20">
                <Link
                  href="/"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-purple-500/10 rounded-xl transition-colors"
                >
                  <Store className="w-5 h-5" />
                  <span>Back to Store</span>
                </Link>
              </div>

              {/* User Section */}
              <div className="p-4 border-t border-gray-200 dark:border-purple-500/20">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-akusho-dark rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}