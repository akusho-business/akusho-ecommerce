"use client";

// app/admin/orders/[id]/page.tsx
// Admin Order Detail Page with Accept/Reject/RTD workflow

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Download,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  Send,
  FileText,
  History,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Types
interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: number;
  order_number: string;
  created_at: string;
  updated_at: string;
  status: string;
  payment_status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  items: OrderItem[] | string;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  total_amount: number;
  awb_code: string | null;
  courier_name: string | null;
  shiprocket_order_id: string | null;
  shiprocket_shipment_id: string | null;
  label_url: string | null;
  tracking_url: string | null;
  expected_delivery: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  reject_reason: string | null;
  dispatched_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  admin_notes: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
}

interface StatusHistory {
  id: number;
  old_status: string;
  new_status: string;
  changed_by: string;
  change_reason: string;
  created_at: string;
  metadata: any;
}

interface TrackingEvent {
  id: number;
  status: string;
  activity: string;
  location: string;
  timestamp: string;
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Pending" },
    pending_review: { bg: "bg-orange-500/20", text: "text-orange-400", label: "Awaiting Review" },
    confirmed: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Confirmed" },
    processing: { bg: "bg-purple-500/20", text: "text-purple-400", label: "Processing" },
    ready_to_dispatch: { bg: "bg-indigo-500/20", text: "text-indigo-400", label: "Ready to Dispatch" },
    shipped: { bg: "bg-cyan-500/20", text: "text-cyan-400", label: "Shipped" },
    out_for_delivery: { bg: "bg-amber-500/20", text: "text-amber-400", label: "Out for Delivery" },
    delivered: { bg: "bg-green-500/20", text: "text-green-400", label: "Delivered" },
    cancelled: { bg: "bg-red-500/20", text: "text-red-400", label: "Cancelled" },
    rto_initiated: { bg: "bg-rose-500/20", text: "text-rose-400", label: "Return Initiated" },
    rto_delivered: { bg: "bg-gray-500/20", text: "text-gray-400", label: "Returned" },
  };

  const config = statusConfig[status] || { bg: "bg-gray-500/20", text: "text-gray-400", label: status };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// Payment badge
