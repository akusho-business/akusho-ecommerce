"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AppWrapper from "@/components/AppWrapper";

interface ClientLayoutProps {
  children: React.ReactNode;
}

/**
 * ClientLayout Component
 * 
 * Handles conditional rendering of:
 * - Navbar (hidden on admin routes)
 * - Footer (hidden on admin routes)  
 * - AppWrapper with cinematic loading screen (only on regular routes)
 * 
 * Admin routes have their own layout in app/admin/layout.tsx
 */
export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  
  // Check if current route is admin
  const isAdminRoute = pathname?.startsWith("/admin");

  // Admin routes - render children only (admin layout handles everything)
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Regular routes - with Navbar, Footer, and cinematic loading screen
  return (
    <AppWrapper>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </AppWrapper>
  );
}