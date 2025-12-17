"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Package,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Loader2,
  IndianRupee,
  PiggyBank,
  Receipt,
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { toast } from "sonner";

// Types
interface FinancialEntry {
  id: number;
  month: string;
  type: "profit" | "expense" | "asset";
  name: string;
  amount: number;
  date: string;
  notes: string | null;
  created_at: string;
}

interface Summary {
  totalProfit: number;
  totalExpense: number;
  totalAssets: number;
  netBalance: number;
  profitCount: number;
  expenseCount: number;
  assetCount: number;
}

// Month names for display
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Get current month in 'YYYY-MM' format
const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

// Format month for display
const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split("-");
  return `${MONTHS[parseInt(month) - 1]} ${year}`;
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function AdminFinancePage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalProfit: 0,
    totalExpense: 0,
    totalAssets: 0,
    netBalance: 0,
    profitCount: 0,
    expenseCount: 0,
    assetCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profit" | "expense" | "asset">("profit");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinancialEntry | null>(null);

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/finance?month=${selectedMonth}`);
      const data = await res.json();
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setEntries(data.entries || []);
      setSummary(data.summary || {
        totalProfit: 0,
        totalExpense: 0,
        totalAssets: 0,
        netBalance: 0,
        profitCount: 0,
        expenseCount: 0,
        assetCount: 0,
      });
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  // Navigate months
  const navigateMonth = (direction: "prev" | "next") => {
    const [year, month] = selectedMonth.split("-").map(Number);
    let newYear = year;
    let newMonth = month + (direction === "next" ? 1 : -1);

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    setSelectedMonth(`${newYear}-${String(newMonth).padStart(2, "0")}`);
  };

  // Filter entries by type
  const filteredEntries = entries.filter((e) => e.type === activeTab);

  // Delete entry
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const res = await fetch(`/api/admin/finance/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success("Entry deleted");
        fetchData();
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch (error) {
      toast.error("Failed to delete entry");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-gray-900 dark:text-white mb-2">
            Finance Tracker
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Track monthly profits, expenses, and assets
          </p>
        </div>

        <motion.button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-500 text-white font-heading rounded-lg hover:bg-purple-400 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          Add Entry
        </motion.button>
      </div>

      {/* Month Selector */}
      <div className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-purple-500/10 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-purple-500" />
            <span className="font-heading text-xl text-gray-900 dark:text-white">
              {formatMonth(selectedMonth)}
            </span>
          </div>

          <button
            onClick={() => navigateMonth("next")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-purple-500/10 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
            disabled={selectedMonth >= getCurrentMonth()}
          >
            <ChevronRight className={`w-5 h-5 ${selectedMonth >= getCurrentMonth() ? "opacity-30" : ""}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-xl p-6 animate-pulse">
              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Profit */}
          <motion.div
            className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {summary.profitCount} entries
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Total Profit</p>
            <p className="font-heading text-2xl text-green-600 dark:text-green-400">
              {formatCurrency(summary.totalProfit)}
            </p>
          </motion.div>

          {/* Total Expenses */}
          <motion.div
            className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {summary.expenseCount} entries
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Total Expenses</p>
            <p className="font-heading text-2xl text-red-600 dark:text-red-400">
              {formatCurrency(summary.totalExpense)}
            </p>
          </motion.div>

          {/* Net Balance */}
          <motion.div
            className={`bg-white dark:bg-akusho-dark border rounded-xl p-6 ${
              summary.netBalance >= 0
                ? "border-green-200 dark:border-green-500/30"
                : "border-red-200 dark:border-red-500/30"
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                summary.netBalance >= 0
                  ? "bg-green-100 dark:bg-green-500/20"
                  : "bg-red-100 dark:bg-red-500/20"
              }`}>
                {summary.netBalance >= 0 ? (
                  <ArrowUpRight className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <ArrowDownRight className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                summary.netBalance >= 0
                  ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                  : "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
              }`}>
                {summary.netBalance >= 0 ? "Profit" : "Loss"}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Net Balance</p>
            <p className={`font-heading text-2xl ${
              summary.netBalance >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}>
              {summary.netBalance >= 0 ? "+" : ""}{formatCurrency(summary.netBalance)}
            </p>
          </motion.div>

          {/* Assets/Stock */}
          <motion.div
            className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Boxes className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {summary.assetCount} entries
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Stock Purchases</p>
            <p className="font-heading text-2xl text-purple-600 dark:text-purple-400">
              {formatCurrency(summary.totalAssets)}
            </p>
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-purple-500/20 pb-1">
        {[
          { id: "profit", label: "Profits", icon: TrendingUp, color: "green" },
          { id: "expense", label: "Expenses", icon: TrendingDown, color: "red" },
          { id: "asset", label: "Assets/Stock", icon: Boxes, color: "purple" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 font-medium rounded-t-lg transition-colors ${
                isActive
                  ? `bg-${tab.color}-100 dark:bg-${tab.color}-500/20 text-${tab.color}-600 dark:text-${tab.color}-400 border-b-2 border-${tab.color}-500`
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              style={isActive ? {
                backgroundColor: tab.color === "green" ? "rgba(34, 197, 94, 0.1)" :
                                 tab.color === "red" ? "rgba(239, 68, 68, 0.1)" :
                                 "rgba(168, 85, 247, 0.1)",
                borderBottomColor: tab.color === "green" ? "#22c55e" :
                                   tab.color === "red" ? "#ef4444" : "#a855f7",
              } : {}}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Entries List */}
      <div className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading entries...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === "profit" && <TrendingUp className="w-8 h-8 text-gray-400" />}
              {activeTab === "expense" && <TrendingDown className="w-8 h-8 text-gray-400" />}
              {activeTab === "asset" && <Boxes className="w-8 h-8 text-gray-400" />}
            </div>
            <h3 className="font-heading text-lg text-gray-900 dark:text-white mb-2">
              No {activeTab === "asset" ? "asset purchases" : `${activeTab}s`} yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Add your first {activeTab} entry for {formatMonth(selectedMonth)}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Entry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-purple-500/20">
                  <th className="text-left p-4 text-gray-500 dark:text-gray-400 font-medium">Date</th>
                  <th className="text-left p-4 text-gray-500 dark:text-gray-400 font-medium">Description</th>
                  <th className="text-right p-4 text-gray-500 dark:text-gray-400 font-medium">Amount</th>
                  <th className="text-right p-4 text-gray-500 dark:text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry, index) => (
                  <motion.tr
                    key={entry.id}
                    className="border-b border-gray-100 dark:border-purple-500/10 hover:bg-gray-50 dark:hover:bg-purple-500/5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {new Date(entry.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="p-4">
                      <p className="text-gray-900 dark:text-white font-medium">{entry.name}</p>
                      {entry.notes && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{entry.notes}</p>
                      )}
                    </td>
                    <td className={`p-4 text-right font-heading text-lg ${
                      activeTab === "profit" ? "text-green-600 dark:text-green-400" :
                      activeTab === "expense" ? "text-red-600 dark:text-red-400" :
                      "text-purple-600 dark:text-purple-400"
                    }`}>
                      {formatCurrency(entry.amount)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingEntry(entry)}
                          className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-500/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || editingEntry) && (
          <EntryModal
            entry={editingEntry}
            month={selectedMonth}
            defaultType={activeTab}
            onClose={() => {
              setShowAddModal(false);
              setEditingEntry(null);
            }}
            onSave={() => {
              setShowAddModal(false);
              setEditingEntry(null);
              fetchData();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Entry Modal Component
interface EntryModalProps {
  entry: FinancialEntry | null;
  month: string;
  defaultType: "profit" | "expense" | "asset";
  onClose: () => void;
  onSave: () => void;
}

function EntryModal({ entry, month, defaultType, onClose, onSave }: EntryModalProps) {
  const isEditing = !!entry;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: entry?.type || defaultType,
    name: entry?.name || "",
    amount: entry?.amount?.toString() || "",
    date: entry?.date || new Date().toISOString().split("T")[0],
    notes: entry?.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const url = isEditing ? `/api/admin/finance/${entry.id}` : "/api/admin/finance";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          month,
          amount: parseFloat(formData.amount),
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(isEditing ? "Entry updated!" : "Entry added!");
        onSave();
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch (error) {
      toast.error("Failed to save entry");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-purple-500/20">
          <h2 className="font-heading text-xl text-gray-900 dark:text-white">
            {isEditing ? "Edit Entry" : "Add New Entry"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-purple-500/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "profit", label: "Profit", icon: TrendingUp, color: "green" },
                { id: "expense", label: "Expense", icon: TrendingDown, color: "red" },
                { id: "asset", label: "Asset", icon: Boxes, color: "purple" },
              ].map((type) => {
                const Icon = type.icon;
                const isSelected = formData.type === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.id as any })}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? type.color === "green"
                          ? "border-green-500 bg-green-50 dark:bg-green-500/10"
                          : type.color === "red"
                          ? "border-red-500 bg-red-50 dark:bg-red-500/10"
                          : "border-purple-500 bg-purple-50 dark:bg-purple-500/10"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${
                      isSelected
                        ? type.color === "green"
                          ? "text-green-500"
                          : type.color === "red"
                          ? "text-red-500"
                          : "text-purple-500"
                        : "text-gray-400"
                    }`} />
                    <span className={`text-sm font-medium ${
                      isSelected
                        ? type.color === "green"
                          ? "text-green-600 dark:text-green-400"
                          : type.color === "red"
                          ? "text-red-600 dark:text-red-400"
                          : "text-purple-600 dark:text-purple-400"
                        : "text-gray-600 dark:text-gray-400"
                    }`}>
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name/Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={
                formData.type === "profit" ? "e.g., One Piece Figures Sales" :
                formData.type === "expense" ? "e.g., Shipping Costs" :
                "e.g., New Inventory Purchase"
              }
              className="w-full px-4 py-3 bg-gray-50 dark:bg-akusho-darker border border-gray-200 dark:border-purple-500/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount (₹) *
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-akusho-darker border border-gray-200 dark:border-purple-500/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-akusho-darker border border-gray-200 dark:border-purple-500/20 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional details..."
              rows={2}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-akusho-darker border border-gray-200 dark:border-purple-500/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
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
              className="flex-1 px-4 py-3 bg-purple-500 text-white font-heading rounded-lg hover:bg-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEditing ? "Update" : "Save"}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}