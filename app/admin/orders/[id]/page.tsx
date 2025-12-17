// ============================================
// FILE LOCATION: app/admin/orders/[id]/page.tsx
// STATUS: NEW FILE - Create this folder and file
// PURPOSE: Admin order detail with shipping controls + return button
// ============================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  Printer,
  Send,
  AlertTriangle,
  RotateCcw,
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  FileText,
  Navigation,
  Warehouse,
  PackageCheck,
  CircleDot,
  X,
  AlertCircle,
} from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
  sku?: string;
}

interface TrackingActivity {
  date: string;
  status: string;
  activity: string;
  location: string;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  subtotal: number;
  shipping_cost: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  items: OrderItem[];
  awb_code: string | null;
  shiprocket_order_id: string | null;
  shiprocket_shipment_id: string | null;
  courier_name: string | null;
  label_url: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  expected_delivery: string | null;
  created_at: string;
  updated_at: string;
  razorpay_payment_id: string | null;
}

interface TrackingData {
  status: string;
  awb: string;
  courier: string;
  estimatedDelivery: string | null;
  trackingUrl: string | null;
  activities: TrackingActivity[];
}

const statusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  pending: { color: "text-yellow-400", bgColor: "bg-yellow-500/20", label: "Pending" },
  confirmed: { color: "text-blue-400", bgColor: "bg-blue-500/20", label: "Confirmed" },
  processing: { color: "text-purple-400", bgColor: "bg-purple-500/20", label: "Processing" },
  shipped: { color: "text-cyan-400", bgColor: "bg-cyan-500/20", label: "Shipped" },
  delivered: { color: "text-green-400", bgColor: "bg-green-500/20", label: "Delivered" },
  cancelled: { color: "text-red-400", bgColor: "bg-red-500/20", label: "Cancelled" },
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnNotes, setReturnNotes] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const orderId = params.id as string;

  // Fetch order details
  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const data = await res.json();

      if (data.error) throw new Error(data.error);
      setOrder(data.order);

      // Auto-fetch tracking if AWB exists
      if (data.order?.awb_code) {
        fetchTracking(data.order.awb_code);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      showToast("error", "Failed to load order");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Fetch tracking
  const fetchTracking = async (awb?: string) => {
    const awbCode = awb || order?.awb_code;
    if (!awbCode) return;

    try {
      const res = await fetch(`/api/shipping/track?awb=${awbCode}`);
      const data = await res.json();
      if (data.status !== "error") {
        setTracking(data);
      }
    } catch (error) {
      console.error("Error fetching tracking:", error);
    }
  };

  // Show toast notification
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Shipping action handler
  const handleShippingAction = async (action: string) => {
    if (!order) return;

    setIsActionLoading(action);
    try {
      const res = await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          orderId: order.id,
          shiprocketOrderId: order.shiprocket_order_id,
          shipmentId: order.shiprocket_shipment_id,
          awb: order.awb_code,
        }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      showToast("success", data.message || `${action} completed successfully`);
      fetchOrder(); // Refresh order data
    } catch (error: any) {
      showToast("error", error.message || `Failed to ${action}`);
    } finally {
      setIsActionLoading(null);
    }
  };

  // Create shipment
  const handleCreateShipment = async () => {
    if (!order) return;

    setIsActionLoading("create_shipment");
    try {
      const res = await fetch("/api/shipping/create-shipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to create shipment");
      }

      showToast("success", "Shipment created successfully");
      fetchOrder();
    } catch (error: any) {
      showToast("error", error.message);
    } finally {
      setIsActionLoading(null);
    }
  };

  // Process return
  const handleReturn = async () => {
    if (!order || !returnReason) return;

    setIsActionLoading("return");
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: returnReason,
          notes: returnNotes,
        }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      showToast("success", "Return initiated successfully");
      setShowReturnModal(false);
      setReturnReason("");
      setReturnNotes("");
      fetchOrder();
    } catch (error: any) {
      showToast("error", error.message);
    } finally {
      setIsActionLoading(null);
    }
  };

  // Update order status
  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;

    setIsActionLoading("status");
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      showToast("success", `Status updated to ${newStatus}`);
      fetchOrder();
    } catch (error: any) {
      showToast("error", error.message);
    } finally {
      setIsActionLoading(null);
    }
  };

  // Check if return is allowed (within 7 days of delivery)
  const canInitiateReturn = () => {
    if (!order || order.status !== "delivered" || !order.delivered_at) return false;
    const deliveredDate = new Date(order.delivered_at);
    const now = new Date();
    const daysSinceDelivery = Math.floor(
      (now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceDelivery <= 7;
  };

  const daysUntilReturnExpires = () => {
    if (!order?.delivered_at) return 0;
    const deliveredDate = new Date(order.delivered_at);
    const expiryDate = new Date(deliveredDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    return Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Order Not Found</h2>
        <Link
          href="/admin/orders"
          className="text-purple-400 hover:text-purple-300"
        >
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg flex items-center gap-2 ${
              toast.type === "success"
                ? "bg-green-500/20 border border-green-500/50 text-green-400"
                : "bg-red-500/20 border border-red-500/50 text-red-400"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-gray-400 hover:text-purple-400 mb-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl md:text-3xl text-white">
              {order.order_number}
            </h1>
            <button
              onClick={() => copyToClipboard(order.order_number)}
              className="p-1.5 text-gray-400 hover:text-purple-400 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
            {copied && <span className="text-xs text-purple-400">Copied!</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${status.bgColor} ${status.color}`}>
            {status.label}
          </span>
          {order.payment_status === "paid" && (
            <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-500/20 text-green-400">
              Paid
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Management Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-400" />
                Shipping Management
              </h2>
              {order.awb_code && (
                <button
                  onClick={() => fetchTracking()}
                  className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Shipping Info */}
            {order.awb_code ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-akusho-darker rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">AWB Number</p>
                    <p className="text-white font-mono">{order.awb_code}</p>
                  </div>
                  <div className="p-3 bg-akusho-darker rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Courier</p>
                    <p className="text-white">{order.courier_name || "—"}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {order.label_url && (
                    <a
                      href={order.label_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition-colors text-sm"
                    >
                      <Printer className="w-4 h-4" />
                      Print Label
                    </a>
                  )}
                  <button
                    onClick={() => handleShippingAction("generate_label")}
                    disabled={isActionLoading === "generate_label"}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition-colors text-sm disabled:opacity-50"
                  >
                    <FileText className="w-4 h-4" />
                    {isActionLoading === "generate_label" ? "..." : "Generate Label"}
                  </button>
                  <button
                    onClick={() => handleShippingAction("schedule_pickup")}
                    disabled={isActionLoading === "schedule_pickup"}
                    className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 transition-colors text-sm disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {isActionLoading === "schedule_pickup" ? "..." : "Schedule Pickup"}
                  </button>
                  {tracking?.trackingUrl && (
                    <a
                      href={tracking.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-akusho-darker text-gray-400 rounded-lg hover:text-white transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Track
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 mb-4">No shipment created yet</p>
                {order.payment_status === "paid" && order.status !== "cancelled" && (
                  <button
                    onClick={handleCreateShipment}
                    disabled={isActionLoading === "create_shipment"}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                  >
                    <Truck className="w-4 h-4" />
                    {isActionLoading === "create_shipment" ? "Creating..." : "Create Shipment"}
                  </button>
                )}
              </div>
            )}

            {/* Live Tracking Timeline */}
            {tracking?.activities && tracking.activities.length > 0 && (
              <div className="mt-6 pt-6 border-t border-purple-500/10">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Tracking History</h3>
                <div className="relative max-h-64 overflow-y-auto pr-2">
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-purple-500 via-cyan-500 to-gray-600" />
                  <div className="space-y-3">
                    {tracking.activities.slice(0, 10).map((activity, index) => {
                      const isLatest = index === 0;
                      return (
                        <div key={index} className="relative flex gap-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isLatest
                                ? "bg-purple-500 text-white"
                                : "bg-akusho-darker text-gray-500"
                            }`}
                          >
                            <CircleDot className="w-3 h-3" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${isLatest ? "text-white" : "text-gray-400"}`}>
                              {activity.activity || activity.status}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {activity.location && <span>{activity.location}</span>}
                              {activity.date && (
                                <span>
                                  {new Date(activity.date).toLocaleString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6"
          >
            <h2 className="font-heading text-xl text-white mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-akusho-darker rounded-lg"
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-akusho-deepest flex-shrink-0">
                    <Image
                      src={item.image || "/placeholder.png"}
                      alt={item.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{item.name}</p>
                    <p className="text-sm text-gray-400">
                      {item.sku && <span className="mr-2">SKU: {item.sku}</span>}
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-purple-400 font-semibold">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t border-purple-500/10 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">₹{order.subtotal?.toLocaleString() || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Shipping</span>
                <span className="text-white">
                  {order.shipping_cost ? `₹${order.shipping_cost}` : "Free"}
                </span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-purple-500/10">
                <span className="text-white">Total</span>
                <span className="text-purple-400 text-lg">₹{order.total_amount?.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6"
          >
            <h2 className="font-heading text-lg text-white mb-4">Quick Actions</h2>

            {/* Status Update */}
            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-2 block">Update Status</label>
              <select
                value={order.status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                disabled={isActionLoading === "status"}
                className="w-full px-3 py-2 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Return Button - Only shown within 7 days of delivery */}
            {canInitiateReturn() && (
              <div className="pt-4 border-t border-purple-500/10">
                <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-xs text-yellow-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Return window: {daysUntilReturnExpires()} days remaining
                  </p>
                </div>
                <button
                  onClick={() => setShowReturnModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Initiate Return
                </button>
              </div>
            )}

            {order.status === "delivered" && !canInitiateReturn() && (
              <div className="pt-4 border-t border-purple-500/10">
                <p className="text-xs text-gray-500 text-center">
                  Return window has expired
                </p>
              </div>
            )}

            {/* Cancel Shipment */}
            {order.awb_code && order.status === "processing" && (
              <button
                onClick={() => handleShippingAction("cancel_shipment")}
                disabled={isActionLoading === "cancel_shipment"}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                {isActionLoading === "cancel_shipment" ? "Cancelling..." : "Cancel Shipment"}
              </button>
            )}
          </motion.div>

          {/* Customer Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6"
          >
            <h2 className="font-heading text-lg text-white mb-4">Customer</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-white">{order.customer_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <a
                  href={`mailto:${order.customer_email}`}
                  className="text-purple-400 hover:underline"
                >
                  {order.customer_email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <a
                  href={`tel:${order.customer_phone}`}
                  className="text-white"
                >
                  {order.customer_phone}
                </a>
              </div>
            </div>
          </motion.div>

          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6"
          >
            <h2 className="font-heading text-lg text-white mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400" />
              Shipping Address
            </h2>
            <div className="text-gray-400 text-sm space-y-1">
              <p className="text-white font-medium">{order.customer_name}</p>
              <p>{order.shipping_address}</p>
              <p>
                {order.shipping_city}, {order.shipping_state}
              </p>
              <p className="font-mono">{order.shipping_pincode}</p>
            </div>
          </motion.div>

          {/* Order Meta */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6"
          >
            <h2 className="font-heading text-lg text-white mb-4">Order Info</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Created
                </span>
                <span className="text-white">
                  {new Date(order.created_at).toLocaleDateString("en-IN")}
                </span>
              </div>
              {order.shipped_at && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Shipped
                  </span>
                  <span className="text-white">
                    {new Date(order.shipped_at).toLocaleDateString("en-IN")}
                  </span>
                </div>
              )}
              {order.delivered_at && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Delivered
                  </span>
                  <span className="text-white">
                    {new Date(order.delivered_at).toLocaleDateString("en-IN")}
                  </span>
                </div>
              )}
              {order.razorpay_payment_id && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment ID
                  </span>
                  <span className="text-white font-mono text-xs">
                    {order.razorpay_payment_id.slice(-12)}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Return Modal */}
      <AnimatePresence>
        {showReturnModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowReturnModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-akusho-dark border border-purple-500/30 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading text-xl text-white">Initiate Return</h3>
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Return Reason *
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full px-3 py-2.5 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500"
                  >
                    <option value="">Select a reason</option>
                    <option value="wrong_item">Wrong Item Received</option>
                    <option value="damaged">Damaged / Broken Item</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Additional Notes
                  </label>
                  <textarea
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    placeholder="Any additional details..."
                    rows={3}
                    className="w-full px-3 py-2.5 bg-akusho-darker border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 resize-none"
                  />
                </div>

                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-xs text-yellow-400">
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    This will initiate a return request in Shiprocket. The customer will be contacted for pickup.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowReturnModal(false)}
                    className="flex-1 px-4 py-2.5 bg-akusho-darker text-gray-400 rounded-lg hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReturn}
                    disabled={!returnReason || isActionLoading === "return"}
                    className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isActionLoading === "return" ? "Processing..." : "Confirm Return"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}