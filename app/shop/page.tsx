"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Filter, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { ProductGrid, SectionHeader } from "@/components";

const categories = ["All", "Figures", "Plush", "Apparel", "Accessories"];
const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  image_url: string;
  category: string;
  stock: number;
  is_featured: boolean;
  is_active: boolean;
  is_new: boolean;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/products?active=true");
        const data = await response.json();
        
        if (data.products) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products by category
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price_asc":
        return a.price - b.price;
      case "price_desc":
        return b.price - a.price;
      case "newest":
      default:
        return b.id - a.id;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = sortedProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-akusho-deepest pt-24">
      {/* Header */}
      <section className="py-12 bg-white dark:bg-akusho-darker">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Shop"
            subtitle="Explore our complete collection of premium anime collectibles."
          />
        </div>
      </section>

      {/* Shop Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            {/* Filter Toggle (Mobile) */}
            <button
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-lg text-gray-700 dark:text-white"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            {/* Category Filters (Desktop) */}
            <div className="hidden lg:flex items-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-purple-500 dark:bg-akusho-neon text-white dark:text-akusho-deepest"
                      : "bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-purple-300 dark:hover:border-purple-500/40"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white dark:bg-akusho-dark text-gray-700 dark:text-white px-4 py-2 rounded-lg border border-gray-200 dark:border-akusho-neon/30 focus:border-purple-500 dark:focus:border-akusho-neon"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="text-gray-500 dark:text-gray-400 text-sm hidden sm:inline">
                {filteredProducts.length} Products
              </span>
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <motion.div
              className="lg:hidden mb-8 p-4 bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h4 className="font-heading text-gray-900 dark:text-white mb-4">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? "bg-purple-500 dark:bg-akusho-neon text-white dark:text-akusho-deepest"
                        : "bg-gray-100 dark:bg-akusho-darker text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-purple-500 dark:text-akusho-neon animate-spin" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading products...</span>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No products found</p>
            </div>
          ) : (
            /* Product Grid */
            <ProductGrid products={paginatedProducts} columns={4} />
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-lg text-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-akusho-neon/20 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${
                    currentPage === i + 1
                      ? "bg-purple-500 dark:bg-akusho-neon text-white dark:text-akusho-deepest"
                      : "bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-akusho-neon/20"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-lg text-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-akusho-neon/20 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}