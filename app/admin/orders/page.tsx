"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  RefreshCw,
  Search,
  Package,
  CheckCircle2,
  XCircle,
  Truck,
  Clock,
  Send,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  User,
  AlertCircle,
  X,
  Check,
  Ban,
} from "lucide-react";

// Types
interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  image_url?: string;
  image?: string;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_pincode?: string;
  items: OrderItem[];
  total: number;
  total_amount?: number;
  subtotal?: number;
  shipping_cost?: number;
  status: string;
  payment_status: string;
  awb_code?: string;
  courier_name?: string;
  label_url?: string;
  tracking_url?: string;
  created_at: string;
  shipped_at?: string;
  delivered_at?: string;
}

interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  statuses: string[];
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

// ✅ FIXED Tab Configuration - "processing" now in "To Process" tab
const TABS: TabConfig[] = [
  {
    id: "new",
    label: "New Orders",
    icon: <Clock className="w-5 h-5" />,
    statuses: ["pending", "pending_review"],
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/50",
    description: "Accept or reject new orders",
  },
  {
    id: "process",
    label: "To Process",
    icon: <Package className="w-5 h-5" />,
    statuses: ["confirmed", "processing"],  // ✅ FIXED: Added "processing" here
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/50",
    description: "Pack and ship orders",
  },
  {
    id: "ready",
    label: "Ready to Ship",
    icon: <Send className="w-5 h-5" />,
    statuses: ["ready_to_dispatch"],  // ✅ FIXED: Removed "processing" from here
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    borderColor: "border-purple-500/50",
    description: "Awaiting courier pickup",
  },
  {
    id: "shipped",
    label: "Shipped",
    icon: <Truck className="w-5 h-5" />,
    statuses: ["shipped", "out_for_delivery"],
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
    borderColor: "border-cyan-500/50",
    description: "In transit to customer",
  },
  {
    id: "completed",
    label: "Completed",
    icon: <CheckCircle2 className="w-5 h-5" />,
    statuses: ["delivered"],
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/50",
    description: "Successfully delivered",
  },
  {
    id: "cancelled",
    label: "Cancelled/RTO",
    icon: <XCircle className="w-5 h-5" />,
    statuses: ["cancelled", "rto_initiated", "rto_delivered"],
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/50",
    description: "Cancelled or returned orders",
  },
];

