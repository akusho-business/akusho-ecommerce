// app/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  Tag,
  ChevronLeft,
  Loader2,
  Shield,
  Truck,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Declare Razorpay on window
declare global {
  interface Window {
    Razorpay: new (options: any) => any;
  }
}

const SHIPPING_COST = 70;

// Loading Overlay Component
function LoadingOverlay({
  isVisible,
  status,
  message,
}: {
  isVisible: boolean;
  status: "creating" | "processing" | "verifying" | "success" | "error";
  message?: string;
}) {
  const statusConfig = {
    creating: {
      title: "Creating Order",
      subtitle: "Setting up your order...",
      color: "text-akusho-neon",
      iconColor: "#00A8FF",
    },
    processing: {
      title: "Processing Payment",
      subtitle: "Please complete payment in Razorpay window...",
      color: "text-akusho-neon",
      iconColor: "#00A8FF",
    },
    verifying: {
      title: "Verifying Payment",
      subtitle: "Almost there...",
      color: "text-purple-500",
      iconColor: "#8B5CF6",
    },
    success: {
      title: "Payment Successful!",
      subtitle: "Redirecting to order confirmation...",
      color: "text-green-500",
      iconColor: "#10B981",
    },
    error: {
      title: "Something went wrong",
      subtitle: message || "Please try again",
      color: "text-red-500",
      iconColor: "#EF4444",
    },
  };

  const current = statusConfig[status];

  // SVG Icons
  const icons = {
    creating: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke={current.iconColor} strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    processing: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke={current.iconColor} strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    verifying: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke={current.iconColor} strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    success: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke={current.iconColor} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke={current.iconColor} strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-akusho-darker border border-akusho-neon/20 rounded-2xl p-8 max-w-sm w-full mx-4 text-center"
          >
            {/* Animated Icon */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: status === "creating" || status === "verifying" ? [0, 360] : 0,
              }}
              transition={{
                duration: status === "creating" || status === "verifying" ? 3 : 2,
                repeat: status === "success" || status === "error" ? 0 : Infinity,
                ease: "easeInOut",
              }}
              className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full"
              style={{ 
                background: `linear-gradient(135deg, ${current.iconColor}15, ${current.iconColor}05)`,
                border: `1px solid ${current.iconColor}30`,
              }}
            >
              {icons[status]}
            </motion.div>

            {/* Title */}
            <h3 className={`text-xl font-semibold mb-2 ${current.color}`}>
              {current.title}
            </h3>

            {/* Subtitle */}
            <p className="text-gray-400 text-sm mb-6">{current.subtitle}</p>

            {/* Loading Bar */}
            {(status === "creating" || status === "verifying" || status === "processing") && (
              <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ 
                    background: `linear-gradient(90deg, ${current.iconColor}, #8B5CF6, ${current.iconColor})`,
                  }}
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            )}

            {/* Success Checkmark Animation */}
            {status === "success" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="w-14 h-14 mx-auto bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center"
              >
                <motion.svg
                  className="w-7 h-7 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartCount, cartTotal, clearCart } = useCart();
  const { user, profile } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<"creating" | "processing" | "verifying" | "success" | "error">("creating");
  const [error, setError] = useState("");
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user && profile) {
      setFormData((prev) => ({
        ...prev,
        name: profile.full_name || "",
        email: user.email || "",
        phone: profile.phone || "",
        address: profile.address_line1 || "",
        city: profile.city || "",
        state: profile.state || "",
        pincode: profile.postal_code || "",
      }));
    }
  }, [user, profile]);

  // Redirect if cart is empty (but not after successful payment)
  useEffect(() => {
    if (cartCount === 0 && !isPaymentComplete) {
      toast.error("Your cart is empty", {
        description: "Add some items before checkout",
      });
      router.push("/cart");
    }
  }, [cartCount, router, isPaymentComplete]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // Apply coupon (only for logged in users)
  const handleApplyCoupon = async () => {
    if (!user) {
      setCouponError("Please login to apply coupon");
      toast.error("Login required", { description: "Please login to apply coupons" });
      return;
    }

    if (!couponCode.trim()) {
      setCouponError("Enter a coupon code");
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError("");

    // TODO: Validate coupon from backend
    const validCoupons: Record<string, number> = {
      AKUSHO10: 10,
      FIRST20: 20,
      ANIME15: 15,
    };

    setTimeout(() => {
      const discount = validCoupons[couponCode.toUpperCase()];
      if (discount) {
        const discountAmount = (cartTotal * discount) / 100;
        setAppliedCoupon({ code: couponCode.toUpperCase(), discount: discountAmount });
        setCouponError("");
        toast.success(`Coupon applied!`, {
          description: `You save ₹${discountAmount.toFixed(0)}`,
          icon: "🎉",
        });
      } else {
        setCouponError("Invalid coupon code");
        setAppliedCoupon(null);
        toast.error("Invalid coupon code");
      }
      setIsApplyingCoupon(false);
    }, 500);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    toast.info("Coupon removed");
  };

  // Calculate totals
  const subtotal = cartTotal;
  const discount = appliedCoupon?.discount || 0;
  const total = subtotal + SHIPPING_COST - discount;

  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Invalid email";
    if (!formData.phone.trim()) return "Phone is required";
    if (!/^[6-9]\d{9}$/.test(formData.phone)) return "Invalid phone number (10 digits starting with 6-9)";
    if (!formData.address.trim()) return "Address is required";
    if (!formData.city.trim()) return "City is required";
    if (!formData.state.trim()) return "State is required";
    if (!formData.pincode.trim()) return "Pincode is required";
    if (!/^\d{6}$/.test(formData.pincode)) return "Invalid pincode (6 digits)";
    return null;
  };

  // Handle checkout
  const handleCheckout = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setIsLoading(true);
    setLoadingStatus("creating");
    setError("");

    try {
      // Create order in backend
      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          },
          shippingAddress: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
          subtotal,
          shipping: SHIPPING_COST,
          discount,
          couponCode: appliedCoupon?.code,
          userId: user?.id || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      toast.success(`Order #${data.orderNumber} created`, {
        description: "Opening payment gateway...",
      });

      setLoadingStatus("processing");

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(total * 100),
        currency: "INR",
        name: "AKUSHO",
        description: `Order ${data.orderNumber}`,
        image: "/logo.png",
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
          // Payment successful - verify
          setLoadingStatus("verifying");
          toast.loading("Verifying payment...", { id: "verify-payment" });

          try {
            const verifyResponse = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: data.orderId,
              }),
            });

            const verifyData = await verifyResponse.json();
            toast.dismiss("verify-payment");

            if (verifyData.success) {
              setLoadingStatus("success");
              setIsPaymentComplete(true);
              
              toast.success("Payment successful! 🎉", {
                description: `Order #${verifyData.orderNumber} confirmed`,
                duration: 5000,
              });

              clearCart();

              // Redirect after showing success
              setTimeout(() => {
                router.push(`/order-success?orderNumber=${verifyData.orderNumber}`);
              }, 1500);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (err) {
            toast.dismiss("verify-payment");
            setLoadingStatus("error");
            setError("Payment verification failed. Please contact support if amount was deducted.");
            toast.error("Payment verification failed", {
              description: "Please contact support if amount was deducted",
            });
            setIsLoading(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        },
        theme: {
          color: "#00A8FF",
          backdrop_color: "rgba(0, 0, 0, 0.8)",
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
            setLoadingStatus("creating");
            toast.info("Payment cancelled", {
              description: "You can try again when ready",
            });
          },
          escape: false,
          backdropclose: false,
        },
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on("payment.failed", function (response: any) {
        setIsLoading(false);
        setLoadingStatus("error");
        toast.error("Payment failed", {
          description: response.error?.description || "Please try again",
        });
      });

      razorpay.open();
    } catch (err: any) {
      setLoadingStatus("error");
      setError(err.message || "Something went wrong");
      toast.error("Checkout failed", {
        description: err.message || "Please try again",
      });
      setIsLoading(false);
    }
  };

  if (cartCount === 0 && !isPaymentComplete) {
    return null;
  }

  return (
    <>
      {/* Loading Overlay */}
      <LoadingOverlay 
        isVisible={isLoading} 
        status={loadingStatus} 
        message={error}
      />

      <main className="min-h-screen bg-gray-50 dark:bg-akusho-deepest pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="py-6 md:py-8">
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-akusho-neon transition-colors mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Cart
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Checkout
            </h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-akusho-darker rounded-2xl p-6 border border-gray-200 dark:border-akusho-neon/20"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-akusho-neon" />
                  Customer Details
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-akusho-dark border border-gray-200 dark:border-akusho-neon/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-akusho-neon focus:ring-1 focus:ring-akusho-neon transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="9876543210"
                        maxLength={10}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-akusho-dark border border-gray-200 dark:border-akusho-neon/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-akusho-neon focus:ring-1 focus:ring-akusho-neon transition-colors"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-akusho-dark border border-gray-200 dark:border-akusho-neon/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-akusho-neon focus:ring-1 focus:ring-akusho-neon transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Shipping Address */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-akusho-darker rounded-2xl p-6 border border-gray-200 dark:border-akusho-neon/20"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-akusho-neon" />
                  Shipping Address
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="House no, Building, Street, Area"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-akusho-dark border border-gray-200 dark:border-akusho-neon/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-akusho-neon focus:ring-1 focus:ring-akusho-neon transition-colors"
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Mumbai"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-akusho-dark border border-gray-200 dark:border-akusho-neon/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-akusho-neon focus:ring-1 focus:ring-akusho-neon transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Maharashtra"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-akusho-dark border border-gray-200 dark:border-akusho-neon/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-akusho-neon focus:ring-1 focus:ring-akusho-neon transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="400001"
                        maxLength={6}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-akusho-dark border border-gray-200 dark:border-akusho-neon/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-akusho-neon focus:ring-1 focus:ring-akusho-neon transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Coupon Code */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-akusho-darker rounded-2xl p-6 border border-gray-200 dark:border-akusho-neon/20"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-akusho-neon" />
                  Coupon Code
                  {!user && (
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">
                      (Login to apply)
                    </span>
                  )}
                </h2>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-green-700 dark:text-green-400">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-500">
                          You save ₹{appliedCoupon.discount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError("");
                      }}
                      placeholder="Enter coupon code"
                      disabled={!user}
                      className="flex-1 px-4 py-3 bg-gray-50 dark:bg-akusho-dark border border-gray-200 dark:border-akusho-neon/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-akusho-neon focus:ring-1 focus:ring-akusho-neon transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!user || isApplyingCoupon}
                      className="px-6 py-3 bg-akusho-neon text-akusho-deepest font-semibold rounded-xl hover:bg-akusho-neonLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isApplyingCoupon ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </div>
                )}

                {couponError && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {couponError}
                  </p>
                )}

                {!user && (
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <Link href="/auth/login" className="text-akusho-neon hover:underline">
                      Login
                    </Link>{" "}
                    to apply coupon codes and get discounts!
                  </p>
                )}
              </motion.div>
            </div>

            {/* Right - Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-akusho-darker rounded-2xl p-6 border border-gray-200 dark:border-akusho-neon/20 sticky top-24"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-akusho-neon" />
                  Order Summary
                </h2>

                {/* Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4 pr-2 scrollbar-thin">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-akusho-dark flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.png"}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ₹{item.price.toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-200 dark:bg-akusho-neon/20 my-4" />

                {/* Pricing */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({cartCount} items)</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Shipping
                    </span>
                    <span>₹{SHIPPING_COST}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount</span>
                      <span>-₹{discount.toFixed(0)}</span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-200 dark:bg-akusho-neon/20 my-4" />

                {/* Total */}
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white mb-6">
                  <span>Total</span>
                  <span className="text-akusho-neon">₹{total.toLocaleString()}</span>
                </div>

                {/* Error */}
                {error && !isLoading && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </p>
                  </div>
                )}

                {/* Pay Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full py-4 bg-akusho-neon text-akusho-deepest font-bold rounded-xl hover:bg-akusho-neonLight transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    boxShadow: "0 0 20px rgba(0, 168, 255, 0.4)",
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay ₹{total.toLocaleString()}
                    </>
                  )}
                </button>

                {/* Trust badges */}
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Secure Payment
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    Fast Delivery
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}