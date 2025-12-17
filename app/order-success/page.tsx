// app/order-success/page.tsx
"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Confetti from "react-confetti";

// Confetti Colors - Subtle AKUSHO theme
const confettiColors = [
  "#00A8FF", // Cyan
  "#8B5CF6", // Purple
  "#ffffff", // White
];

// Animated Checkmark Component - Clean Professional Style
function AnimatedCheckmark() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.2,
      }}
      className="relative w-28 h-28 mx-auto mb-8"
    >
      {/* Outer Ring - Rotating gradient border */}
      <motion.div
        className="absolute inset-0 rounded-full p-[3px]"
        style={{
          background: "conic-gradient(from 0deg, #00A8FF, #8B5CF6, #00A8FF)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-full h-full rounded-full bg-akusho-deepest" />
      </motion.div>

      {/* Inner Circle with Checkmark */}
      <div className="absolute inset-3 rounded-full bg-akusho-deepest border border-green-500/30 flex items-center justify-center">
        <motion.svg
          className="w-10 h-10 text-green-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M20 6L9 17l-5-5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
          />
        </motion.svg>
      </div>
    </motion.div>
  );
}

// Floating Celebration Elements - ANIME STYLE (No childish emojis)
function FloatingElements() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Subtle rising particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: "-10px",
            background: i % 2 === 0 ? "#00A8FF" : "#8B5CF6",
            boxShadow: i % 2 === 0 
              ? "0 0 6px #00A8FF, 0 0 12px #00A8FF" 
              : "0 0 6px #8B5CF6, 0 0 12px #8B5CF6",
          }}
          animate={{
            y: [0, -800],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            delay: Math.random() * 5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Horizontal light streaks */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`streak-${i}`}
          className="absolute h-[1px]"
          style={{
            top: `${15 + i * 15}%`,
            left: 0,
            right: 0,
            background: "linear-gradient(90deg, transparent, rgba(0, 168, 255, 0.3), transparent)",
          }}
          animate={{
            opacity: [0, 0.5, 0],
            scaleX: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            delay: i * 0.5,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        />
      ))}
    </div>
  );
}

// Order Details Card - Clean Professional Style
function OrderDetails({ orderNumber }: { orderNumber: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="bg-akusho-darker/80 backdrop-blur-sm rounded-xl p-6 border border-akusho-neon/20 mb-8 max-w-md mx-auto w-full"
      style={{ boxShadow: "0 0 30px rgba(0, 168, 255, 0.08)" }}
    >
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
        <span className="text-gray-400 text-sm">Order Number</span>
        <span className="text-akusho-neon font-mono font-bold tracking-wide">
          {orderNumber}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm">Status</span>
        <span className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-full text-sm font-medium flex items-center gap-2 border border-green-500/20">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Confirmed
        </span>
      </div>
    </motion.div>
  );
}

// What's Next Timeline - Professional Style
function WhatsNext() {
  const steps = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "Confirmation Email",
      description: "Check your inbox",
      delay: 1.2,
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      title: "Processing",
      description: "Preparing your items",
      delay: 1.3,
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
      title: "Shipped",
      description: "Track in real-time",
      delay: 1.4,
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
        </svg>
      ),
      title: "Delivered",
      description: "Enjoy your order",
      delay: 1.5,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="mb-8 w-full max-w-2xl mx-auto"
    >
      <h3 className="text-lg font-semibold text-white mb-6 text-center">
        What happens next?
      </h3>
      
      {/* Timeline container */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute top-8 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-akusho-neon/30 to-transparent hidden md:block" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: step.delay }}
              className="text-center group"
            >
              {/* Icon circle */}
              <motion.div
                className="w-16 h-16 mx-auto mb-3 rounded-full bg-akusho-darker border border-akusho-neon/20 flex items-center justify-center text-akusho-neon relative"
                whileHover={{ scale: 1.05, borderColor: "rgba(0, 168, 255, 0.5)" }}
              >
                {/* Pulse ring on hover */}
                <div className="absolute inset-0 rounded-full border border-akusho-neon/20 group-hover:animate-ping opacity-0 group-hover:opacity-100" />
                {step.icon}
              </motion.div>
              
              <h4 className="text-white text-sm font-medium mb-1">{step.title}</h4>
              <p className="text-gray-500 text-xs">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Main Content Component (needs Suspense for useSearchParams)
function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = searchParams.get("orderNumber") || searchParams.get("order") || "N/A";

  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(true);

  // Handle window resize for confetti
  const handleResize = useCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    // Stop confetti after 4 seconds
    const timer = setTimeout(() => setShowConfetti(false), 4000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [handleResize]);

  // Redirect if no order number
  useEffect(() => {
    if (orderNumber === "N/A") {
      router.push("/shop");
    }
  }, [orderNumber, router]);

  return (
    <main className="min-h-screen bg-akusho-deepest relative overflow-hidden">
      {/* Confetti - Subtle */}
      {showConfetti && windowSize.width > 0 && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          colors={confettiColors}
          numberOfPieces={100}
          recycle={false}
          gravity={0.15}
          opacity={0.7}
        />
      )}

      {/* Floating Elements */}
      <FloatingElements />

      {/* Background - Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-akusho-neon/3 via-transparent to-purple-500/3" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
        {/* Animated Checkmark */}
        <AnimatedCheckmark />

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 font-oswald tracking-wide">
            Order{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-akusho-neon to-purple-500">
              Successful
            </span>
          </h1>
          <p className="text-gray-400 text-base max-w-md mx-auto">
            Thank you for your order. You will receive a confirmation email shortly.
          </p>
        </motion.div>

        {/* Order Details */}
        <OrderDetails orderNumber={orderNumber} />

        {/* What's Next */}
        <WhatsNext />

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Link
            href="/orders"
            className="px-8 py-3 bg-akusho-neon text-akusho-deepest font-semibold rounded-lg hover:bg-akusho-neon/90 transition-all text-center text-sm"
          >
            View My Orders
          </Link>
          <Link
            href="/shop"
            className="px-8 py-3 bg-transparent border border-gray-700 text-white font-semibold rounded-lg hover:border-akusho-neon/50 hover:text-akusho-neon transition-all text-center text-sm"
          >
            Continue Shopping
          </Link>
        </motion.div>

        {/* Support Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="mt-10 text-gray-600 text-xs text-center"
        >
          Need help?{" "}
          <a
            href="mailto:support@akusho.com"
            className="text-akusho-neon/70 hover:text-akusho-neon transition-colors"
          >
            support@akusho.com
          </a>
        </motion.p>
      </div>
    </main>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <main className="min-h-screen bg-akusho-deepest flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-akusho-neon border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-gray-400">Loading your order...</p>
      </div>
    </main>
  );
}

// Main export with Suspense boundary
export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OrderSuccessContent />
    </Suspense>
  );
}