"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Store,
  Moon,
  Sun,
  Wallet,
  FileText,
  Boxes,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";

const sidebarLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Inventory", href: "/admin/inventory", icon: Boxes },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Categories", href: "/admin/categories", icon: FolderOpen },
  { name: "Finance", href: "/admin/finance", icon: Wallet },
  { name: "Invoices", href: "/admin/invoices", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  // Using isLoading from your AuthContext (not 'loading')
  const { user, profile, isAdmin, isLoading, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Redirect logic - only after auth loading is complete
  useEffect(() => {
    // Wait for auth to finish loading
    if (!isLoading) {
      if (!user) {
        // Not logged in - redirect to login
        router.push("/auth/login?redirect=/admin");
      } else if (user && !isAdmin) {
        // Logged in but not admin - redirect to home
        router.push("/");
      }
    }
  }, [isLoading, user, isAdmin, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Show loading while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-akusho-deepest flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-400 text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not admin
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-akusho-deepest flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-400 text-sm">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Get current page title
  const currentPage = sidebarLinks.find((link) => {
    if (link.href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(link.href);
  });

  return (
    <div className="min-h-screen bg-akusho-deepest">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Fixed position */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-akusho-dark border-r border-purple-500/20 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-purple-500/20">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <span className="font-heading text-xl text-white">AKUSHO</span>
            <span className="text-xs text-purple-400 font-medium">ADMIN</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-16rem)]">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);

            return (
              <Link key={link.href} href={link.href}>
                <motion.div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "text-gray-400 hover:text-white hover:bg-purple-500/10"
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{link.name}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-purple-500/20 bg-akusho-dark">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <span className="text-purple-400 font-medium">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "A"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {profile?.full_name || "Admin"}
              </p>
              <p className="text-gray-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Link href="/">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-white hover:bg-purple-500/10 rounded-lg transition-colors">
                <Store className="w-5 h-5" />
                <span>View Store</span>
              </button>
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content - Offset by sidebar width on large screens */}
      <div className="lg:ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-akusho-dark/80 backdrop-blur-md border-b border-purple-500/20">
          <div className="h-full flex items-center justify-between px-4 lg:px-6">
            {/* Left: Menu button & Breadcrumb */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-purple-500/10"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm">
                <Link
                  href="/admin"
                  className="text-gray-500 hover:text-gray-300"
                >
                  Admin
                </Link>
                {currentPage && currentPage.href !== "/admin" && (
                  <>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                    <span className="text-white font-medium">
                      {currentPage.name}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-purple-500/10 transition-colors"
                >
                  {theme === "dark" ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
              )}

              {/* View Store Button */}
              <Link href="/" className="hidden sm:block">
                <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white border border-purple-500/20 rounded-lg hover:bg-purple-500/10 transition-colors">
                  <Store className="w-4 h-4" />
                  View Store
                </button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}