"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

/**
 * AuthGuard Component
 * 
 * ⚠️ IMPORTANT: This component should ONLY be used on pages that 
 * explicitly require authentication. DO NOT wrap the entire app!
 * 
 * PUBLIC PAGES (NO AuthGuard needed):
 * - Home (/)
 * - Shop (/shop)
 * - Product details (/product/[id])
 * - Cart (/cart) - uses localStorage, no auth needed
 * - About, Contact, etc.
 * 
 * PROTECTED PAGES (USE AuthGuard):
 * - Checkout (/checkout) - needs user to save order
 * - Account (/account) - user profile
 * - Orders (/orders) - user's order history
 * - Admin pages (/admin/*) - admin only
 * 
 * Usage Examples:
 * 
 * // For pages requiring login (checkout, account, orders)
 * export default function CheckoutPage() {
 *   return (
 *     <AuthGuard requireAuth>
 *       <CheckoutContent />
 *     </AuthGuard>
 *   );
 * }
 * 
 * // For admin-only pages
 * // Note: Admin layout already handles this, so you usually don't need it
 * export default function AdminPage() {
 *   return (
 *     <AuthGuard requireAdmin>
 *       <AdminContent />
 *     </AuthGuard>
 *   );
 * }
 * 
 * // For guest-only pages (login, register) - redirects logged-in users away
 * export default function LoginPage() {
 *   return (
 *     <AuthGuard requireAuth={false} redirectTo="/">
 *       <LoginForm />
 *     </AuthGuard>
 *   );
 * }
 */
export default function AuthGuard({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo,
  fallback,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, isLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkComplete, setCheckComplete] = useState(false);

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    let authorized = true;
    let redirect = redirectTo;

    if (requireAdmin) {
      // Admin required
      if (!user) {
        authorized = false;
        redirect = redirect || `/auth/login?redirect=${encodeURIComponent(pathname || "/admin")}`;
      } else if (!isAdmin) {
        authorized = false;
        redirect = redirect || "/"; // Non-admins go home
      }
    } else if (requireAuth) {
      // Auth required (any logged-in user)
      if (!user) {
        authorized = false;
        redirect = redirect || `/auth/login?redirect=${encodeURIComponent(pathname || "/")}`;
      }
    } else {
      // Guest only (requireAuth === false)
      // For login/register pages - redirect logged-in users away
      if (user) {
        authorized = false;
        redirect = redirect || "/";
      }
    }

    if (!authorized && redirect) {
      router.push(redirect);
    } else {
      setIsAuthorized(authorized);
    }

    setCheckComplete(true);
  }, [user, isAdmin, isLoading, requireAuth, requireAdmin, router, pathname, redirectTo]);

  // Show loading state
  if (isLoading || !checkComplete) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-akusho-deepest">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="w-10 h-10 text-akusho-neon animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // Access denied for admin routes
  if (requireAdmin && user && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-akusho-deepest px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-red-500 dark:text-red-400" />
          </div>
          <h1 className="font-heading text-2xl text-gray-900 dark:text-white mb-3">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don&apos;t have permission to access this page.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-akusho-neon text-akusho-deepest font-semibold rounded-lg hover:bg-akusho-neon/90 transition-colors"
          >
            Go Home
          </Link>
        </motion.div>
      </div>
    );
  }

  // Authorized - render children
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Redirecting...
  return null;
}

/**
 * HOC for protecting pages
 * 
 * Usage:
 * export default withAuth(CheckoutPage);
 * export default withAuth(AdminPage, { requireAdmin: true });
 */
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Omit<AuthGuardProps, "children"> = {}
) {
  return function WithAuthComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <WrappedComponent {...props} />
      </AuthGuard>
    );
  };
}

/**
 * Hook for checking auth status WITHOUT blocking
 * 
 * Use this when you want to conditionally show UI based on auth,
 * but don't want to block/redirect the user.
 * 
 * Usage:
 * const { isAuthenticated, isAdmin } = useAuthStatus();
 * 
 * return (
 *   <div>
 *     {isAuthenticated ? (
 *       <button onClick={checkout}>Checkout</button>
 *     ) : (
 *       <Link href="/auth/login">Login to Checkout</Link>
 *     )}
 *   </div>
 * );
 */
export function useAuthStatus() {
  const { user, isAdmin, isLoading } = useAuth();
  
  return {
    isAuthenticated: !!user,
    isAdmin,
    isLoading,
    user,
  };
}