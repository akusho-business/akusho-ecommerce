"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Instagram, Twitter, Youtube, Mail } from "lucide-react";

const footerLinks = {
  shop: [
    { name: "All Products", href: "/shop" },
    { name: "New Arrivals", href: "/shop?filter=new" },
    { name: "Best Sellers", href: "/shop?filter=best" },
    { name: "Collections", href: "/shop?filter=collections" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Careers", href: "/careers" },
    { name: "Blog", href: "/blog" },
  ],
  support: [
    { name: "FAQs", href: "/faq" },
    { name: "Shipping", href: "/shipping" },
    { name: "Returns", href: "/returns" },
    { name: "Track Order", href: "/track" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com" },
  { icon: Twitter, href: "https://twitter.com" },
  { icon: Youtube, href: "https://youtube.com" },
  { icon: Mail, href: "mailto:hello@akusho.com" },
];

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-theme-darker border-t border-theme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/">
              <span className="font-heading text-3xl text-theme-primary neon-text">
                AKUSHO
              </span>
            </Link>
            <p className="mt-4 text-theme-muted max-w-sm">
              Your premier destination for authentic anime collectibles and merchandise.
              Bringing the world of anime to life, one figure at a time.
            </p>
            <div className="flex gap-4 mt-6">
              {socialLinks.map(({ icon: Icon, href }, index) => (
                <motion.a
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-theme-dark rounded-full text-theme-muted hover:text-theme-neon hover:bg-purple-500/10 dark:hover:bg-purple-500/10 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading text-lg text-theme-primary mb-4">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-theme-muted hover:text-theme-neon transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg text-theme-primary mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-theme-muted hover:text-theme-neon transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg text-theme-primary mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-theme-muted hover:text-theme-neon transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-theme flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-theme-muted text-sm">
            © {new Date().getFullYear()} AKUSHO. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-theme-muted">
            <Link href="/privacy" className="hover:text-theme-neon transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-theme-neon transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}