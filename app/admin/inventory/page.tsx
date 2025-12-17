"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Plus,
  Minus,
  Search,
  Box,
  Scan,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  History,
  PackageCheck,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  stock: number;
  image_url?: string;
  sku?: string;
  category?: string;
}

interface PackedOrder {
  id: number;
  suborder_id: string;
  product_id: number;
  product_name: string;
  quantity: number;
  packed_at: string;
}

interface StockEntry {
  productId: number;
  productName: string;
  quantity: number;
  imageUrl?: string;
}

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<"pack" | "add" | "history">("pack");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pack Order State
  const [suborderId, setSuborderId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [packQuantity, setPackQuantity] = useState(1);
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Add Stock State
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [addProductSearch, setAddProductSearch] = useState("");
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [selectedAddProduct, setSelectedAddProduct] = useState<Product | null>(null);
  const [addQuantity, setAddQuantity] = useState(1);

  // History State
  const [packedOrders, setPackedOrders] = useState<PackedOrder[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?active=false");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPackedHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/admin/inventory/history?limit=50");
      const data = await res.json();
      setPackedOrders(data.packedOrders || []);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  };

  // Load history when tab changes
  useEffect(() => {
    if (activeTab === "history") {
      fetchPackedHistory();
    }
  }, [activeTab]);

  // Filter products for search
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredAddProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(addProductSearch.toLowerCase()) ||
      p.sku?.toLowerCase().includes(addProductSearch.toLowerCase())
  );

  // ============================================
  // PACK ORDER FUNCTIONS
  // ============================================

  const handlePackOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!suborderId.trim()) {
      toast.error("Please enter Suborder ID");
      return;
    }

    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }

    if (packQuantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    if (selectedProduct.stock < packQuantity) {
      toast.error(`Not enough stock! Available: ${selectedProduct.stock}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/inventory/pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suborderId: suborderId.trim(),
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          quantity: packQuantity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "DUPLICATE_SUBORDER") {
          toast.error("⚠️ This Suborder ID already exists!", {
            description: `Packed on ${new Date(data.existingOrder?.packed_at).toLocaleString()}`,
            duration: 5000,
          });
        } else {
          toast.error(data.error || "Failed to pack order");
        }
        return;
      }

      // Success - Update local stock
      setProducts((prev) =>
        prev.map((p) =>
          p.id === selectedProduct.id
            ? { ...p, stock: p.stock - packQuantity }
            : p
        )
      );

      toast.success("✅ Order packed successfully!", {
        description: `${selectedProduct.name} × ${packQuantity} | Stock: ${selectedProduct.stock - packQuantity}`,
      });

      // Reset form
      setSuborderId("");
      setSelectedProduct(null);
      setPackQuantity(1);
      setProductSearch("");
    } catch (error) {
      console.error("Pack error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // ADD STOCK FUNCTIONS
  // ============================================

  const handleAddToStockList = () => {
    if (!selectedAddProduct) {
      toast.error("Please select a product");
      return;
    }

    if (addQuantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    // Check if already in list
    const existingIndex = stockEntries.findIndex(
      (e) => e.productId === selectedAddProduct.id
    );

    if (existingIndex > -1) {
      // Update quantity
      setStockEntries((prev) =>
        prev.map((e, i) =>
          i === existingIndex
            ? { ...e, quantity: e.quantity + addQuantity }
            : e
        )
      );
      toast.success(`Updated ${selectedAddProduct.name} quantity`);
    } else {
      // Add new entry
      setStockEntries((prev) => [
        ...prev,
        {
          productId: selectedAddProduct.id,
          productName: selectedAddProduct.name,
          quantity: addQuantity,
          imageUrl: selectedAddProduct.image_url,
        },
      ]);
      toast.success(`Added ${selectedAddProduct.name} to list`);
    }

    // Reset
    setSelectedAddProduct(null);
    setAddProductSearch("");
    setAddQuantity(1);
  };

  const handleRemoveFromStockList = (productId: number) => {
    setStockEntries((prev) => prev.filter((e) => e.productId !== productId));
  };

  const handleUpdateStockEntryQty = (productId: number, newQty: number) => {
    if (newQty < 1) return;
    setStockEntries((prev) =>
      prev.map((e) =>
        e.productId === productId ? { ...e, quantity: newQty } : e
      )
    );
  };

  const handleSubmitStock = async () => {
    if (stockEntries.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/inventory/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: stockEntries }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to add stock");
        return;
      }

      // Update local products
      setProducts((prev) =>
        prev.map((p) => {
          const entry = stockEntries.find((e) => e.productId === p.id);
          if (entry) {
            return { ...p, stock: p.stock + entry.quantity };
          }
          return p;
        })
      );

      toast.success(`✅ Stock updated for ${stockEntries.length} products!`);
      setStockEntries([]);
    } catch (error) {
      console.error("Add stock error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // PRODUCT DROPDOWN ITEM COMPONENT
  // ============================================
  const ProductDropdownItem = ({ 
    product, 
    onClick, 
    hoverColor = "purple" 
  }: { 
    product: Product; 
    onClick: () => void;
    hoverColor?: "purple" | "green";
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-${hoverColor}-500/10 transition-colors text-left`}
    >
      {/* Product Image */}
      <div className="relative w-12 h-12 bg-akusho-dark rounded-lg overflow-hidden flex-shrink-0">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="48px"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-purple-500/20">
            <Package className="w-5 h-5 text-purple-400" />
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate">
          {product.name}
        </p>
        {product.sku && (
          <p className="text-gray-500 text-xs">
            SKU: {product.sku}
          </p>
        )}
      </div>
      
      {/* Stock Badge */}
      <span
        className={`text-sm font-mono px-2 py-1 rounded ${
          product.stock > 10
            ? "text-green-400 bg-green-500/10"
            : product.stock > 0
            ? "text-yellow-400 bg-yellow-500/10"
            : "text-red-400 bg-red-500/10"
        }`}
      >
        {product.stock}
      </span>
    </button>
  );

  // ============================================
  // RENDER
  // ============================================

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

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-white mb-2">
          Inventory Management
        </h1>
        <p className="text-gray-400">
          Add stock and track packed orders
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("pack")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === "pack"
              ? "bg-akusho-neon text-akusho-deepest"
              : "bg-akusho-dark text-gray-400 hover:text-white border border-purple-500/20"
          }`}
        >
          <Scan className="w-4 h-4" />
          Pack Order
        </button>
        <button
          onClick={() => setActiveTab("add")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === "add"
              ? "bg-green-500 text-white"
              : "bg-akusho-dark text-gray-400 hover:text-white border border-purple-500/20"
          }`}
        >
          <Plus className="w-4 h-4" />
          Add Stock
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === "history"
              ? "bg-purple-500 text-white"
              : "bg-akusho-dark text-gray-400 hover:text-white border border-purple-500/20"
          }`}
        >
          <History className="w-4 h-4" />
          History
        </button>
      </div>

      {/* ============================================ */}
      {/* PACK ORDER TAB */}
      {/* ============================================ */}
      {activeTab === "pack" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Pack Form */}
          <div className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6">
            <h2 className="font-heading text-xl text-white mb-6 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-akusho-neon" />
              Pack Order
            </h2>

            <form onSubmit={handlePackOrder} className="space-y-5">
              {/* Suborder ID */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Suborder ID <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Scan className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={suborderId}
                    onChange={(e) => setSuborderId(e.target.value.toUpperCase())}
                    placeholder="Enter or scan suborder ID"
                    className="w-full pl-12 pr-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:border-akusho-neon focus:ring-1 focus:ring-akusho-neon font-mono text-lg"
                    autoFocus
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  From the shipping label
                </p>
              </div>

              {/* Product Selection */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Product / Character <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={selectedProduct ? selectedProduct.name : productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setSelectedProduct(null);
                      setShowProductDropdown(true);
                    }}
                    onFocus={() => setShowProductDropdown(true)}
                    placeholder="Search product..."
                    className="w-full pl-12 pr-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:border-akusho-neon focus:ring-1 focus:ring-akusho-neon"
                  />

                  {/* Dropdown with Images */}
                  <AnimatePresence>
                    {showProductDropdown && productSearch && !selectedProduct && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-20 top-full left-0 right-0 mt-2 bg-akusho-darker border border-purple-500/30 rounded-lg shadow-xl max-h-80 overflow-y-auto"
                      >
                        {filteredProducts.length === 0 ? (
                          <div className="p-4 text-gray-500 text-center">
                            No products found
                          </div>
                        ) : (
                          filteredProducts.slice(0, 10).map((product) => (
                            <ProductDropdownItem
                              key={product.id}
                              product={product}
                              onClick={() => {
                                setSelectedProduct(product);
                                setProductSearch("");
                                setShowProductDropdown(false);
                              }}
                              hoverColor="purple"
                            />
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Selected Product Display */}
                {selectedProduct && (
                  <div className="mt-3 p-3 bg-akusho-neon/10 border border-akusho-neon/30 rounded-lg flex items-center gap-3">
                    {/* Selected Image */}
                    <div className="relative w-14 h-14 bg-akusho-darker rounded-lg overflow-hidden flex-shrink-0">
                      {selectedProduct.image_url ? (
                        <Image
                          src={selectedProduct.image_url}
                          alt={selectedProduct.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-purple-500/20">
                          <Package className="w-6 h-6 text-purple-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-akusho-neon font-medium">
                        {selectedProduct.name}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Available: {selectedProduct.stock}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(null)}
                      className="p-1 text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPackQuantity(Math.max(1, packQuantity - 1))}
                    className="w-12 h-12 bg-akusho-darker border border-purple-500/20 rounded-lg flex items-center justify-center text-white hover:bg-purple-500/20 transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    value={packQuantity}
                    onChange={(e) =>
                      setPackQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    min="1"
                    className="w-20 h-12 bg-akusho-darker border border-purple-500/20 rounded-lg text-white text-center text-xl font-mono focus:border-akusho-neon"
                  />
                  <button
                    type="button"
                    onClick={() => setPackQuantity(packQuantity + 1)}
                    className="w-12 h-12 bg-akusho-darker border border-purple-500/20 rounded-lg flex items-center justify-center text-white hover:bg-purple-500/20 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isSubmitting || !suborderId || !selectedProduct}
                className="w-full py-4 bg-akusho-neon text-akusho-deepest font-heading text-lg rounded-lg flex items-center justify-center gap-2 hover:bg-akusho-neon/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <PackageCheck className="w-5 h-5" />
                    Pack & Deduct Stock
                  </>
                )}
              </motion.button>
            </form>
          </div>

          {/* Stock Overview */}
          <div className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl text-white flex items-center gap-2">
                <Box className="w-5 h-5 text-purple-400" />
                Current Stock
              </h2>
              <button
                onClick={fetchProducts}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-purple-500/10"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {products
                .filter((p) => p.stock > 0)
                .sort((a, b) => b.stock - a.stock)
                .map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 bg-akusho-darker rounded-lg"
                  >
                    {/* Product Image */}
                    <div className="relative w-10 h-10 bg-akusho-dark rounded-lg overflow-hidden flex-shrink-0">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-purple-500/20">
                          <Package className="w-4 h-4 text-purple-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">
                        {product.name}
                      </p>
                      {product.category && (
                        <p className="text-gray-500 text-xs">{product.category}</p>
                      )}
                    </div>
                    <span
                      className={`font-mono text-lg font-bold ml-3 ${
                        product.stock > 10
                          ? "text-green-400"
                          : product.stock > 5
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </div>
                ))}

              {products.filter((p) => p.stock > 0).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No products with stock</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ============================================ */}
      {/* ADD STOCK TAB */}
      {/* ============================================ */}
      {activeTab === "add" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Add Stock Form */}
          <div className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6">
            <h2 className="font-heading text-xl text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-400" />
              Add Stock
            </h2>

            <div className="space-y-5">
              {/* Product Selection */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Select Product
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={
                      selectedAddProduct
                        ? selectedAddProduct.name
                        : addProductSearch
                    }
                    onChange={(e) => {
                      setAddProductSearch(e.target.value);
                      setSelectedAddProduct(null);
                      setShowAddDropdown(true);
                    }}
                    onFocus={() => setShowAddDropdown(true)}
                    placeholder="Search product..."
                    className="w-full pl-12 pr-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />

                  {/* Dropdown with Images */}
                  <AnimatePresence>
                    {showAddDropdown &&
                      addProductSearch &&
                      !selectedAddProduct && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-20 top-full left-0 right-0 mt-2 bg-akusho-darker border border-purple-500/30 rounded-lg shadow-xl max-h-80 overflow-y-auto"
                        >
                          {filteredAddProducts.length === 0 ? (
                            <div className="p-4 text-gray-500 text-center">
                              No products found
                            </div>
                          ) : (
                            filteredAddProducts.slice(0, 10).map((product) => (
                              <ProductDropdownItem
                                key={product.id}
                                product={product}
                                onClick={() => {
                                  setSelectedAddProduct(product);
                                  setAddProductSearch("");
                                  setShowAddDropdown(false);
                                }}
                                hoverColor="green"
                              />
                            ))
                          )}
                        </motion.div>
                      )}
                  </AnimatePresence>
                </div>

                {/* Selected Product */}
                {selectedAddProduct && (
                  <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
                    {/* Selected Image */}
                    <div className="relative w-14 h-14 bg-akusho-darker rounded-lg overflow-hidden flex-shrink-0">
                      {selectedAddProduct.image_url ? (
                        <Image
                          src={selectedAddProduct.image_url}
                          alt={selectedAddProduct.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-purple-500/20">
                          <Package className="w-6 h-6 text-purple-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-green-400 font-medium">
                        {selectedAddProduct.name}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Current stock: {selectedAddProduct.stock}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedAddProduct(null)}
                      className="p-1 text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Quantity to Add
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAddQuantity(Math.max(1, addQuantity - 1))}
                    className="w-12 h-12 bg-akusho-darker border border-purple-500/20 rounded-lg flex items-center justify-center text-white hover:bg-green-500/20 transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    value={addQuantity}
                    onChange={(e) =>
                      setAddQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    min="1"
                    className="w-24 h-12 bg-akusho-darker border border-purple-500/20 rounded-lg text-white text-center text-xl font-mono focus:border-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => setAddQuantity(addQuantity + 1)}
                    className="w-12 h-12 bg-akusho-darker border border-purple-500/20 rounded-lg flex items-center justify-center text-white hover:bg-green-500/20 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>

                  {/* Quick add buttons */}
                  <div className="flex gap-2 ml-2">
                    {[5, 10, 20].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setAddQuantity(n)}
                        className="px-3 py-2 bg-akusho-darker border border-purple-500/20 rounded-lg text-gray-400 hover:text-white hover:bg-purple-500/20 text-sm"
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Add to List Button */}
              <button
                type="button"
                onClick={handleAddToStockList}
                disabled={!selectedAddProduct}
                className="w-full py-3 bg-green-500/20 text-green-400 border border-green-500/30 font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                Add to List
              </button>
            </div>
          </div>

          {/* Stock List to Submit */}
          <div className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6">
            <h2 className="font-heading text-xl text-white mb-4 flex items-center gap-2">
              <Box className="w-5 h-5 text-green-400" />
              Stock to Add ({stockEntries.length})
            </h2>

            {stockEntries.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p>No products added yet</p>
                <p className="text-sm mt-1">
                  Search and add products from the left
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-[350px] overflow-y-auto mb-4">
                  {stockEntries.map((entry) => (
                    <div
                      key={entry.productId}
                      className="flex items-center gap-3 p-3 bg-akusho-darker rounded-lg"
                    >
                      {/* Entry Image */}
                      <div className="relative w-10 h-10 bg-akusho-dark rounded-lg overflow-hidden flex-shrink-0">
                        {entry.imageUrl ? (
                          <Image
                            src={entry.imageUrl}
                            alt={entry.productName}
                            fill
                            className="object-cover"
                            sizes="40px"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-purple-500/20">
                            <Package className="w-4 h-4 text-purple-400" />
                          </div>
                        )}
                      </div>
                      <p className="text-white font-medium flex-1 truncate">
                        {entry.productName}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleUpdateStockEntryQty(
                              entry.productId,
                              entry.quantity - 1
                            )
                          }
                          className="w-8 h-8 bg-akusho-dark rounded flex items-center justify-center text-gray-400 hover:text-white"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center text-green-400 font-mono text-lg">
                          +{entry.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateStockEntryQty(
                              entry.productId,
                              entry.quantity + 1
                            )
                          }
                          className="w-8 h-8 bg-akusho-dark rounded flex items-center justify-center text-gray-400 hover:text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleRemoveFromStockList(entry.productId)
                          }
                          className="w-8 h-8 bg-red-500/10 rounded flex items-center justify-center text-red-400 hover:bg-red-500/20 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Products:</span>
                    <span className="text-white font-medium">
                      {stockEntries.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-400">Total Units:</span>
                    <span className="text-green-400 font-bold">
                      +{stockEntries.reduce((sum, e) => sum + e.quantity, 0)}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  onClick={handleSubmitStock}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-green-500 text-white font-heading text-lg rounded-lg flex items-center justify-center gap-2 hover:bg-green-400 transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Update Stock
                    </>
                  )}
                </motion.button>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* ============================================ */}
      {/* HISTORY TAB */}
      {/* ============================================ */}
      {activeTab === "history" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-xl text-white flex items-center gap-2">
              <History className="w-5 h-5 text-purple-400" />
              Packed Orders History
            </h2>
            <button
              onClick={fetchPackedHistory}
              disabled={historyLoading}
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white rounded-lg hover:bg-purple-500/10"
            >
              <RefreshCw
                className={`w-4 h-4 ${historyLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          ) : packedOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <History className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p>No packed orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/20">
                    <th className="text-left p-3 text-gray-400 font-medium">
                      Suborder ID
                    </th>
                    <th className="text-left p-3 text-gray-400 font-medium">
                      Product
                    </th>
                    <th className="text-center p-3 text-gray-400 font-medium">
                      Qty
                    </th>
                    <th className="text-right p-3 text-gray-400 font-medium">
                      Packed At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {packedOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-purple-500/10 hover:bg-purple-500/5"
                    >
                      <td className="p-3">
                        <span className="font-mono text-akusho-neon">
                          {order.suborder_id}
                        </span>
                      </td>
                      <td className="p-3 text-white">{order.product_name}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded font-mono">
                          -{order.quantity}
                        </span>
                      </td>
                      <td className="p-3 text-right text-gray-400 text-sm">
                        {new Date(order.packed_at).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}