"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Settings,
  Star,
  Loader2,
  Check,
  Search,
  Package,
  Save,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  image?: string;
  category?: string;
  is_active: boolean;
  is_featured: boolean;
}

export default function AdminSettingsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [spotlightProductId, setSpotlightProductId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSpotlightId, setOriginalSpotlightId] = useState<number | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all active products
      const productsRes = await fetch("/api/products?active=true");
      const productsData = await productsRes.json();
      setProducts(productsData.products || []);

      // Fetch current spotlight setting
      const spotlightRes = await fetch("/api/settings/spotlight");
      const spotlightData = await spotlightRes.json();
      
      if (spotlightData.productId) {
        setSpotlightProductId(spotlightData.productId);
        setOriginalSpotlightId(spotlightData.productId);
      }
    } catch (error) {
      console.error("Error fetching settings data:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  // Track changes
  useEffect(() => {
    setHasChanges(spotlightProductId !== originalSpotlightId);
  }, [spotlightProductId, originalSpotlightId]);

  // Handle save
  const handleSave = async () => {
    if (!spotlightProductId) {
      toast.error("Please select a spotlight product");
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/settings/spotlight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: spotlightProductId }),
      });

      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Spotlight product updated!");
      setOriginalSpotlightId(spotlightProductId);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving spotlight:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected product details
  const selectedProduct = products.find((p) => p.id === spotlightProductId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-gray-900 dark:text-white mb-2">
            Site Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Configure your homepage and site-wide settings
          </p>
        </div>
        
        {hasChanges && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white font-heading rounded-xl hover:bg-purple-400 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Changes
          </motion.button>
        )}
      </div>

      {/* Spotlight Product Section */}
      <div className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-purple-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-heading text-xl text-gray-900 dark:text-white">
                Spotlight Featured Product
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                This product will be prominently displayed on the homepage
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Current Selection Preview */}
          {selectedProduct && (
            <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 rounded-xl">
              <p className="text-purple-700 dark:text-purple-300 text-sm font-medium mb-3">
                Currently Selected:
              </p>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-akusho-darker flex-shrink-0">
                  {selectedProduct.image_url || selectedProduct.image ? (
                    <Image
                      src={selectedProduct.image_url || selectedProduct.image || ""}
                      alt={selectedProduct.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-gray-900 dark:text-white truncate">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {selectedProduct.category || "Uncategorized"} • ₹{selectedProduct.price.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Spotlight</span>
                </div>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-akusho-darker border border-gray-200 dark:border-purple-500/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery ? "No products match your search" : "No active products found"}
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const isSelected = product.id === spotlightProductId;
                const imageUrl = product.image_url || product.image || "";

                return (
                  <motion.div
                    key={product.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSpotlightProductId(product.id)}
                    className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                      isSelected
                        ? "border-purple-500 ring-2 ring-purple-500/30"
                        : "border-gray-200 dark:border-purple-500/20 hover:border-purple-500/50"
                    }`}
                  >
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 z-10">
                        <div className="w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Featured Badge */}
                    {product.is_featured && (
                      <div className="absolute top-3 left-3 z-10">
                        <div className="px-2 py-1 bg-yellow-500/90 rounded-full">
                          <span className="text-[10px] font-bold text-yellow-900 uppercase flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            Featured
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Image */}
                    <div className="aspect-square bg-gray-100 dark:bg-akusho-darker">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3 bg-white dark:bg-akusho-dark">
                      <p className="text-xs text-purple-500 dark:text-purple-400 uppercase tracking-wider mb-1">
                        {product.category || "Uncategorized"}
                      </p>
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
                        {product.name}
                      </h3>
                      <p className="font-heading text-gray-900 dark:text-white">
                        ₹{product.price.toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="font-heading text-blue-800 dark:text-blue-300 mb-2">
              About Spotlight Product
            </h3>
            <ul className="text-blue-700 dark:text-blue-400 text-sm space-y-1">
              <li>• The spotlight product appears as a large feature on the homepage</li>
              <li>• It shows with animated effects, price, stock level, and add-to-cart button</li>
              <li>• Choose a product you want to highlight - best sellers, new arrivals, or on-sale items</li>
              <li>• If no product is selected, the first featured product will be shown</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Additional Settings Placeholder */}
      <div className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-100 dark:bg-akusho-darker rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <h2 className="font-heading text-xl text-gray-900 dark:text-white">
              More Settings Coming Soon
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Hero banner, flash sale timer, and more
            </p>
          </div>
        </div>
        <div className="text-center py-8 text-gray-400">
          <p>Additional customization options will be available in future updates</p>
        </div>
      </div>
    </div>
  );
}