const PaymentBadge = ({ status }: { status: string }) => {
  const isPaid = status === "paid";
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
      isPaid ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
    }`}>
      {isPaid ? "Paid" : status === "cod" ? "COD" : "Pending"}
    </span>
  );
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [tracking, setTracking] = useState<TrackingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch order data
  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/actions`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch order");
      }

      // Parse items if needed
      if (data.order.items && typeof data.order.items === "string") {
        data.order.items = JSON.parse(data.order.items);
      }

      setOrder(data.order);
      setHistory(data.history || []);
      setTracking(data.tracking || []);
      setAdminNotes(data.order.admin_notes || "");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Action handlers
  const handleAccept = async () => {
    if (!order) return;
    setActionLoading("accept");
    setError(null);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept", notes: adminNotes }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to accept order");
      }

      // Refresh order data
      await fetchOrder();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!order || !rejectReason.trim()) return;
    setActionLoading("reject");
    setError(null);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "reject", 
          reason: rejectReason,
          notes: adminNotes,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to reject order");
      }

      setShowRejectModal(false);
      setRejectReason("");
      await fetchOrder();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReadyToDispatch = async () => {
    if (!order) return;
    setActionLoading("rtd");
    setError(null);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ready_to_dispatch" }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to process RTD");
      }

      await fetchOrder();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-akusho-deepest flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-akusho-neon animate-spin" />
          <p className="text-gray-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!order) {
    return (
      <div className="min-h-screen bg-akusho-deepest flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Order Not Found</h2>
          <p className="text-gray-400 mb-4">{error || "The requested order could not be found."}</p>
          <button
            onClick={() => router.push("/admin/orders")}
            className="px-4 py-2 bg-akusho-neon text-akusho-deepest rounded-lg font-medium"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];
  const canAccept = ["pending", "pending_review"].includes(order.status) && order.payment_status === "paid";
  const canReject = !["shipped", "delivered", "cancelled", "rto_initiated", "rto_delivered"].includes(order.status);
  const canRTD = ["confirmed", "processing"].includes(order.status);

  return (
    <div className="min-h-screen bg-akusho-deepest p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/orders")}
              className="p-2 rounded-lg bg-akusho-darker hover:bg-akusho-dark transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Order #{order.order_number}
              </h1>
              <p className="text-gray-400 text-sm">
                Created {new Date(order.created_at).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            <PaymentBadge status={order.payment_status} />
          </div>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        {(canAccept || canReject || canRTD) && (
          <div className="mb-6 p-4 bg-akusho-darker rounded-xl border border-akusho-dark">
            <h3 className="text-white font-medium mb-3">Actions</h3>
            <div className="flex flex-wrap gap-3">
              {canAccept && (
                <button
                  onClick={handleAccept}
                  disabled={actionLoading !== null}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {actionLoading === "accept" ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Accept Order
                </button>
              )}
              
              {canReject && (
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading !== null}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Order
                </button>
              )}

              {canRTD && (
                <button
                  onClick={handleReadyToDispatch}
                  disabled={actionLoading !== null}
                  className="flex items-center gap-2 px-4 py-2 bg-akusho-neon hover:bg-akusho-neon/90 text-akusho-deepest rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {actionLoading === "rtd" ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Ready to Dispatch (RTD)
                </button>
              )}

              <button
                onClick={fetchOrder}
                disabled={actionLoading !== null}
                className="flex items-center gap-2 px-4 py-2 bg-akusho-dark hover:bg-akusho-darker text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${actionLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Shipping Info (if available) */}
        {order.awb_code && (
          <div className="mb-6 p-4 bg-gradient-to-r from-akusho-neon/10 to-akusho-purple/10 rounded-xl border border-akusho-neon/30">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <Truck className="w-5 h-5 text-akusho-neon" />
              Shipping Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-400 text-xs uppercase">AWB / Tracking</p>
                <p className="text-white font-mono font-medium">{order.awb_code}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase">Courier</p>
                <p className="text-white">{order.courier_name || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase">Expected Delivery</p>
                <p className="text-white">{order.expected_delivery || "—"}</p>
              </div>
              <div className="flex gap-2">
                {order.label_url && (
                  <a
                    href={order.label_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-akusho-dark rounded-lg text-sm text-akusho-neon hover:bg-akusho-darker transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Label
                  </a>
                )}
                {order.tracking_url && (
                  <a
                    href={order.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-akusho-dark rounded-lg text-sm text-akusho-neon hover:bg-akusho-darker transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Track
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-akusho-darker rounded-xl border border-akusho-dark overflow-hidden">
              <div className="p-4 border-b border-akusho-dark">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Package className="w-5 h-5 text-akusho-neon" />
                  Order Items ({items.length})
                </h3>
              </div>
              <div className="divide-y divide-akusho-dark">
                {items.map((item, index) => (
                  <div key={index} className="p-4 flex items-center gap-4">
                    <div className="w-16 h-16 bg-akusho-dark rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{item.name}</p>
                      <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">₹{item.price.toLocaleString()}</p>
                      <p className="text-gray-400 text-sm">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-akusho-deepest border-t border-akusho-dark">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{(order.subtotal || order.total_amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span>{order.shipping_cost ? `₹${order.shipping_cost}` : "FREE"}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span>
                      <span>-₹{order.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-akusho-dark">
                    <span>Total</span>
                    <span className="text-akusho-neon">₹{(order.total || order.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="bg-akusho-darker rounded-xl border border-akusho-dark p-4">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-akusho-neon" />
                Admin Notes
              </h3>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about this order..."
                className="w-full h-24 bg-akusho-deepest border border-akusho-dark rounded-lg p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-akusho-neon"
              />
            </div>

            {/* Status History */}
            <div className="bg-akusho-darker rounded-xl border border-akusho-dark overflow-hidden">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full p-4 flex items-center justify-between text-white font-medium hover:bg-akusho-dark transition-colors"
              >
                <span className="flex items-center gap-2">
                  <History className="w-5 h-5 text-akusho-neon" />
                  Status History ({history.length})
                </span>
                {showHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-akusho-dark"
                  >
                    <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                      {history.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">No history yet</p>
                      ) : (
                        history.map((item) => (
                          <div key={item.id} className="flex items-start gap-3 text-sm">
                            <div className="w-2 h-2 bg-akusho-neon rounded-full mt-1.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-white">
                                <span className="text-gray-400">{item.old_status || "—"}</span>
                                {" → "}
                                <StatusBadge status={item.new_status} />
                              </p>
                              {item.change_reason && (
                                <p className="text-gray-400 text-xs mt-1">{item.change_reason}</p>
                              )}
                              <p className="text-gray-500 text-xs mt-1">
                                {new Date(item.created_at).toLocaleString("en-IN")} • {item.changed_by}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-akusho-darker rounded-xl border border-akusho-dark p-4">
              <h3 className="text-white font-medium mb-3">Customer</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-akusho-neon/20 rounded-full flex items-center justify-center">
                    <span className="text-akusho-neon font-medium">
                      {order.customer_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{order.customer_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${order.customer_email}`} className="hover:text-akusho-neon">
                    {order.customer_email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${order.customer_phone}`} className="hover:text-akusho-neon">
                    {order.customer_phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-akusho-darker rounded-xl border border-akusho-dark p-4">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-akusho-neon" />
                Shipping Address
              </h3>
              <div className="text-gray-400 text-sm space-y-1">
                <p className="text-white">{order.customer_name}</p>
                <p>{order.shipping_address}</p>
                <p>
                  {order.shipping_city && `${order.shipping_city}, `}
                  {order.shipping_state}
                </p>
                <p className="font-mono">{order.shipping_pincode}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-akusho-darker rounded-xl border border-akusho-dark p-4">
              <h3 className="text-white font-medium mb-3">Payment</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <PaymentBadge status={order.payment_status} />
                </div>
                {order.razorpay_order_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Order ID</span>
                    <span className="text-white font-mono text-xs">{order.razorpay_order_id}</span>
                  </div>
                )}
                {order.razorpay_payment_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment ID</span>
                    <span className="text-white font-mono text-xs">{order.razorpay_payment_id}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-akusho-darker rounded-xl border border-akusho-dark p-4">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-akusho-neon" />
                Timeline
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Created</span>
                  <span className="text-white">{new Date(order.created_at).toLocaleDateString("en-IN")}</span>
                </div>
                {order.accepted_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Accepted</span>
                    <span className="text-green-400">{new Date(order.accepted_at).toLocaleDateString("en-IN")}</span>
                  </div>
                )}
                {order.dispatched_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Dispatched</span>
                    <span className="text-blue-400">{new Date(order.dispatched_at).toLocaleDateString("en-IN")}</span>
                  </div>
                )}
                {order.shipped_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shipped</span>
                    <span className="text-cyan-400">{new Date(order.shipped_at).toLocaleDateString("en-IN")}</span>
                  </div>
                )}
                {order.delivered_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Delivered</span>
                    <span className="text-green-400">{new Date(order.delivered_at).toLocaleDateString("en-IN")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-akusho-darker rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Reject Order</h3>
              <p className="text-gray-400 mb-4">
                Are you sure you want to reject order <span className="text-white">#{order.order_number}</span>?
                The customer will be notified.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection (required)..."
                className="w-full h-24 bg-akusho-deepest border border-akusho-dark rounded-lg p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-red-500 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 bg-akusho-dark text-white rounded-lg hover:bg-akusho-deepest transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || actionLoading === "reject"}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading === "reject" ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Reject Order
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}