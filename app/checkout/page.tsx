// ============================================
// FILE: app/checkout/page.tsx
// PURPOSE: Checkout with dynamic Shiprocket shipping calculation
// ============================================

"use client";

import { useState, useEffect, useCallback } from "react";
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
  Package,
  Clock,
  Zap,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Types
interface ShippingData {
  serviceable: boolean;
  shipping_cost: number;
  original_cost: number;
  courier_name: string;
  estimated_days: number;
  message?: string;
  free_shipping: {
    threshold: number;
    qualifies: boolean;
    amount_needed: number;
  };
}

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
              {status === "success" ? (
                <CheckCircle className="w-10 h-10" style={{ color: current.iconColor }} />
              ) : status === "error" ? (
                <AlertCircle className="w-10 h-10" style={{ color: current.iconColor }} />
              ) : (
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: current.iconColor }} />
              )}
            </motion.div>

            <h3 className={`text-xl font-semibold mb-2 ${current.color}`}>
              {current.title}
            </h3>
            <p className="text-gray-400 text-sm">{current.subtitle}</p>
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

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<"creating" | "processing" | "verifying" | "success" | "error">("creating");
  const [error, setError] = useState("");
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

  // Shipping state
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState("");

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

  // Calculate shipping when pincode changes
  const calculateShipping = useCallback(async (pincode: string) => {
    if (!pincode || pincode.length !== 6) {
      setShippingData(null);
      return;
    }

    setIsCalculatingShipping(true);
    setShippingError("");

    try {
      const response = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delivery_pincode: pincode,
          weight: 0.5, // Default weight, adjust based on cart items if needed
          cod: false,
          declared_value: cartTotal,
        }),
      });

      const data = await response.json();

      if (data.serviceable === false) {
        setShippingError(data.message || "Delivery not available to this pincode");
        setShippingData(null);
      } else {
        setShippingData(data);
        setShippingError("");
      }
    } catch (err) {
      console.error("Shipping calculation error:", err);
      // Use fallback rate on error
      setShippingData({
        serviceable: true,
        shipping_cost: 70,
        original_cost: 70,
        courier_name: "Standard Delivery",
        estimated_days: 5,
        free_shipping: {
          threshold: 999,
          qualifies: cartTotal >= 999,
          amount_needed: Math.max(0, 999 - cartTotal),
        },
      });
    } finally {
      setIsCalculatingShipping(false);
    }
  }, [cartTotal]);

  // Trigger shipping calculation when pincode is complete
  useEffect(() => {
    if (formData.pincode.length === 6) {
      calculateShipping(formData.pincode);
    }
  }, [formData.pincode, calculateShipping]);

  // Recalculate shipping when cart total changes (for free shipping threshold)
  useEffect(() => {
    if (formData.pincode.length === 6 && shippingData) {
      calculateShipping(formData.pincode);
    }
  }, [cartTotal]);

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
    
    // For pincode, only allow digits and max 6 chars
    if (name === "pincode") {
      const cleanValue = value.replace(/\D/g, "").slice(0, 6);
      setFormData((prev) => ({ ...prev, [name]: cleanValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    setError("");
  };

  // Apply coupon
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
  const shippingCost = shippingData?.shipping_cost ?? 70; // Fallback to 70 if not calculated
  const total = subtotal + shippingCost - discount;

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
    if (shippingError) return "Delivery not available to this pincode";
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
          shipping: shippingCost,  // Dynamic shipping cost!
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

      // Check if Razorpay is available
      if (typeof window === "undefined" || !(window as any).Razorpay) {
        throw new Error("Payment gateway not loaded. Please refresh the page.");
      }

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error("Payment configuration error. Please contact support.");
      }

      // Initialize Razorpay
      const options = {
        key: razorpayKey,
        amount: Math.round(total * 100),
        currency: "INR",
        name: "AKUSHO",
        description: `Order ${data.orderNumber}`,
        image: "/logo.png",
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
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
            toast.error("Payment verification failed");
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
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
            setLoadingStatus("creating");
            toast.info("Payment cancelled");
          },
        },
      };

      const RazorpayConstructor = (window as any).Razorpay;
      const razorpay = new RazorpayConstructor(options);
      razorpay.open();
    } catch (err: any) {
      setLoadingStatus("error");
      setError(err.message || "Something went wrong");
      toast.error("Checkout failed", { description: err.message });
      setIsLoading(false);
    }
  };

  if (cartCount === 0 && !isPaymentComplete) {
    return null;
  }

  return (
    <>
      <LoadingOverlay isVisible={isLoading} status={loadingStatus} message={error} />

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
                        Pincode *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          placeholder="400001"
                          maxLength={6}
                          className={`w-full px-4 py-3 bg-gray-50 dark:bg-akusho-dark border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${
                            shippingError
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : shippingData?.serviceable
                              ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                              : "border-gray-200 dark:border-akusho-neon/20 focus:border-akusho-neon focus:ring-akusho-neon"
                          }`}
                        />
                        {isCalculatingShipping && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-akusho-neon animate-spin" />
                        )}
                        {!isCalculatingShipping && shippingData?.serviceable && (
                          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                        )}
                        {!isCalculatingShipping && shippingError && (
                          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                        )}
                      </div>
                      {shippingError && (
                        <p className="mt-1 text-xs text-red-500">{shippingError}</p>
                      )}
                    </div>

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
                  </div>
                </div>

                {/* Shipping Info Card */}
                {shippingData?.serviceable && !shippingError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 p-4 bg-akusho-neon/5 border border-akusho-neon/20 rounded-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-akusho-neon/10 rounded-lg">
                          <Truck className="w-5 h-5 text-akusho-neon" />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">
                            {shippingData.courier_name}
                          </p>
                          <p className="text-gray-400 text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Delivery in {shippingData.estimated_days} days
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {shippingData.free_shipping.qualifies ? (
                          <div>
                            <span className="text-green-400 font-bold">FREE</span>
                            <p className="text-xs text-gray-500 line-through">
                              ₹{shippingData.original_cost}
                            </p>
                          </div>
                        ) : (
                          <span className="text-white font-bold">
                            ₹{shippingData.shipping_cost}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Free shipping progress */}
                    {!shippingData.free_shipping.qualifies && shippingData.free_shipping.amount_needed > 0 && (
                      <div className="mt-3 pt-3 border-t border-akusho-neon/10">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-400">Free shipping progress</span>
                          <span className="text-akusho-neon">
                            Add ₹{Math.ceil(shippingData.free_shipping.amount_needed)} more
                          </span>
                        </div>
                        <div className="h-1.5 bg-akusho-dark rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-akusho-neon to-purple-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min(
                                (cartTotal / shippingData.free_shipping.threshold) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
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
                          You save ₹{appliedCoupon.discount.toFixed(0)}
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
                    {isCalculatingShipping ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Calculating...
                      </span>
                    ) : shippingData?.free_shipping.qualifies ? (
                      <span className="text-green-400 font-medium">FREE</span>
                    ) : (
                      <span>₹{shippingCost}</span>
                    )}
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount</span>
                      <span>-₹{discount.toFixed(0)}</span>
                    </div>
                  )}
                </div>

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
                  disabled={isLoading || !!shippingError || isCalculatingShipping}
                  className="w-full py-4 bg-akusho-neon text-akusho-deepest font-bold rounded-xl hover:bg-akusho-neonLight transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ boxShadow: "0 0 20px rgba(0, 168, 255, 0.4)" }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : isCalculatingShipping ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Calculating Shipping...
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