"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Grid3X3,
  LayoutGrid,
  Loader2,
  Package,
  Sparkles,
  Flame,
  Tag,
  Zap,
  ArrowUpDown,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";

// Series keywords mapping (SAME as homepage AnimeSeriesCarousel)
const seriesKeywords: Record<string, string[]> = {
  "one-piece": ["luffy", "zoro", "nami", "sanji", "mihawk", "one piece", "egghead", "ace", "shanks", "boa", "hancock"],
  "dragon-ball": ["goku", "vegeta", "dbz", "dragon ball", "saiyan", "gohan", "piccolo", "frieza", "cell"],
  "naruto": ["naruto", "sasuke", "itachi", "kakashi", "uchiha", "hatake", "hokage", "minato", "hinata", "sakura"],
  "demon-slayer": ["tanjiro", "zenitsu", "nezuko", "demon slayer", "hashira", "rengoku", "muzan", "inosuke", "giyu"],
  "jujutsu-kaisen": ["gojo", "jujutsu", "satoru", "sukuna", "itadori", "megumi", "nobara", "yuji", "todo"],
  "attack-on-titan": ["eren", "levi", "mikasa", "titan", "aot", "attack on titan", "armin", "erwin"],
  "my-hero-academia": ["deku", "bakugo", "all might", "mha", "hero academia", "midoriya", "todoroki", "ochaco"],
  "bleach": ["ichigo", "bleach", "hollow", "shinigami", "kurosaki", "zangetsu", "rukia", "aizen"],
  "chainsaw-man": ["denji", "chainsaw", "makima", "power", "aki"],
  "spy-x-family": ["spy", "anya", "loid", "yor", "forger"],
};

// Convert slug to display name
const seriesDisplayNames: Record<string, string> = {
  "one-piece": "One Piece",
  "dragon-ball": "Dragon Ball",
  "naruto": "Naruto",
  "demon-slayer": "Demon Slayer",
  "jujutsu-kaisen": "Jujutsu Kaisen",
  "attack-on-titan": "Attack on Titan",
  "my-hero-academia": "My Hero Academia",
  "bleach": "Bleach",
  "chainsaw-man": "Chainsaw Man",
  "spy-x-family": "Spy x Family",
};

