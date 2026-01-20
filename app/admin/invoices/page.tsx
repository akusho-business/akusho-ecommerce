"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Send,
  Trash2,
  X,
  Loader2,
  IndianRupee,
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  CheckCircle,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  Eye,
  Receipt,
  Search,
} from "lucide-react";
import { toast } from "sonner";

// Types
interface Product {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
  image_url: string;
}

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  original_price: number;
  product_id?: number;
}

interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_method: string;
  payment_status: string;
  stall_location: string | null;
  notes: string | null;
  email_sent: boolean;
  email_sent_at: string | null;
  invoice_date: string;
  created_at: string;
}

interface Stats {
  totalInvoices: number;
  totalRevenue: number;
  paidCount: number;
  pendingCount: number;
}

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalInvoices: 0,
    totalRevenue: 0,
    paidCount: 0,
    pendingCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [sendingEmail, setSendingEmail] = useState<number | null>(null);

  // Fetch invoices
  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/invoices");
      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setInvoices(data.invoices || []);
      setStats(data.stats || {});
    } catch (error) {
      toast.error("Failed to fetch invoices");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Send email
  const handleSendEmail = async (invoiceId: number) => {
    setSendingEmail(invoiceId);
    try {
      const res = await fetch("/api/admin/invoices/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Invoice sent successfully!");
        fetchInvoices(); // Refresh to update email_sent status
      } else {
        toast.error(data.error || "Failed to send email");
      }
    } catch (error) {
      toast.error("Failed to send email");
    } finally {
      setSendingEmail(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-gray-900 dark:text-white mb-2">
            Offline Invoices
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Create and send invoices for offline/stall sales
          </p>
        </div>

        <motion.button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-500 text-white font-heading rounded-lg hover:bg-purple-400 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          Create Invoice
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Invoices</p>
              <p className="font-heading text-2xl text-gray-900 dark:text-white">
                {stats.totalInvoices}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-lg flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Revenue</p>
              <p className="font-heading text-2xl text-green-600 dark:text-green-400">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Paid</p>
              <p className="font-heading text-2xl text-emerald-600 dark:text-emerald-400">
                {stats.paidCount}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Pending</p>
              <p className="font-heading text-2xl text-amber-600 dark:text-amber-400">
                {stats.pendingCount}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Invoices List */}
      <div className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-heading text-lg text-gray-900 dark:text-white mb-2">
              No invoices yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create your first offline invoice
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-purple-500/20 bg-gray-50 dark:bg-akusho-darker/50">
                  <th className="text-left p-4 text-gray-500 dark:text-gray-400 font-medium text-sm">Invoice #</th>
                  <th className="text-left p-4 text-gray-500 dark:text-gray-400 font-medium text-sm">Customer</th>
                  <th className="text-left p-4 text-gray-500 dark:text-gray-400 font-medium text-sm">Date</th>
                  <th className="text-right p-4 text-gray-500 dark:text-gray-400 font-medium text-sm">Amount</th>
                  <th className="text-center p-4 text-gray-500 dark:text-gray-400 font-medium text-sm">Status</th>
                  <th className="text-center p-4 text-gray-500 dark:text-gray-400 font-medium text-sm">Email</th>
                  <th className="text-right p-4 text-gray-500 dark:text-gray-400 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, index) => (
                  <motion.tr
                    key={invoice.id}
                    className="border-b border-gray-100 dark:border-purple-500/10 hover:bg-gray-50 dark:hover:bg-purple-500/5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <td className="p-4">
                      <span className="font-mono text-purple-600 dark:text-purple-400 font-medium">
                        {invoice.invoice_number}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">{invoice.customer_name}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{invoice.customer_email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {new Date(invoice.invoice_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-heading text-lg text-gray-900 dark:text-white">
                        {formatCurrency(invoice.total)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          invoice.payment_status === "paid"
                            ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                            : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {invoice.payment_status === "paid" ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {invoice.payment_status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {invoice.email_sent ? (
                        <span className="text-green-500 dark:text-green-400">
                          <CheckCircle className="w-5 h-5 inline" />
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingInvoice(invoice)}
                          className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-500/10 rounded-lg transition-colors"
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSendEmail(invoice.id)}
                          disabled={sendingEmail === invoice.id}
                          className={`p-2 rounded-lg transition-colors ${
                            invoice.email_sent
                              ? "text-gray-400 hover:text-purple-500 hover:bg-purple-500/10"
                              : "text-purple-500 hover:bg-purple-500/10"
                          }`}
                          title={invoice.email_sent ? "Resend Email" : "Send Email"}
                        >
                          {sendingEmail === invoice.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateInvoiceModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchInvoices();
            }}
          />
        )}
      </AnimatePresence>

      {/* View Invoice Modal */}
      <AnimatePresence>
        {viewingInvoice && (
          <ViewInvoiceModal
            invoice={viewingInvoice}
            onClose={() => setViewingInvoice(null)}
            onSendEmail={() => handleSendEmail(viewingInvoice.id)}
            isSending={sendingEmail === viewingInvoice.id}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Create Invoice Modal WITH PRODUCT AUTOCOMPLETE
function CreateInvoiceModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    stall_location: "",
    payment_method: "cash",
    payment_status: "paid",
    notes: "",
    invoice_date: new Date().toISOString().split("T")[0],
  });
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);

  // Product autocomplete states
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts([]);
      setShowDropdown(false);
      return;
    }

    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
    setShowDropdown(true);
  }, [searchQuery, products]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      console.log("Fetching products from /api/products...");
      const res = await fetch("/api/products");
      
      console.log("Response status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Response not OK:", errorText);
        throw new Error(`Failed to fetch products: ${res.status}`);
      }

      const data = await res.json();
      console.log("Products data received:", data);
      
      if (data.error) {
        console.error("API returned error:", data.error);
        throw new Error(data.error);
      }

      // Handle both {products: [...]} and [...] response formats
      const productList = Array.isArray(data) ? data : (data.products || []);
      console.log(`Successfully loaded ${productList.length} products`);
      setProducts(productList);
      
      if (productList.length === 0) {
        toast.info("No products available. Add products first.");
      }
      
    } catch (err: any) {
      console.error("Error fetching products:", err);
      toast.error(err.message || "Failed to load products");
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const addProductToInvoice = (product: Product) => {
    const newItem: InvoiceItem = {
      name: product.name,
      quantity: 1,
      price: product.price,
      original_price: product.price,
      product_id: product.id,
    };

    setItems([...items, newItem]);
    setSearchQuery("");
    setShowDropdown(false);
    toast.success(`${product.name} added`);
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const total = subtotal - discount + tax;

  // Remove item
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Update item
  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.customer_name || !formData.customer_email) {
      toast.error("Please fill in customer name and email");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items,
          subtotal,
          discount,
          tax,
          total,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`Invoice ${data.invoice.invoice_number} created!`);
        onSuccess();
      } else {
        toast.error(data.error || "Failed to create invoice");
      }
    } catch (error) {
      toast.error("Failed to create invoice");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-xl w-full max-w-2xl my-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-purple-500/20">
          <h2 className="font-heading text-xl text-gray-900 dark:text-white">
            Create Offline Invoice
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-purple-500/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="space-y-4">
            <h3 className="font-heading text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="Customer name"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-akusho-darker border border-gray-200 dark:border-purple-500/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-akusho-darker border border-gray-200 dark:border-purple-500/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-akusho-darker border border-gray-200 dark:border-purple-500/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stall/Event Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.stall_location}
                    onChange={(e) => setFormData({ ...formData, stall_location: e.target.value })}
                    placeholder="e.g., Comic Con Mumbai 2025"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-akusho-darker border border-gray-200 dark:border-purple-500/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Search & Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Items
              </h3>
              <span className="text-xs text-gray-400">
                {items.length} item{items.length !== 1 ? "s" : ""} added
              </span>
            </div>

            {/* Product Search Dropdown */}
            <div ref={searchRef} className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isLoadingProducts 
                      ? "Loading products..." 
                      : products.length === 0 
                        ? "No products available"
                        : `Search from ${products.length} products...`
                  }
                  disabled={isLoadingProducts || products.length === 0}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-akusho-darker border-2 border-gray-200 dark:border-purple-500/30 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {isLoadingProducts && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500 animate-spin" />
                )}
              </div>

              {/* Product Dropdown */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-akusho-dark border-2 border-purple-500/30 rounded-lg shadow-2xl max-h-64 overflow-y-auto z-10"
                  >
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => addProductToInvoice(product)}
                          className="w-full flex items-center gap-4 p-4 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors border-b border-gray-100 dark:border-purple-500/10 last:border-0 text-left"
                        >
                          {product.image_url && (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded border border-gray-200 dark:border-purple-500/20"
                            />
                          )}
                          <div className="flex-1">
                            <p className="text-gray-900 dark:text-white font-medium">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Stock: {product.stock_quantity}
                            </p>
                          </div>
                          <p className="text-purple-600 dark:text-purple-400 font-semibold">
                            ₹{product.price.toFixed(2)}
                          </p>
                        </button>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No products found matching "{searchQuery}"</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Added Items List */}
            <div className="space-y-3">
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 items-start bg-gray-50 dark:bg-akusho-darker border border-gray-200 dark:border-purple-500/20 rounded-lg p-3"
                >
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium text-sm">
                      {item.name}
                    </p>
                    {item.price !== item.original_price && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Original: ₹{item.original_price.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                      min="1"
                      placeholder="Qty"
                      className="w-full px-3 py-2 bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded text-gray-900 dark:text-white text-center text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="w-28">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                      <input
                        type="number"
                        value={item.price || ""}
                        onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        placeholder="Price"
                        className="w-full pl-7 pr-3 py-2 bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="w-24 py-2 text-right font-medium text-gray-900 dark:text-white text-sm">
                    {formatCurrency(item.quantity * item.price)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}

              {items.length === 0 && (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Search and add products above</p>
                </div>
              )}
            </div>
          </div>

          {/* Totals & Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Payment Info */}
            <div className="space-y-4">
              <h3 className="font-heading text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Payment
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Method
                </label>
                <div className="flex gap-2">
                  {[
                    { id: "cash", label: "Cash", icon: Banknote },
                    { id: "upi", label: "UPI", icon: Smartphone },
                    { id: "card", label: "Card", icon: CreditCard },
                  ].map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, payment_method: method.id })}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                          formData.payment_method === method.id
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            : "border-gray-200 dark:border-gray-700 text-gray-500"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="flex gap-2">
                  {[
                    { id: "paid", label: "Paid", color: "green" },
                    { id: "pending", label: "Pending", color: "amber" },
                  ].map((status) => (
                    <button
                      key={status.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, payment_status: status.id })}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                        formData.payment_status === status.id
                          ? status.color === "green"
                            ? "border-green-500 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400"
                            : "border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "border-gray-200 dark:border-gray-700 text-gray-500"
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-4">
              <h3 className="font-heading text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Totals
              </h3>
              <div className="space-y-3 bg-gray-50 dark:bg-akusho-darker rounded-lg p-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Discount</span>
                  <div className="relative w-28">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <input
                      type="number"
                      value={discount || ""}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      min="0"
                      className="w-full pl-7 pr-3 py-1.5 bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-lg text-gray-900 dark:text-white text-right text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <div className="relative w-28">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <input
                      type="number"
                      value={tax || ""}
                      onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                      min="0"
                      className="w-full pl-7 pr-3 py-1.5 bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-lg text-gray-900 dark:text-white text-right text-sm"
                    />
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-purple-500/20 flex justify-between">
                  <span className="font-heading text-lg text-gray-900 dark:text-white">Total</span>
                  <span className="font-heading text-xl text-purple-600 dark:text-purple-400">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes..."
              rows={2}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-akusho-darker border border-gray-200 dark:border-purple-500/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-purple-500/20">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-purple-500/30 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-purple-500/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-purple-500 text-white font-heading rounded-lg hover:bg-purple-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Create Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// View Invoice Modal (unchanged)
function ViewInvoiceModal({
  invoice,
  onClose,
  onSendEmail,
  isSending,
}: {
  invoice: Invoice;
  onClose: () => void;
  onSendEmail: () => void;
  isSending: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-xl w-full max-w-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-purple-500/20">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Invoice</p>
            <h2 className="font-heading text-xl text-purple-600 dark:text-purple-400">
              {invoice.invoice_number}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-purple-500/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Customer */}
          <div className="bg-gray-50 dark:bg-akusho-darker rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Customer</p>
            <p className="font-medium text-gray-900 dark:text-white">{invoice.customer_name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.customer_email}</p>
            {invoice.customer_phone && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.customer_phone}</p>
            )}
          </div>

          {/* Items */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Items</p>
            <div className="space-y-2">
              {invoice.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-900 dark:text-white">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {formatCurrency(item.quantity * item.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 dark:border-purple-500/20 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900 dark:text-white">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-500">Discount</span>
                <span className="text-green-500">-{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            {invoice.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(invoice.tax)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-purple-500/20">
              <span className="font-heading text-gray-900 dark:text-white">Total</span>
              <span className="font-heading text-xl text-purple-600 dark:text-purple-400">
                {formatCurrency(invoice.total)}
              </span>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                invoice.payment_status === "paid"
                  ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                  : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
              }`}
            >
              {invoice.payment_status === "paid" ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              {invoice.payment_status} via {invoice.payment_method.toUpperCase()}
            </span>
            {invoice.email_sent && (
              <span className="text-sm text-green-500 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Email sent
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-purple-500/20">
          <button
            onClick={onSendEmail}
            disabled={isSending}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 text-white font-heading rounded-lg hover:bg-purple-400 transition-colors disabled:opacity-50"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                {invoice.email_sent ? "Resend Invoice Email" : "Send Invoice Email"}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}