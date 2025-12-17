"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Package,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  // ============================================
  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY RETURNS
  // This is a React rule - hooks cannot be called conditionally
  // ============================================
  const pathname = usePathname();
  const { user, profile, isAdmin, isLoading, signOut } = useAuth();
  const { cartCount } = useCart();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // ============================================
  // CONDITIONAL RETURN - ONLY AFTER ALL HOOKS
  // ============================================
  
  // Hide navbar on admin pages (admin has its own layout)
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white dark:bg-akusho-darker/95 backdrop-blur-xl shadow-lg dark:shadow-akusho-neon/5 border-b border-gray-200 dark:border-akusho-neon/20"
            : "bg-white/95 dark:bg-akusho-darker/80 backdrop-blur-md border-b border-gray-100 dark:border-akusho-neon/10"
        }`}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-akusho-neon to-transparent opacity-0 dark:opacity-80" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link href="/" className="relative group flex items-center gap-2">
              <div className="absolute -inset-3 bg-akusho-neon/20 rounded-lg blur-xl opacity-0 dark:group-hover:opacity-100 transition-opacity duration-500" />
              
              <motion.div
                className="relative flex items-center gap-1.5"
                whileHover={{ scale: 1.02 }}
              >
                <span className="font-heading text-2xl md:text-3xl tracking-wider dark:hidden text-gray-900 font-bold">
                  AKUSHO
                </span>
                
                <span 
                  className="hidden dark:inline font-heading text-2xl md:text-3xl tracking-wider font-bold"
                  style={{
                    color: "#00A8FF",
                    textShadow: "0 0 10px rgba(0, 168, 255, 0.8), 0 0 20px rgba(0, 168, 255, 0.6), 0 0 40px rgba(0, 168, 255, 0.4)",
                  }}
                >
                  AKUSHO
                </span>

                <span 
                  className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-akusho-neon"
                  style={{ boxShadow: "0 0 8px rgba(0, 168, 255, 0.8)" }}
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link key={link.href} href={link.href} className="relative px-4 py-2 group">
                    <span
                      className={`relative z-10 text-sm font-semibold uppercase tracking-wider transition-all duration-300 ${
                        isActive
                          ? "text-cyan-600 dark:text-akusho-neon"
                          : "text-gray-600 dark:text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-akusho-neon"
                      }`}
                      style={isActive ? { textShadow: "0 0 10px rgba(0, 168, 255, 0.5)" } : {}}
                    >
                      {link.label}
                    </span>

                    <motion.span
                      className="absolute bottom-0 left-1/2 h-[2px] rounded-full bg-cyan-500 dark:bg-akusho-neon"
                      initial={false}
                      animate={{ width: isActive ? "50%" : "0%", x: "-50%" }}
                      whileHover={{ width: "50%" }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      style={{ boxShadow: "0 0 10px rgba(0, 168, 255, 0.8)" }}
                    />

                    <span className="absolute inset-0 rounded-lg bg-cyan-500/0 group-hover:bg-cyan-500/5 dark:group-hover:bg-akusho-neon/10 transition-colors duration-300" />
                  </Link>
                );
              })}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2 md:gap-3">
              <ThemeToggle />

              {/* Cart - Always visible (works without login via localStorage) */}
              <Link href="/cart" className="relative group">
                <motion.div
                  className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-akusho-dark dark:hover:bg-akusho-neon/20 text-gray-700 dark:text-gray-300 dark:hover:text-akusho-neon transition-all duration-300 border border-gray-200 dark:border-akusho-neon/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingCart className="w-5 h-5" />
                  
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 dark:bg-akusho-neon text-white dark:text-akusho-deepest text-xs font-bold rounded-full flex items-center justify-center"
                        style={{ boxShadow: "0 0 10px rgba(0, 168, 255, 0.6)" }}
                      >
                        {cartCount > 9 ? "9+" : cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>

              {/* User Menu - Desktop */}
              <div className="hidden md:block relative" ref={userMenuRef}>
                {isLoading ? (
                  <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-akusho-dark animate-pulse" />
                ) : user ? (
                  <>
                    <motion.button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-akusho-dark dark:hover:bg-akusho-neon/20 transition-colors border border-gray-200 dark:border-akusho-neon/30"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div 
                        className="w-8 h-8 rounded-lg bg-cyan-500 dark:bg-akusho-neon flex items-center justify-center"
                        style={{ boxShadow: "0 0 10px rgba(0, 168, 255, 0.4)" }}
                      >
                        <User className="w-4 h-4 text-white dark:text-akusho-deepest" />
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
                    </motion.button>

                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-64 bg-white dark:bg-akusho-darker rounded-xl border border-gray-200 dark:border-akusho-neon/30 shadow-xl dark:shadow-akusho-neon/10 overflow-hidden z-50"
                        >
                          <div className="p-4 border-b border-gray-100 dark:border-akusho-neon/20">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">{displayName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                          </div>

                          <div className="p-2">
                            {isAdmin && (
                              <Link
                                href="/admin"
                                onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-cyan-600 dark:text-akusho-neon hover:bg-cyan-50 dark:hover:bg-akusho-neon/10 transition-colors"
                              >
                                <LayoutDashboard className="w-4 h-4" />
                                <span className="font-medium">Admin Dashboard</span>
                              </Link>
                            )}

                            <Link
                              href="/account"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-akusho-neon/10 transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                              <span>Account Settings</span>
                            </Link>

                            <Link
                              href="/orders"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-akusho-neon/10 transition-colors"
                            >
                              <Package className="w-4 h-4" />
                              <span>My Orders</span>
                            </Link>

                            <hr className="my-2 border-gray-100 dark:border-akusho-neon/20" />

                            <button
                              onClick={handleSignOut}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link href="/auth/login">
                    <motion.button
                      className="px-5 py-2.5 bg-cyan-500 dark:bg-akusho-neon text-white dark:text-akusho-deepest font-semibold rounded-xl hover:bg-cyan-400 dark:hover:bg-akusho-neon/90 transition-colors"
                      style={{ boxShadow: "0 0 15px rgba(0, 168, 255, 0.3)" }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Sign In
                    </motion.button>
                  </Link>
                )}
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                className="md:hidden p-2.5 rounded-xl bg-gray-100 dark:bg-akusho-dark text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-akusho-neon/30"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-akusho-darker shadow-2xl"
            >
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-akusho-neonDark via-akusho-neon to-akusho-neonDark" style={{ boxShadow: "0 0 15px rgba(0, 168, 255, 0.5)" }} />

              <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-akusho-neon/20">
                <span className="font-heading text-xl font-bold text-gray-900 dark:text-white">Menu</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-xl bg-gray-100 dark:bg-akusho-dark text-gray-700 dark:text-white border border-gray-200 dark:border-akusho-neon/30">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-2">
                {navLinks.map((link, index) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div key={link.href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                      <Link
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                          isActive
                            ? "bg-cyan-50 dark:bg-akusho-neon/20 border-l-4 border-cyan-500 dark:border-akusho-neon text-cyan-600 dark:text-akusho-neon font-semibold"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-akusho-neon/10 font-medium"
                        }`}
                      >
                        <span>{link.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}

                {isAdmin && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: navLinks.length * 0.1 }}>
                    <Link
                      href="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-cyan-600 dark:text-akusho-neon hover:bg-cyan-50 dark:hover:bg-akusho-neon/10 font-medium transition-colors"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </motion.div>
                )}
              </div>

              <div className="mx-6 h-[1px] bg-gray-200 dark:bg-akusho-neon/20" />

              <div className="p-6">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-akusho-dark/50 rounded-xl mb-4 border border-gray-200 dark:border-akusho-neon/20">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500 dark:bg-akusho-neon flex items-center justify-center" style={{ boxShadow: "0 0 15px rgba(0, 168, 255, 0.4)" }}>
                        <User className="w-6 h-6 text-white dark:text-akusho-deepest" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{displayName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>

                    <Link href="/account" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-akusho-neon/10 font-medium transition-colors">
                      <Settings className="w-5 h-5" />
                      Account Settings
                    </Link>

                    <Link href="/orders" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-akusho-neon/10 font-medium transition-colors">
                      <Package className="w-5 h-5" />
                      My Orders
                    </Link>

                    <button
                      onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-cyan-500 dark:bg-akusho-neon text-white dark:text-akusho-deepest font-semibold rounded-xl"
                    style={{ boxShadow: "0 0 20px rgba(0, 168, 255, 0.4)" }}
                  >
                    Sign In
                  </Link>
                )}
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center justify-center gap-2 text-gray-400 dark:text-gray-600 text-sm">
                  <span className="w-8 h-[1px] bg-gray-300 dark:bg-akusho-neon/30" />
                  <span className="font-heading text-xs tracking-widest dark:text-akusho-neon/50">AKUSHO</span>
                  <span className="w-8 h-[1px] bg-gray-300 dark:bg-akusho-neon/30" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}