// Sort options
const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A-Z" },
  { value: "name-desc", label: "Name: Z-A" },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [availableSeries, setAvailableSeries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters from URL
  const seriesSlug = searchParams.get("series") || "";
  const categorySlug = searchParams.get("category") || "";
  const searchQuery = searchParams.get("search") || "";
  const sortBy = searchParams.get("sort") || "newest";
  const priceMin = searchParams.get("minPrice") || "";
  const priceMax = searchParams.get("maxPrice") || "";
  const saleOnly = searchParams.get("sale") === "true";
  const newOnly = searchParams.get("filter") === "new";

  // UI State
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Get current series display name
  const currentSeriesName = seriesSlug ? seriesDisplayNames[seriesSlug] || seriesSlug : "";

  // Update URL params
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      router.push(`/shop?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  // Fetch all products once
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/products?active=true");
        const data = await res.json();
        const products = data.products || [];
        setAllProducts(products);

        // Extract available series from products
        const foundSeries = new Set<string>();
        products.forEach((product: Product) => {
          const name = product.name.toLowerCase();
          for (const [slug, keywords] of Object.entries(seriesKeywords)) {
            if (keywords.some((keyword) => name.includes(keyword))) {
              foundSeries.add(slug);
              break;
            }
          }
        });
        setAvailableSeries(Array.from(foundSeries));
      } catch (error) {
        console.error("Error fetching products:", error);
        setAllProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products client-side when filters change
  useEffect(() => {
    let result = [...allProducts];

    // Filter by series
    if (seriesSlug && seriesKeywords[seriesSlug]) {
      const keywords = seriesKeywords[seriesSlug];
      result = result.filter((product) => {
        const name = product.name.toLowerCase();
        return keywords.some((keyword) => name.includes(keyword));
      });
    }

    // Filter by category
    if (categorySlug) {
      result = result.filter((product) => {
        const cat = (product.category || "").toLowerCase().replace(/\s+/g, "-");
        return cat.includes(categorySlug) || categorySlug.includes(cat);
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          (product.description || "").toLowerCase().includes(query) ||
          (product.category || "").toLowerCase().includes(query)
      );
    }

    // Filter by price range
    if (priceMin) {
      result = result.filter((product) => product.price >= parseFloat(priceMin));
    }
    if (priceMax) {
      result = result.filter((product) => product.price <= parseFloat(priceMax));
    }

    // Filter sale items only
    if (saleOnly) {
      result = result.filter(
        (product) =>
          (product as any).compare_price && (product as any).compare_price > product.price
      );
    }

    // Filter new arrivals only
    if (newOnly) {
      result = result.filter((product) => (product as any).is_new);
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date((a as any).created_at || 0).getTime() -
            new Date((b as any).created_at || 0).getTime()
        );
        break;
      case "newest":
      default:
        result.sort(
          (a, b) =>
            new Date((b as any).created_at || 0).getTime() -
            new Date((a as any).created_at || 0).getTime()
        );
        break;
    }

    setFilteredProducts(result);
  }, [allProducts, seriesSlug, categorySlug, searchQuery, sortBy, priceMin, priceMax, saleOnly, newOnly]);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: localSearch || null });
  };

  // Clear all filters
  const clearFilters = () => {
    setLocalSearch("");
    router.push("/shop");
  };

  // Check if any filters are active
  const hasActiveFilters = seriesSlug || categorySlug || searchQuery || priceMin || priceMax || saleOnly || newOnly;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-akusho-deepest">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 bg-gradient-to-b from-akusho-darker to-akusho-deepest overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-akusho-neon/10 blur-[120px] rounded-full" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(0,168,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,168,255,0.5) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-akusho-neon/10 border border-akusho-neon/30 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-akusho-neon" />
              <span className="text-akusho-neon text-sm font-medium tracking-wide">
                {filteredProducts.length} Products Available
              </span>
            </motion.div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white mb-4">
              {currentSeriesName ? (
                <>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-akusho-neon to-purple-400">
                    {currentSeriesName}
                  </span>{" "}
                  Collection
                </>
              ) : saleOnly ? (
                <>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
                    Sale
                  </span>{" "}
                  Items
                </>
              ) : newOnly ? (
                <>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-akusho-neon to-purple-400">
                    New
                  </span>{" "}
                  Arrivals
                </>
              ) : (
                <>
                  All{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-akusho-neon to-purple-400">
                    Products
                  </span>
                </>
              )}
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {currentSeriesName
                ? `Premium ${currentSeriesName} figures and collectibles`
                : "Discover our curated collection of premium anime figures"}
            </p>

            {/* Active filters */}
            {hasActiveFilters && (
              <motion.div
                className="flex flex-wrap items-center justify-center gap-2 mt-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {currentSeriesName && (
                  <FilterChip
                    label={currentSeriesName}
                    onRemove={() => updateParams({ series: null })}
                    color="purple"
                  />
                )}
                {searchQuery && (
                  <FilterChip
                    label={`"${searchQuery}"`}
                    onRemove={() => {
                      setLocalSearch("");
                      updateParams({ search: null });
                    }}
                    color="cyan"
                  />
                )}
                {saleOnly && (
                  <FilterChip
                    label="On Sale"
                    onRemove={() => updateParams({ sale: null })}
                    color="red"
                  />
                )}
                {newOnly && (
                  <FilterChip
                    label="New Arrivals"
                    onRemove={() => updateParams({ filter: null })}
                    color="green"
                  />
                )}
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-white transition-colors ml-2"
                >
                  Clear all
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-akusho-deepest to-transparent" />
      </section>

      {/* Main Content */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-akusho-neon transition-colors" />
              <input
                type="text"
                placeholder="Search products..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-akusho-dark/50 border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:border-akusho-neon/50 focus:bg-akusho-dark focus:ring-1 focus:ring-akusho-neon/30 transition-all outline-none"
              />
            </form>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-3 bg-akusho-dark/50 border border-purple-500/20 rounded-xl text-white hover:border-akusho-neon/50 transition-all"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span className="text-sm">Filters</span>
              </button>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 px-4 py-3 bg-akusho-dark/50 border border-purple-500/20 rounded-xl text-white hover:border-akusho-neon/50 transition-all min-w-[180px]"
                >
                  <ArrowUpDown className="w-4 h-4 text-gray-400" />
                  <span className="text-sm flex-1 text-left">
                    {sortOptions.find((o) => o.value === sortBy)?.label || "Sort"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      showSortDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {showSortDropdown && (
                    <motion.div
                      className="absolute top-full right-0 mt-2 w-full bg-akusho-dark border border-purple-500/30 rounded-xl shadow-2xl shadow-black/50 z-20 overflow-hidden"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            updateParams({ sort: option.value });
                            setShowSortDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                            sortBy === option.value
                              ? "bg-akusho-neon/10 text-akusho-neon"
                              : "text-gray-300 hover:bg-purple-500/10 hover:text-white"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Grid Toggle */}
              <div className="hidden sm:flex items-center p-1 bg-akusho-dark/50 border border-purple-500/20 rounded-xl">
                <button
                  onClick={() => setGridCols(3)}
                  className={`p-2 rounded-lg transition-all ${
                    gridCols === 3
                      ? "bg-akusho-neon/20 text-akusho-neon"
                      : "text-gray-500 hover:text-white"
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setGridCols(4)}
                  className={`p-2 rounded-lg transition-all ${
                    gridCols === 4
                      ? "bg-akusho-neon/20 text-akusho-neon"
                      : "text-gray-500 hover:text-white"
                  }`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Anime Series */}
                <FilterSection title="Anime Series" icon={<Sparkles className="w-4 h-4" />}>
                  <FilterButton
                    active={!seriesSlug}
                    onClick={() => updateParams({ series: null })}
                  >
                    All Series
                  </FilterButton>
                  {availableSeries.map((slug) => (
                    <FilterButton
                      key={slug}
                      active={seriesSlug === slug}
                      onClick={() => updateParams({ series: slug })}
                    >
                      {seriesDisplayNames[slug] || slug}
                    </FilterButton>
                  ))}
                </FilterSection>

                {/* Price Range */}
                <FilterSection title="Price Range" icon={<Tag className="w-4 h-4" />}>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceMin}
                        onChange={(e) => updateParams({ minPrice: e.target.value || null })}
                        className="w-full px-3 py-2.5 bg-akusho-darker border border-purple-500/20 rounded-lg text-white text-sm placeholder-gray-600 focus:border-akusho-neon/50 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="flex items-center text-gray-600">—</div>
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceMax}
                        onChange={(e) => updateParams({ maxPrice: e.target.value || null })}
                        className="w-full px-3 py-2.5 bg-akusho-darker border border-purple-500/20 rounded-lg text-white text-sm placeholder-gray-600 focus:border-akusho-neon/50 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </FilterSection>

                {/* Quick Filters */}
                <FilterSection title="Quick Filters" icon={<Zap className="w-4 h-4" />}>
                  <QuickFilterButton
                    active={saleOnly}
                    onClick={() => updateParams({ sale: saleOnly ? null : "true" })}
                    icon={<Flame className="w-4 h-4" />}
                    label="On Sale"
                    color="red"
                  />
                  <QuickFilterButton
                    active={newOnly}
                    onClick={() => updateParams({ filter: newOnly ? null : "new" })}
                    icon={<Sparkles className="w-4 h-4" />}
                    label="New Arrivals"
                    color="cyan"
                  />
                </FilterSection>
              </div>
            </aside>

            {/* Mobile Filters Drawer */}
            <AnimatePresence>
              {showFilters && (
                <>
                  <motion.div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowFilters(false)}
                  />
                  <motion.div
                    className="fixed bottom-0 left-0 right-0 bg-akusho-dark border-t border-purple-500/30 rounded-t-3xl z-50 lg:hidden max-h-[80vh] overflow-y-auto"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  >
                    {/* Handle bar */}
                    <div className="sticky top-0 bg-akusho-dark pt-3 pb-4 px-6 border-b border-purple-500/20">
                      <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading text-xl text-white">Filters</h3>
                        <button
                          onClick={() => setShowFilters(false)}
                          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-purple-500/10 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Anime Series */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                          Anime Series
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <MobileFilterChip
                            active={!seriesSlug}
                            onClick={() => {
                              updateParams({ series: null });
                              setShowFilters(false);
                            }}
                          >
                            All
                          </MobileFilterChip>
                          {availableSeries.map((slug) => (
                            <MobileFilterChip
                              key={slug}
                              active={seriesSlug === slug}
                              onClick={() => {
                                updateParams({ series: slug });
                                setShowFilters(false);
                              }}
                            >
                              {seriesDisplayNames[slug] || slug}
                            </MobileFilterChip>
                          ))}
                        </div>
                      </div>

                      {/* Quick Filters */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                          Quick Filters
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <MobileFilterChip
                            active={saleOnly}
                            onClick={() => {
                              updateParams({ sale: saleOnly ? null : "true" });
                              setShowFilters(false);
                            }}
                            variant="red"
                          >
                            <Flame className="w-3.5 h-3.5 mr-1.5" />
                            On Sale
                          </MobileFilterChip>
                          <MobileFilterChip
                            active={newOnly}
                            onClick={() => {
                              updateParams({ filter: newOnly ? null : "new" });
                              setShowFilters(false);
                            }}
                            variant="cyan"
                          >
                            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                            New Arrivals
                          </MobileFilterChip>
                        </div>
                      </div>

                      {/* Clear */}
                      {hasActiveFilters && (
                        <button
                          onClick={() => {
                            clearFilters();
                            setShowFilters(false);
                          }}
                          className="w-full py-3 border border-purple-500/30 text-gray-300 rounded-xl hover:bg-purple-500/10 hover:text-white transition-all"
                        >
                          Clear All Filters
                        </button>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Products Grid */}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32">
                  <motion.div
                    className="w-16 h-16 border-4 border-purple-500/30 border-t-akusho-neon rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="text-gray-500 mt-4">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <motion.div
                  className="text-center py-32"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="w-24 h-24 mx-auto mb-6 bg-akusho-dark/50 rounded-2xl flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-600" />
                  </div>
                  <h3 className="font-heading text-2xl text-white mb-2">No products found</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {hasActiveFilters
                      ? "Try adjusting your filters to find what you're looking for"
                      : "Check back soon for new arrivals"}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="px-6 py-3 bg-akusho-neon text-akusho-deepest font-medium rounded-xl hover:bg-white transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </motion.div>
              ) : (
                <div
                  className={`grid gap-6 ${
                    gridCols === 3
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  }`}
                >
                  {filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================
// REUSABLE FILTER COMPONENTS
// ============================================

function FilterChip({
  label,
  onRemove,
  color,
}: {
  label: string;
  onRemove: () => void;
  color: "purple" | "cyan" | "red" | "green";
}) {
  const colors = {
    purple: "bg-purple-500/20 border-purple-500/30 text-purple-300",
    cyan: "bg-akusho-neon/20 border-akusho-neon/30 text-akusho-neon",
    red: "bg-red-500/20 border-red-500/30 text-red-400",
    green: "bg-green-500/20 border-green-500/30 text-green-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border ${colors[color]}`}
    >
      {label}
      <button onClick={onRemove} className="hover:text-white transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  );
}

function FilterSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-akusho-dark/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-5">
      <h3 className="flex items-center gap-2 font-heading text-white mb-4">
        <span className="text-akusho-neon">{icon}</span>
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
        active
          ? "bg-akusho-neon/20 text-akusho-neon font-medium border border-akusho-neon/30"
          : "text-gray-400 hover:bg-purple-500/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function QuickFilterButton({
  active,
  onClick,
  icon,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: "red" | "cyan";
}) {
  const activeColors = {
    red: "bg-red-500/20 border-red-500/40 text-red-400",
    cyan: "bg-akusho-neon/20 border-akusho-neon/40 text-akusho-neon",
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all border ${
        active
          ? activeColors[color]
          : "border-transparent text-gray-400 hover:bg-purple-500/10 hover:text-white"
      }`}
    >
      <span className={active ? "" : "text-gray-600"}>{icon}</span>
      {label}
    </button>
  );
}

function MobileFilterChip({
  children,
  active,
  onClick,
  variant = "default",
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  variant?: "default" | "red" | "cyan";
}) {
  const getStyles = () => {
    if (active) {
      switch (variant) {
        case "red":
          return "bg-red-500 text-white border-red-500";
        case "cyan":
          return "bg-akusho-neon text-akusho-deepest border-akusho-neon";
        default:
          return "bg-purple-500 text-white border-purple-500";
      }
    }
    return "bg-akusho-darker text-gray-300 border-purple-500/20 hover:border-purple-500/40";
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-4 py-2 rounded-full text-sm border transition-all ${getStyles()}`}
    >
      {children}
    </button>
  );
}

// Wrap in Suspense for useSearchParams
export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-akusho-deepest flex items-center justify-center">
          <motion.div
            className="w-16 h-16 border-4 border-purple-500/30 border-t-akusho-neon rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}