// Rejection reasons
const REJECT_REASONS = [
  "Out of stock",
  "Unable to fulfill",
  "Invalid address",
  "Customer request",
  "Suspected fraud",
  "Other",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("new");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());
  const [processingOrders, setProcessingOrders] = useState<Set<number>>(new Set());
  const [stats, setStats] = useState<Record<string, number>>({});
  
  // Reject modal state
  const [rejectModal, setRejectModal] = useState<{ open: boolean; orderId: number | null }>({
    open: false,
    orderId: null,
  });
  const [rejectReason, setRejectReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  // Clear selection when tab changes
  useEffect(() => {
    setSelectedOrders(new Set());
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      
      if (data.orders) {
        setOrders(data.orders);
      }
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter orders by tab and search
  const currentTab = TABS.find((t) => t.id === activeTab)!;
  const filteredOrders = orders.filter((order) => {
    const matchesTab = currentTab.statuses.includes(order.status);
    const matchesSearch =
      !searchQuery ||
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone?.includes(searchQuery) ||
      order.awb_code?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Calculate tab counts
  const getTabCount = (tab: TabConfig) => {
    return orders.filter((o) => tab.statuses.includes(o.status)).length;
  };

  // Toggle order expansion
  const toggleExpand = (orderId: number) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  // Toggle order selection
  const toggleSelect = (orderId: number) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  // Select all visible orders
  const toggleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map((o) => o.id)));
    }
  };

  // Action handlers
  const handleAccept = async (orderId: number) => {
    setProcessingOrders((prev) => new Set(prev).add(orderId));
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      });
      
      if (res.ok) {
        await fetchOrders();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to accept order");
      }
    } catch (error) {
      console.error("Accept failed:", error);
      alert("Failed to accept order");
    } finally {
      setProcessingOrders((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const handleReject = async () => {
    if (!rejectModal.orderId) return;
    
    const reason = rejectReason === "Other" ? customReason : rejectReason;
    if (!reason) {
      alert("Please select or enter a reason");
      return;
    }

    setProcessingOrders((prev) => new Set(prev).add(rejectModal.orderId!));
    try {
      const res = await fetch(`/api/admin/orders/${rejectModal.orderId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason }),
      });
      
      if (res.ok) {
        setRejectModal({ open: false, orderId: null });
        setRejectReason("");
        setCustomReason("");
        await fetchOrders();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to reject order");
      }
    } catch (error) {
      console.error("Reject failed:", error);
      alert("Failed to reject order");
    } finally {
      setProcessingOrders((prev) => {
        const next = new Set(prev);
        next.delete(rejectModal.orderId!);
        return next;
      });
    }
  };

  const handleShipNow = async (orderId: number) => {
    setProcessingOrders((prev) => new Set(prev).add(orderId));
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ready_to_dispatch" }),
      });
      
      if (res.ok) {
        await fetchOrders();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to process shipment");
      }
    } catch (error) {
      console.error("Ship failed:", error);
      alert("Failed to process shipment");
    } finally {
      setProcessingOrders((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  // Bulk actions
  const handleBulkAccept = async () => {
    const orderIds = Array.from(selectedOrders);
    for (let i = 0; i < orderIds.length; i++) {
      await handleAccept(orderIds[i]);
    }
    setSelectedOrders(new Set());
  };

  const handleBulkShip = async () => {
    const orderIds = Array.from(selectedOrders);
    for (let i = 0; i < orderIds.length; i++) {
      await handleShipNow(orderIds[i]);
    }
    setSelectedOrders(new Set());
  };

  // Format helpers
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: "bg-yellow-500/30", text: "text-yellow-300", label: "Pending" },
      pending_review: { bg: "bg-orange-500/30", text: "text-orange-300", label: "Review" },
      confirmed: { bg: "bg-blue-500/30", text: "text-blue-300", label: "Confirmed" },
      processing: { bg: "bg-indigo-500/30", text: "text-indigo-300", label: "Processing" },
      ready_to_dispatch: { bg: "bg-purple-500/30", text: "text-purple-300", label: "Ready" },
      shipped: { bg: "bg-cyan-500/30", text: "text-cyan-300", label: "Shipped" },
      out_for_delivery: { bg: "bg-teal-500/30", text: "text-teal-300", label: "Out for Delivery" },
      delivered: { bg: "bg-green-500/30", text: "text-green-300", label: "Delivered" },
      cancelled: { bg: "bg-red-500/30", text: "text-red-300", label: "Cancelled" },
      rto_initiated: { bg: "bg-rose-500/30", text: "text-rose-300", label: "RTO" },
      rto_delivered: { bg: "bg-rose-500/30", text: "text-rose-300", label: "RTO Complete" },
    };
    
    const c = config[status] || { bg: "bg-gray-500/30", text: "text-gray-300", label: status };
    
    return (
      <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-semibold ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  // Payment badge component
  const PaymentBadge = ({ status }: { status: string }) => {
    if (status === "paid") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-green-500/30 text-green-300">
          <Check className="w-4 h-4" /> Paid
        </span>
      );
    }
    if (status === "cod") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-orange-500/30 text-orange-300">
          COD
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-yellow-500/30 text-yellow-300">
        <Clock className="w-4 h-4" /> Pending
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-akusho-neon animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Orders</h1>
          <p className="text-gray-400 mt-1 text-base sm:text-lg">Manage your order workflow</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-akusho-dark border border-purple-500/30 rounded-xl text-white hover:bg-purple-500/10 transition-all text-base font-medium"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-akusho-dark rounded-2xl p-2 border border-purple-500/20">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const count = getTabCount(tab);
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all text-base ${
                  isActive
                    ? `${tab.bgColor} ${tab.color} ${tab.borderColor} border-2`
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-sm font-bold ${
                      isActive ? `${tab.bgColor} ${tab.color}` : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Description & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className={`text-lg font-medium ${currentTab.color}`}>{currentTab.description}</p>
          <p className="text-gray-500 text-base">{filteredOrders.length} orders</p>
        </div>
        
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by order #, name, email, phone, AWB..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-akusho-darker border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none text-base"
          />
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedOrders.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-4 p-4 bg-akusho-dark border border-purple-500/30 rounded-xl"
        >
          <span className="text-white font-medium text-base">
            {selectedOrders.size} selected
          </span>
          
          {activeTab === "new" && (
            <>
              <button
                onClick={handleBulkAccept}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all text-base"
              >
                <CheckCircle2 className="w-5 h-5" />
                Accept All
              </button>
            </>
          )}
          
          {activeTab === "process" && (
            <button
              onClick={handleBulkShip}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all text-base"
            >
              <Send className="w-5 h-5" />
              Ship All
            </button>
          )}
          
          <button
            onClick={() => setSelectedOrders(new Set())}
            className="text-gray-400 hover:text-white transition-colors text-base"
          >
            Clear selection
          </button>
        </motion.div>
      )}

      {/* Orders List */}
      <div className="bg-akusho-dark border border-purple-500/20 rounded-2xl overflow-hidden">
        {/* Table Header - Desktop */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-4 bg-akusho-darker border-b border-purple-500/20 text-gray-400 font-medium text-base">
          <div className="col-span-1 flex items-center">
            <input
              type="checkbox"
              checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
              onChange={toggleSelectAll}
              className="w-5 h-5 rounded border-gray-600 bg-akusho-darker text-akusho-neon focus:ring-akusho-neon cursor-pointer"
            />
          </div>
          <div className="col-span-3">ORDER</div>
          <div className="col-span-2">CUSTOMER</div>
          <div className="col-span-1 text-center">ITEMS</div>
          <div className="col-span-1 text-right">TOTAL</div>
          <div className="col-span-2 text-center">AWB</div>
          <div className="col-span-2 text-right">ACTIONS</div>
        </div>

        {/* Orders */}
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">No orders in this tab</p>
            <p className="text-gray-500 mt-2 text-base">Orders will appear here when their status changes</p>
          </div>
        ) : (
          <div className="divide-y divide-purple-500/10">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrders.has(order.id);
              const isSelected = selectedOrders.has(order.id);
              const isProcessing = processingOrders.has(order.id);
              const itemCount = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
              const orderTotal = order.total || order.total_amount || 0;

              return (
                <div key={order.id} className={`${isSelected ? "bg-purple-500/10" : ""}`}>
                  {/* Main Row */}
                  <div className="p-4 sm:p-6">
                    {/* Mobile Layout */}
                    <div className="lg:hidden space-y-4">
                      {/* Top: Checkbox, Order #, Date */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(order.id)}
                          className="w-5 h-5 mt-1 rounded border-gray-600 bg-akusho-darker text-akusho-neon focus:ring-akusho-neon cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className="font-mono font-bold text-white text-lg">{order.order_number}</p>
                          <p className="text-gray-500 text-sm">{formatDate(order.created_at)}</p>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>

                      {/* Customer & Items */}
                      <div className="flex flex-wrap gap-4 text-base">
                        <div className="flex items-center gap-2 text-gray-300">
                          <User className="w-4 h-4 text-gray-500" />
                          {order.customer_name || "—"}
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Package className="w-4 h-4 text-gray-500" />
                          {itemCount} {itemCount === 1 ? "item" : "items"}
                        </div>
                      </div>

                      {/* Total & Payment */}
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-akusho-neon">{formatCurrency(orderTotal)}</span>
                        <PaymentBadge status={order.payment_status} />
                      </div>

                      {/* AWB if exists */}
                      {order.awb_code && (
                        <div className="flex items-center gap-2 p-3 bg-akusho-darker rounded-lg">
                          <span className="text-gray-400 text-sm">AWB:</span>
                          <span className="font-mono text-white">{order.awb_code}</span>
                          {order.courier_name && (
                            <span className="text-gray-500">({order.courier_name})</span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        {activeTab === "new" && (
                          <>
                            <button
                              onClick={() => handleAccept(order.id)}
                              disabled={isProcessing}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all text-base"
                            >
                              {isProcessing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-5 h-5" />
                              )}
                              Accept
                            </button>
                            <button
                              onClick={() => setRejectModal({ open: true, orderId: order.id })}
                              disabled={isProcessing}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all text-base"
                            >
                              <XCircle className="w-5 h-5" />
                              Reject
                            </button>
                          </>
                        )}
                        
                        {activeTab === "process" && (
                          <button
                            onClick={() => handleShipNow(order.id)}
                            disabled={isProcessing}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all text-base"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Send className="w-5 h-5" />
                            )}
                            Ship Now
                          </button>
                        )}
                        
                        {activeTab === "ready" && order.label_url && (
                          <a
                            href={order.label_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all text-base"
                          >
                            <Download className="w-5 h-5" />
                            Download Label
                          </a>
                        )}
                        
                        {(activeTab === "shipped" || activeTab === "completed") && order.tracking_url && (
                          <a
                            href={order.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold transition-all text-base"
                          >
                            <ExternalLink className="w-5 h-5" />
                            Track
                          </a>
                        )}

                        <button
                          onClick={() => toggleExpand(order.id)}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-akusho-darker border border-purple-500/30 text-gray-300 rounded-xl font-medium transition-all text-base"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          Details
                        </button>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
                      {/* Checkbox */}
                      <div className="col-span-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(order.id)}
                          className="w-5 h-5 rounded border-gray-600 bg-akusho-darker text-akusho-neon focus:ring-akusho-neon cursor-pointer"
                        />
                      </div>

                      {/* Order Info */}
                      <div className="col-span-3">
                        <p className="font-mono font-bold text-white text-lg">{order.order_number}</p>
                        <p className="text-gray-500 text-sm mt-1">{formatDate(order.created_at)}</p>
                        <div className="mt-2">
                          <StatusBadge status={order.status} />
                        </div>
                      </div>

                      {/* Customer */}
                      <div className="col-span-2">
                        <p className="text-white font-medium text-base">{order.customer_name || "—"}</p>
                        <p className="text-gray-500 text-sm truncate">{order.customer_email || "—"}</p>
                      </div>

                      {/* Items */}
                      <div className="col-span-1 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-akusho-darker rounded-lg text-white font-medium text-base">
                          {itemCount} {itemCount === 1 ? "item" : "items"}
                        </span>
                      </div>

                      {/* Total */}
                      <div className="col-span-1 text-right">
                        <p className="text-xl font-bold text-akusho-neon">{formatCurrency(orderTotal)}</p>
                        <div className="mt-1">
                          <PaymentBadge status={order.payment_status} />
                        </div>
                      </div>

                      {/* AWB */}
                      <div className="col-span-2 text-center">
                        {order.awb_code ? (
                          <div>
                            <p className="font-mono text-white text-base">{order.awb_code}</p>
                            {order.courier_name && (
                              <p className="text-gray-500 text-sm">{order.courier_name}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        {activeTab === "new" && (
                          <>
                            <button
                              onClick={() => handleAccept(order.id)}
                              disabled={isProcessing}
                              className="flex items-center gap-1.5 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-all text-base"
                            >
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                              Accept
                            </button>
                            <button
                              onClick={() => setRejectModal({ open: true, orderId: order.id })}
                              disabled={isProcessing}
                              className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-all text-base"
                            >
                              <Ban className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        )}
                        
                        {activeTab === "process" && (
                          <button
                            onClick={() => handleShipNow(order.id)}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-all text-base"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            Ship Now
                          </button>
                        )}
                        
                        {activeTab === "ready" && order.label_url && (
                          <a
                            href={order.label_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all text-base"
                          >
                            <Download className="w-4 h-4" />
                            Label
                          </a>
                        )}
                        
                        {(activeTab === "shipped" || activeTab === "completed") && order.tracking_url && (
                          <a
                            href={order.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-all text-base"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Track
                          </a>
                        )}

                        <button
                          onClick={() => toggleExpand(order.id)}
                          className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                          title="View details"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>

                        <a
                          href={`/admin/orders/${order.id}`}
                          className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                          title="Open order"
                        >
                          <Eye className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-purple-500/10">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Order Items */}
                            <div className="lg:col-span-2">
                              <h4 className="text-base font-semibold text-gray-400 mb-4">ORDER ITEMS</h4>
                              <div className="space-y-3">
                                {order.items?.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-4 p-4 bg-akusho-darker rounded-xl"
                                  >
                                    {item.image_url || item.image ? (
                                      <img
                                        src={item.image_url || item.image}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded-lg"
                                      />
                                    ) : (
                                      <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                                        <Package className="w-6 h-6 text-gray-500" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-white font-medium text-base truncate">{item.name}</p>
                                      <p className="text-gray-400 text-sm">Qty: {item.quantity || 1}</p>
                                    </div>
                                    <p className="text-white font-semibold text-lg">
                                      {formatCurrency(item.price * (item.quantity || 1))}
                                    </p>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Order Summary */}
                              <div className="mt-4 p-4 bg-akusho-darker rounded-xl space-y-2">
                                {order.subtotal && (
                                  <div className="flex justify-between text-base">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span className="text-white">{formatCurrency(order.subtotal)}</span>
                                  </div>
                                )}
                                {order.shipping_cost !== undefined && (
                                  <div className="flex justify-between text-base">
                                    <span className="text-gray-400">Shipping</span>
                                    <span className="text-white">
                                      {order.shipping_cost === 0 ? "FREE" : formatCurrency(order.shipping_cost)}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between text-lg font-bold pt-2 border-t border-purple-500/20">
                                  <span className="text-white">Total</span>
                                  <span className="text-akusho-neon">{formatCurrency(orderTotal)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Customer & Shipping Info */}
                            <div className="space-y-6">
                              {/* Customer Info */}
                              <div>
                                <h4 className="text-base font-semibold text-gray-400 mb-4">CUSTOMER</h4>
                                <div className="p-4 bg-akusho-darker rounded-xl space-y-3">
                                  <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-gray-500" />
                                    <span className="text-white text-base">{order.customer_name || "—"}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-gray-500" />
                                    <span className="text-white text-base break-all">{order.customer_email || "—"}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-gray-500" />
                                    <span className="text-white text-base">{order.customer_phone || "—"}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Shipping Address */}
                              <div>
                                <h4 className="text-base font-semibold text-gray-400 mb-4">SHIPPING ADDRESS</h4>
                                <div className="p-4 bg-akusho-darker rounded-xl">
                                  <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                                    <div className="text-white text-base leading-relaxed">
                                      <p>{order.shipping_address}</p>
                                      {(order.shipping_city || order.shipping_state || order.shipping_pincode) && (
                                        <p className="mt-1">
                                          {[order.shipping_city, order.shipping_state, order.shipping_pincode]
                                            .filter(Boolean)
                                            .join(", ")}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setRejectModal({ open: false, orderId: null })}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-akusho-dark border border-red-500/30 rounded-2xl p-6 sm:p-8 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Reject Order</h3>
                    <p className="text-gray-400 text-sm">This action cannot be undone</p>
                  </div>
                </div>
                <button
                  onClick={() => setRejectModal({ open: false, orderId: null })}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-300 text-base">Select a reason for rejection:</p>
                
                <div className="grid grid-cols-2 gap-3">
                  {REJECT_REASONS.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setRejectReason(reason)}
                      className={`px-4 py-3 rounded-xl text-base font-medium transition-all ${
                        rejectReason === reason
                          ? "bg-red-500/30 border-2 border-red-500 text-red-300"
                          : "bg-akusho-darker border border-purple-500/20 text-gray-300 hover:border-red-500/50"
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>

                {rejectReason === "Other" && (
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Enter reason..."
                    className="w-full px-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:outline-none text-base resize-none"
                    rows={3}
                  />
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setRejectModal({ open: false, orderId: null })}
                    className="flex-1 px-6 py-3 border border-purple-500/30 text-gray-300 rounded-xl font-medium hover:bg-white/5 transition-all text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!rejectReason || (rejectReason === "Other" && !customReason)}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all text-base"
                  >
                    Reject Order
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