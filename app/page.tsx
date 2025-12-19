"use client";

import { useState, useEffect, useRef, useMemo, memo } from "react";
import { motion, AnimatePresence, useReducedMotion, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Flame,
  Shield,
  Truck,
  Package,
  RefreshCw,
  Sparkles,
  Zap,
  Heart,
  ShoppingCart,
  Loader2,
  Bell,
} from "lucide-react";
import { Hero, ProductGrid, SectionHeader, Button } from "@/components";
import { useCart } from "@/context/CartContext";

// ============================================
// PERFORMANCE UTILITIES
// ============================================

// Hook to detect if user prefers reduced motion
function useIsLowPerformance() {
  const [isLow, setIsLow] = useState(false);
  const prefersReduced = useReducedMotion();
  
  useEffect(() => {
    // Only reduce animations if user explicitly prefers reduced motion
    // or has a very low-end device (2 or fewer cores)
    const isVeryLowEnd = navigator.hardwareConcurrency <= 2;
    setIsLow(prefersReduced || isVeryLowEnd);
  }, [prefersReduced]);
  
  return isLow;
}

// ============================================
// TYPES
// ============================================

interface Product {
  id: number;
  name: string;
  slug?: string;
  price: number;
  compare_price?: number;
  image_url?: string;
  image?: string;
  category?: string;
  stock?: number;
  is_new?: boolean;
  is_featured?: boolean;
  is_active?: boolean;
  description?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  product_count?: number;
  gradient?: string;
  color?: string;
}

// Category styling - maps category names to gradients
const categoryStyles: Record<string, { gradient: string; color: string }> = {
  "figures": { gradient: "from-purple-600 to-indigo-600", color: "#8B5CF6" },
  "scale-figures": { gradient: "from-purple-700 to-blue-600", color: "#6B21A8" },
  "nendoroid": { gradient: "from-pink-500 to-rose-500", color: "#EC4899" },
  "pop-up-parade": { gradient: "from-cyan-500 to-blue-500", color: "#06B6D4" },
  "plush": { gradient: "from-amber-500 to-orange-500", color: "#F97316" },
  "apparel": { gradient: "from-green-500 to-emerald-400", color: "#22C55E" },
  "accessories": { gradient: "from-red-600 to-orange-500", color: "#E63946" },
  "limited": { gradient: "from-yellow-500 to-amber-600", color: "#EAB308" },
  "pre-order": { gradient: "from-sky-500 to-blue-500", color: "#0EA5E9" },
  "one-piece": { gradient: "from-red-600 to-orange-500", color: "#E63946" },
  "naruto": { gradient: "from-orange-500 to-yellow-500", color: "#FF7B00" },
  "demon-slayer": { gradient: "from-pink-600 to-red-500", color: "#E91E63" },
  "jujutsu-kaisen": { gradient: "from-purple-700 to-blue-600", color: "#6B21A8" },
  "attack-on-titan": { gradient: "from-green-800 to-green-600", color: "#2D5A27" },
  "dragon-ball": { gradient: "from-orange-500 to-yellow-400", color: "#F97316" },
  "my-hero-academia": { gradient: "from-green-500 to-emerald-400", color: "#22C55E" },
  "spy-x-family": { gradient: "from-pink-500 to-rose-400", color: "#EC4899" },
  "chainsaw-man": { gradient: "from-red-700 to-orange-600", color: "#DC2626" },
  "bleach": { gradient: "from-gray-900 to-blue-900", color: "#000000" },
  "death-note": { gradient: "from-gray-900 to-gray-700", color: "#1D1D1D" },
  "default": { gradient: "from-gray-700 to-gray-600", color: "#4B5563" },
};

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [spotlightProduct, setSpotlightProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isLowPerf = useIsLowPerformance();

  // Fetch all data on mount - parallel for speed
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, spotlightRes] = await Promise.all([
          fetch("/api/products?active=true"),
          fetch("/api/categories?withCounts=true"),
          fetch("/api/settings/spotlight"),
        ]);

        const [productsData, categoriesData, spotlightData] = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
          spotlightRes.json(),
        ]);

        setProducts(productsData.products || []);
        setCategories(categoriesData.categories || []);

        if (spotlightData.product) {
          setSpotlightProduct(spotlightData.product);
        } else {
          const featured = (productsData.products || []).find((p: Product) => p.is_featured);
          setSpotlightProduct(featured || null);
        }
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Memoize derived data to prevent recalculations
  const { saleProducts, newArrivals, recentPurchases } = useMemo(() => ({
    saleProducts: products.filter(p => p.compare_price && p.compare_price > p.price).slice(0, 4),
    newArrivals: products.filter(p => p.is_new).slice(0, 8),
    recentPurchases: products.slice(0, 4).map((p, i) => ({
      name: ["Amit", "Sneha", "Raj", "Pooja"][i],
      city: ["Mumbai", "Delhi", "Bangalore", "Chennai"][i],
      product: p.name.split(" - ")[0] || p.name,
      time: `${(i + 1) * 3} min ago`,
    })),
  }), [products]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-akusho-deepest flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-akusho-neon animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading AKUSHO...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Live Purchase Notifications */}
      <LivePurchaseNotification purchases={recentPurchases} />

      {/* Hero Section */}
      <Hero />

      {/* Anime Marquee - Shows anime series names */}
      <AnimeMarquee products={products} isLowPerf={isLowPerf} />

      {/* Anime Series Carousel - Based on products */}
      <AnimeSeriesCarousel products={products} isLowPerf={isLowPerf} />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Flash Sale Section - Products with compare_price */}
      {saleProducts.length > 0 && (
        <FlashSaleSection products={saleProducts} isLowPerf={isLowPerf} />
      )}

      {/* Featured Product Spotlight - THE ONE admin-selected product */}
      {spotlightProduct && (
        <FeaturedSpotlight product={spotlightProduct} isLowPerf={isLowPerf} />
      )}

      {/* Stats Counter */}
      <StatsSection productCount={products.length} />

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-20 bg-gray-50 dark:bg-akusho-deepest">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="New Arrivals"
              subtitle="Fresh drops from the anime universe. Get them before they're gone."
            />
            <ProductGrid products={newArrivals as any} columns={4} />
            <div className="text-center mt-12">
              <Button href="/shop?filter=new" variant="outline">
                View All New Arrivals
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Coming Soon - Anime Katanas */}
      <ComingSoonKatanas isLowPerf={isLowPerf} />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Newsletter */}
      <NewsletterSection isLowPerf={isLowPerf} />

      {/* CTA Section */}
      <CTASection isLowPerf={isLowPerf} />
    </>
  );
}

// ============================================
// COMPONENTS - With Smart Performance
// ============================================

// Anime Series Carousel - FULL animations preserved
function AnimeSeriesCarousel({ products, isLowPerf }: { products: Product[]; isLowPerf: boolean }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Extract series from product names and count them
  const seriesData = useMemo(() => {
    const seriesMap: Record<string, { count: number; products: Product[] }> = {};
    
    const seriesKeywords: Record<string, string[]> = {
      "One Piece": ["luffy", "zoro", "nami", "sanji", "mihawk", "one piece", "egghead"],
      "Dragon Ball": ["goku", "vegeta", "dbz", "dragon ball", "saiyan"],
      "Naruto": ["naruto", "sasuke", "itachi", "kakashi", "uchiha", "hatake"],
      "Demon Slayer": ["tanjiro", "zenitsu", "nezuko", "demon slayer", "hashira"],
      "Jujutsu Kaisen": ["gojo", "jujutsu", "satoru", "sukuna", "itadori"],
      "Attack on Titan": ["eren", "levi", "mikasa", "titan", "aot"],
      "My Hero Academia": ["deku", "bakugo", "all might", "mha", "hero academia"],
      "Bleach": ["ichigo", "bleach", "hollow", "shinigami"],
    };

    products.forEach(product => {
      const name = product.name.toLowerCase();
      for (const [series, keywords] of Object.entries(seriesKeywords)) {
        if (keywords.some(keyword => name.includes(keyword))) {
          if (!seriesMap[series]) {
            seriesMap[series] = { count: 0, products: [] };
          }
          seriesMap[series].count++;
          seriesMap[series].products.push(product);
          break;
        }
      }
    });

    return Object.entries(seriesMap)
      .map(([name, data]) => ({ name, ...data }))
      .filter(s => s.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [products]);

  const seriesStyles: Record<string, { gradient: string; color: string; image: string }> = {
    "One Piece": { gradient: "from-red-600 to-orange-500", color: "#E63946", image: "/one-piece.jpeg" },
    "Dragon Ball": { gradient: "from-orange-500 to-yellow-400", color: "#F97316", image: "/dragon-ball.jpeg" },
    "Naruto": { gradient: "from-orange-500 to-yellow-500", color: "#FF7B00", image: "/naruto.jpeg" },
    "Demon Slayer": { gradient: "from-pink-600 to-red-500", color: "#E91E63", image: "/demon-slayer.jpeg" },
    "Jujutsu Kaisen": { gradient: "from-purple-700 to-blue-600", color: "#6B21A8", image: "/jujutsu-kaisen.jpeg" },
    "Attack on Titan": { gradient: "from-green-800 to-green-600", color: "#2D5A27", image: "/series/attack-on-titan.jpg" },
    "My Hero Academia": { gradient: "from-green-500 to-emerald-400", color: "#22C55E", image: "/series/my-hero-academia.jpg" },
    "Bleach": { gradient: "from-gray-900 to-blue-900", color: "#1E3A8A", image: "/series/bleach.jpg" },
  };

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener("scroll", checkScroll, { passive: true });
      return () => carousel.removeEventListener("scroll", checkScroll);
    }
  }, [seriesData]);

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const displaySeries = [...seriesData, ...seriesData, ...seriesData];

  if (seriesData.length === 0) return null;

  return (
    <section className="relative py-12 md:py-16 bg-gray-50 dark:bg-akusho-darker overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        {/* Animated floating orbs - GPU accelerated with will-change */}
        <motion.div 
          className="absolute top-20 right-1/3 w-32 h-32 bg-akusho-neon/10 rounded-full blur-2xl will-change-transform"
          animate={{ y: [0, -30, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 left-1/3 w-40 h-40 bg-pink-500/10 rounded-full blur-2xl will-change-transform"
          animate={{ y: [0, 30, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Anime Style */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-3"
            >
              <motion.div 
                className="h-[3px] w-16 rounded-full"
                style={{ background: "linear-gradient(90deg, #00A8FF, #8B5CF6, #EC4899)" }}
                animate={isLowPerf ? {} : { width: [64, 80, 64] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="flex items-center gap-2 px-3 py-1 bg-akusho-neon/10 border border-akusho-neon/30 rounded-full">
                <motion.div
                  animate={isLowPerf ? {} : { rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-3 h-3 text-akusho-neon" />
                </motion.div>
                <span className="text-akusho-neon text-xs font-bold uppercase tracking-[0.2em]">
                  Browse by Series
                </span>
              </div>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-heading text-3xl md:text-4xl lg:text-5xl"
            >
              <span className="text-gray-900 dark:text-white">Popular </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-akusho-neon via-purple-400 to-pink-400 drop-shadow-[0_0_20px_rgba(0,168,255,0.5)]">
                Anime
              </span>
              <span className="text-gray-900 dark:text-white"> Series</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 dark:text-gray-400 mt-2 text-sm md:text-base"
            >
              Shop figures from your favorite anime universes
            </motion.p>
          </div>

          {/* Navigation Buttons - Enhanced */}
          <div className="hidden md:flex items-center gap-3">
            <motion.button
              onClick={() => scrollCarousel("left")}
              disabled={!canScrollLeft}
              className={`relative p-3 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                canScrollLeft
                  ? "bg-akusho-dark/50 border-akusho-neon/50 text-akusho-neon hover:border-akusho-neon hover:shadow-[0_0_20px_rgba(0,168,255,0.3)]"
                  : "bg-gray-100 dark:bg-akusho-dark/30 border-gray-300 dark:border-gray-700 text-gray-400 cursor-not-allowed"
              }`}
              whileHover={canScrollLeft ? { scale: 1.05 } : {}}
              whileTap={canScrollLeft ? { scale: 0.95 } : {}}
            >
              {canScrollLeft && !isLowPerf && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-akusho-neon/20 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              <ChevronLeft className="w-5 h-5 relative z-10" />
            </motion.button>
            <motion.button
              onClick={() => scrollCarousel("right")}
              disabled={!canScrollRight}
              className={`relative p-3 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                canScrollRight
                  ? "bg-akusho-dark/50 border-akusho-neon/50 text-akusho-neon hover:border-akusho-neon hover:shadow-[0_0_20px_rgba(0,168,255,0.3)]"
                  : "bg-gray-100 dark:bg-akusho-dark/30 border-gray-300 dark:border-gray-700 text-gray-400 cursor-not-allowed"
              }`}
              whileHover={canScrollRight ? { scale: 1.05 } : {}}
              whileTap={canScrollRight ? { scale: 0.95 } : {}}
            >
              {canScrollRight && !isLowPerf && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent to-akusho-neon/20"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              <ChevronRight className="w-5 h-5 relative z-10" />
            </motion.button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 dark:from-akusho-darker to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 dark:from-akusho-darker to-transparent z-10 pointer-events-none" />

          {/* CSS animation for carousel - GPU accelerated */}
          <style jsx global>{`
            @keyframes carousel-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-33.333%); }
            }
            .carousel-track {
              animation: carousel-scroll 12s linear infinite;
              will-change: transform;
            }
            .carousel-track:hover {
              animation-play-state: paused;
            }
            .series-card {
              transform-style: preserve-3d;
              perspective: 1000px;
            }
            .series-card-inner {
              transform: translateZ(0);
              transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              will-change: transform, box-shadow;
              box-shadow: 
                0 10px 30px -10px rgba(0, 0, 0, 0.5),
                0 0 0 1px rgba(255, 255, 255, 0.1);
            }
            .series-card:hover .series-card-inner {
              transform: translateY(-12px) translateZ(20px) rotateX(5deg);
              box-shadow: 
                0 25px 50px -12px rgba(0, 0, 0, 0.6),
                0 0 0 1px rgba(0, 168, 255, 0.3),
                0 0 40px rgba(0, 168, 255, 0.2);
            }
          `}</style>

          <div 
            className="overflow-hidden py-4"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="carousel-track flex gap-6 md:gap-8">
              {displaySeries.map((series, index) => {
                const style = seriesStyles[series.name] || { gradient: "from-gray-700 to-gray-600", color: "#4B5563", image: "" };
                const isHot = series.count >= 3;

                return (
                  <div
                    key={`${series.name}-${index}`}
                    className="flex-shrink-0 series-card"
                  >
                    <Link href={`/shop?series=${series.name.toLowerCase().replace(/\s+/g, "-")}`}>
                      <div className="series-card-inner relative w-44 md:w-52 aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group">
                        {/* Background Image or Gradient */}
                        {style.image ? (
                          <Image
                            src={style.image}
                            alt={series.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 176px, 208px"
                            loading="lazy"
                          />
                        ) : (
                          <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient}`} />
                        )}
                        
                        {/* Overlay gradient for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        
                        {/* Glossy overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent" />
                        
                        {/* Inner shadow for depth */}
                        <div className="absolute inset-0 shadow-[inset_0_2px_20px_rgba(255,255,255,0.1),inset_0_-10px_30px_rgba(0,0,0,0.3)]" />

                        {/* Animated shine sweep - only on high-perf */}
                        {!isLowPerf && (
                          <div className="absolute inset-0 overflow-hidden">
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                              animate={{ x: ["-200%", "200%"] }}
                              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                            />
                          </div>
                        )}

                        {/* Border glow */}
                        <div 
                          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            boxShadow: `inset 0 0 30px ${style.color}66, 0 0 60px ${style.color}44`,
                          }}
                        />

                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
                          {isHot && (
                            <motion.div
                              className="absolute top-3 right-3"
                              animate={isLowPerf ? {} : { scale: [1, 1.1, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <div className="px-3 py-1.5 bg-akusho-neon/90 backdrop-blur-sm rounded-full shadow-lg shadow-akusho-neon/30">
                                <span className="text-[10px] font-bold text-akusho-deepest uppercase tracking-wider flex items-center gap-1">
                                  <Flame className="w-3 h-3" />
                                  Hot
                                </span>
                              </div>
                            </motion.div>
                          )}

                          <h3 className="font-heading text-xl md:text-2xl text-white leading-tight mb-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                            {series.name}
                          </h3>
                          <p className="text-white/90 text-sm font-medium drop-shadow-lg">
                            {series.count} {series.count === 1 ? "Product" : "Products"}
                          </p>

                          <motion.div
                            className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100"
                            initial={{ scale: 0.8 }}
                            whileHover={{ scale: 1 }}
                          >
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                              <ArrowRight className="w-5 h-5 text-white" />
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Anime Marquee - Cool infinite scrolling
function AnimeMarquee({ products, isLowPerf }: { products: Product[]; isLowPerf: boolean }) {
  const seriesNames = useMemo(() => {
    const seriesKeywords: Record<string, string> = {
      "luffy": "ONE PIECE", "zoro": "ONE PIECE", "nami": "ONE PIECE", "mihawk": "ONE PIECE",
      "goku": "DRAGON BALL", "vegeta": "DRAGON BALL",
      "naruto": "NARUTO", "sasuke": "NARUTO", "itachi": "NARUTO", "kakashi": "NARUTO",
      "tanjiro": "DEMON SLAYER", "zenitsu": "DEMON SLAYER",
      "gojo": "JUJUTSU KAISEN",
    };

    const foundSet = new Set<string>();
    products.forEach(product => {
      const name = product.name.toLowerCase();
      for (const [keyword, series] of Object.entries(seriesKeywords)) {
        if (name.includes(keyword)) {
          foundSet.add(series);
          break;
        }
      }
    });

    const found = Array.from(foundSet);
    const extras = ["ATTACK ON TITAN", "MY HERO ACADEMIA", "BLEACH", "CHAINSAW MAN", "SPY × FAMILY", "TOKYO REVENGERS"];
    extras.forEach(e => {
      if (!found.includes(e) && found.length < 12) found.push(e);
    });

    return found.length > 0 ? found : ["ONE PIECE", "NARUTO", "DEMON SLAYER", "JUJUTSU KAISEN", "DRAGON BALL", "ATTACK ON TITAN"];
  }, [products]);

  const marqueeItems = [...seriesNames, ...seriesNames, ...seriesNames, ...seriesNames];

  return (
    <>
      <style jsx global>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee-scroll 30s linear infinite;
          will-change: transform;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="relative py-4 bg-gradient-to-r from-akusho-deepest via-purple-900/20 to-akusho-deepest overflow-hidden border-y border-akusho-neon/30">
        {/* Animated background glow - only on high-perf */}
        {!isLowPerf && (
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              className="absolute top-1/2 left-1/4 w-64 h-8 bg-akusho-neon/20 blur-3xl rounded-full"
              animate={{ x: [0, 200, 0], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute top-1/2 right-1/4 w-64 h-8 bg-purple-500/20 blur-3xl rounded-full"
              animate={{ x: [0, -200, 0], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
          </div>
        )}

        {/* Glow lines */}
        <motion.div 
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ background: "linear-gradient(90deg, transparent, #00A8FF, #8B5CF6, #EC4899, #00A8FF, transparent)" }}
          animate={isLowPerf ? {} : { opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div 
          className="absolute inset-x-0 bottom-0 h-[2px]"
          style={{ background: "linear-gradient(90deg, transparent, #EC4899, #8B5CF6, #00A8FF, #EC4899, transparent)" }}
          animate={isLowPerf ? {} : { opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />
        
        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-akusho-deepest via-akusho-deepest/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-akusho-deepest via-akusho-deepest/80 to-transparent z-10 pointer-events-none" />

        {/* Marquee track */}
        <div className="marquee-track flex whitespace-nowrap">
          {marqueeItems.map((name, index) => (
            <div key={`marquee-${index}`} className="flex items-center mx-4 md:mx-8 group cursor-default">
              <motion.div
                animate={isLowPerf ? {} : { rotate: [0, 180, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-akusho-neon mr-2 md:mr-3" />
              </motion.div>
              <span className="font-heading text-sm md:text-lg lg:text-xl tracking-[0.15em] md:tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-akusho-neon via-purple-400 to-pink-400 group-hover:from-white group-hover:via-akusho-neon group-hover:to-white transition-all duration-300 drop-shadow-[0_0_10px_rgba(0,168,255,0.5)]">
                {name}
              </span>
              <span className="mx-4 md:mx-6 text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-akusho-neon">✦</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// Flash Sale Section
function FlashSaleSection({ products, isLowPerf }: { products: Product[]; isLowPerf: boolean }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative py-16 md:py-20 bg-gradient-to-br from-red-900/20 via-akusho-deepest to-orange-900/20 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-3xl"
          animate={isLowPerf ? {} : { x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-center md:justify-start gap-3 mb-3"
            >
              <motion.div 
                animate={isLowPerf ? {} : { rotate: [0, 10, -10, 0] }} 
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <Zap className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              </motion.div>
              <span className="text-red-500 font-bold text-lg uppercase tracking-wider">Flash Sale</span>
            </motion.div>
            <h2 className="font-heading text-3xl md:text-5xl text-white">
              Up to <span className="text-red-500">50% OFF</span>
            </h2>
          </div>

          {/* Countdown Timer */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="flex items-center gap-3"
          >
            <span className="text-gray-400 text-sm uppercase tracking-wider hidden sm:block">Ends in:</span>
            <div className="flex gap-2">
              {[
                { value: timeLeft.hours, label: "HRS" },
                { value: timeLeft.minutes, label: "MIN" },
                { value: timeLeft.seconds, label: "SEC" },
              ].map((item, index) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-red-500/20 backdrop-blur-sm rounded-xl border border-red-500/30 flex items-center justify-center">
                      <span className="font-heading text-2xl md:text-3xl text-white">{String(item.value).padStart(2, "0")}</span>
                    </div>
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 uppercase tracking-wider">{item.label}</span>
                  </div>
                  {index < 2 && <span className="text-red-500 text-2xl font-bold mb-4">:</span>}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => {
            const discount = product.compare_price
              ? Math.round((1 - product.price / product.compare_price) * 100)
              : 0;
            const imageUrl = product.image_url || product.image || "";

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Link href={`/product/${product.id}`}>
                  <div className="relative bg-akusho-dark rounded-2xl overflow-hidden border border-red-500/20 hover:border-red-500/50 transition-all duration-300">
                    {discount > 0 && (
                      <div className="absolute top-3 left-3 z-10">
                        <div className="px-3 py-1 bg-red-500 rounded-full">
                          <span className="text-white text-xs font-bold">-{discount}%</span>
                        </div>
                      </div>
                    )}

                    <div className="relative aspect-square bg-akusho-darker">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 50vw, 25vw"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 flex items-center justify-center">
                          <span className="text-gray-600 text-sm text-center px-2">{product.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <p className="text-xs text-red-400 uppercase tracking-wider mb-1">{product.category || "Uncategorized"}</p>
                      <h3 className="font-heading text-white text-sm md:text-base line-clamp-2 mb-2 group-hover:text-red-400 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-lg text-white">₹{product.price.toLocaleString()}</span>
                        {product.compare_price && (
                          <span className="text-sm text-gray-500 line-through">₹{product.compare_price.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Button href="/shop?sale=true" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
            View All Deals
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}

// Featured Product Spotlight
function FeaturedSpotlight({ product, isLowPerf }: { product: Product; isLowPerf: boolean }) {
  const { addToCart } = useCart();
  const stock = product.stock || 12;
  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : 0;
  const imageUrl = product.image_url || product.image || "";

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: imageUrl,
      slug: product.slug,
    });
  };

  return (
    <section className="relative py-20 bg-akusho-deepest overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-akusho-neon/10 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(0,168,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,168,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Glow Ring - Rotating gradient border */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: "conic-gradient(from 0deg, #00A8FF, #8B5CF6, #EC4899, #00A8FF)",
                padding: "3px",
              }}
              animate={isLowPerf ? {} : { rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-full h-full bg-akusho-deepest rounded-3xl" />
            </motion.div>

            {/* Product Image Container */}
            <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-purple-900/50 to-akusho-dark overflow-hidden m-1">
              {imageUrl ? (
                <Image 
                  src={imageUrl} 
                  alt={product.name} 
                  fill 
                  className="object-cover" 
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-600 text-xl">Featured Product Image</span>
                </div>
              )}

              {/* Limited Edition Badge */}
              <div className="absolute top-4 left-4">
                <motion.div
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  animate={isLowPerf ? {} : { scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Limited Edition
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-akusho-neon/20 rounded-full text-akusho-neon text-xs font-semibold uppercase tracking-wider">
                {product.category || "Featured"}
              </span>
              {discount > 0 && (
                <span className="px-3 py-1 bg-red-500/20 rounded-full text-red-400 text-xs font-semibold uppercase tracking-wider">
                  {discount}% OFF
                </span>
              )}
            </div>

            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-white mb-4 leading-tight">
              {product.name}
            </h2>

            <p className="text-gray-400 text-lg mb-6">
              {product.description || "Limited edition 1/7 scale figure featuring iconic technique. Premium PVC with LED base."}
            </p>

            {/* Stock Indicator */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-orange-400 text-sm font-medium">Only {stock} left in stock</span>
              </div>
              <div className="flex-1 h-2 bg-akusho-dark rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(stock / 50) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 1 }}
                />
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-8">
              <span className="font-heading text-4xl md:text-5xl text-white">
                ₹{product.price.toLocaleString()}
              </span>
              {product.compare_price && (
                <span className="text-xl text-gray-500 line-through">
                  ₹{product.compare_price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-akusho-neon text-akusho-deepest font-heading text-lg rounded-xl hover:bg-white transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </motion.button>
              <motion.button
                className="flex items-center justify-center gap-2 px-6 py-4 border border-akusho-neon/50 text-akusho-neon rounded-xl hover:bg-akusho-neon/10 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Heart className="w-5 h-5" />
                Wishlist
              </motion.button>
            </div>

            {/* Product Specs */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-akusho-neon/20">
              <div className="text-center">
                <p className="text-akusho-neon font-heading text-xl">1/7</p>
                <p className="text-gray-500 text-sm">Scale</p>
              </div>
              <div className="text-center">
                <p className="text-akusho-neon font-heading text-xl">28cm</p>
                <p className="text-gray-500 text-sm">Height</p>
              </div>
              <div className="text-center">
                <p className="text-akusho-neon font-heading text-xl">LED</p>
                <p className="text-gray-500 text-sm">Base</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Stats Section
function StatsSection({ productCount }: { productCount: number }) {
  const stats = [
    { value: 50000, suffix: "+", label: "Figures Sold", icon: Package },
    { value: 15000, suffix: "+", label: "Happy Collectors", icon: Heart },
    { value: productCount || 14, suffix: "", label: "Products Available", icon: Sparkles },
    { value: 99, suffix: "%", label: "Authentic Products", icon: Shield },
  ];

  const [inView, setInView] = useState(false);

  return (
    <section className="relative py-16 bg-akusho-deepest overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
          onViewportEnter={() => setInView(true)}
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-akusho-neon/10 border border-akusho-neon/20 mb-4 group-hover:scale-110 group-hover:border-akusho-neon/50 transition-all duration-300">
                  <Icon className="w-7 h-7 text-akusho-neon" />
                </div>
                <motion.div
                  className="font-heading text-4xl md:text-5xl text-white mb-2"
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  {inView && <CountUp end={stat.value} suffix={stat.suffix} />}
                </motion.div>
                <p className="text-gray-400 text-sm md:text-base">{stat.label}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// Count Up Animation
function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// Live Purchase Notifications
function LivePurchaseNotification({ purchases }: { purchases: { name: string; city: string; product: string; time: string }[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (purchases.length === 0) return;

    const showNotification = () => {
      setIsVisible(true);
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % purchases.length);
        }, 500);
      }, 4000);
    };

    const initialTimeout = setTimeout(showNotification, 3000);
    const interval = setInterval(showNotification, 8000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [purchases]);

  if (purchases.length === 0) return null;

  const purchase = purchases[currentIndex];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-6 z-50 max-w-xs"
        >
          <div className="bg-white dark:bg-akusho-dark rounded-2xl shadow-2xl border border-gray-200 dark:border-akusho-neon/30 p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-akusho-neon to-purple-500 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-white font-medium truncate">
                {purchase.name} from {purchase.city}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                just bought <span className="text-akusho-neon">{purchase.product}</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{purchase.time}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Trust Badges
function TrustBadges() {
  const badges = [
    { icon: Shield, title: "100% Authentic", desc: "Genuine products only" },
    { icon: Truck, title: "Fast Delivery", desc: "Pan-India shipping" },
    { icon: RefreshCw, title: "Easy Returns", desc: "7-day return policy" },
    { icon: Package, title: "Secure Packaging", desc: "Premium protection" },
  ];

  return (
    <section className="py-12 bg-gray-100 dark:bg-akusho-dark border-y border-gray-200 dark:border-akusho-neon/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col md:flex-row items-center md:items-start gap-3 text-center md:text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-akusho-neon/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-akusho-neon" />
                </div>
                <div>
                  <h4 className="font-heading text-gray-900 dark:text-white text-sm md:text-base">{badge.title}</h4>
                  <p className="text-gray-500 text-xs md:text-sm">{badge.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Coming Soon - Anime Katanas Section
function ComingSoonKatanas({ isLowPerf }: { isLowPerf: boolean }) {
  const katanas = [
    { name: "Zoro's Enma", series: "One Piece", color: "from-purple-600 to-violet-500", image: "/katanas/enma.jpg" },
    { name: "Zoro's Wado Ichimonji", series: "One Piece", color: "from-gray-100 to-gray-300", image: "/katanas/wado-ichimonji.jpg" },
    { name: "Zoro's Shusui", series: "One Piece", color: "from-red-900 to-black", image: "/katanas/shusui.jpg" },
    { name: "Tanjiro's Nichirin Blade", series: "Demon Slayer", color: "from-gray-800 to-blue-600", image: "/katanas/nichirin.jpg" },
    { name: "Sasuke's Kusanagi", series: "Naruto", color: "from-gray-700 to-gray-900", image: "/katanas/kusanagi.jpg" },
    { name: "Ichigo's Zangetsu", series: "Bleach", color: "from-gray-900 to-black", image: "/katanas/zangetsu.jpg" },
  ];

  return (
    <section className="relative py-20 bg-gradient-to-br from-akusho-deepest via-purple-900/20 to-akusho-deepest overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-akusho-neon/10 rounded-full blur-3xl" />
      </div>

      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(0,168,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,168,255,0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-akusho-neon/10 border border-akusho-neon/30 rounded-full mb-4"
          >
            <motion.div
              animate={isLowPerf ? {} : { rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-akusho-neon" />
            </motion.div>
            <span className="text-akusho-neon text-sm font-semibold uppercase tracking-wider">Coming Soon</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-heading text-4xl md:text-5xl text-white mb-4"
          >
            Anime <span className="text-akusho-neon">Katanas</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Legendary blades from your favorite anime. Premium replicas coming to AKUSHO.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {katanas.map((katana, index) => (
            <motion.div
              key={katana.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-akusho-dark border border-purple-500/20 hover:border-akusho-neon/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,168,255,0.3)]">
                {katana.image ? (
                  <Image
                    src={katana.image}
                    alt={katana.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 16vw"
                    loading="lazy"
                  />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${katana.color} opacity-30 group-hover:opacity-50 transition-opacity`} />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                
                {!katana.image && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="w-2 h-32 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-600 rounded-full opacity-20 group-hover:opacity-40"
                      style={{ transform: "rotate(-30deg)" }}
                      animate={isLowPerf ? {} : { opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                )}

                <div className="absolute top-3 left-3 z-10">
                  <motion.div 
                    className="px-2 py-1 bg-akusho-neon/20 backdrop-blur-sm rounded-full border border-akusho-neon/30"
                    animate={isLowPerf ? {} : { scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-[10px] font-bold text-akusho-neon uppercase tracking-wider">Soon</span>
                  </motion.div>
                </div>

                <div className="absolute inset-0 flex flex-col justify-end p-3 z-10">
                  <p className="text-akusho-neon/70 text-[10px] uppercase tracking-wider mb-1">{katana.series}</p>
                  <h3 className="font-heading text-white text-sm leading-tight drop-shadow-lg">{katana.name}</h3>
                </div>

                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                  style={{ boxShadow: "inset 0 0 30px rgba(0, 168, 255, 0.3)" }}
                />
                
                {!isLowPerf && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 opacity-0 group-hover:opacity-100"
                    initial={{ x: "-200%" }}
                    whileHover={{ x: "200%" }}
                    transition={{ duration: 0.6 }}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <motion.button
            className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-akusho-neon text-akusho-neon font-heading rounded-xl hover:bg-akusho-neon hover:text-akusho-deepest transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Bell className="w-5 h-5" />
            Notify Me When Available
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// Testimonials
const testimonials = [
  { id: 1, name: "Rahul S.", text: "Best quality figures I've ever bought. The packaging was incredible and delivery was super fast!", rating: 5 },
  { id: 2, name: "Priya M.", text: "AKUSHO is my go-to for anime collectibles. 100% authentic products every time.", rating: 5 },
  { id: 3, name: "Arjun K.", text: "Amazing collection and great prices. Customer service is top-notch!", rating: 5 },
];

function TestimonialsSection() {
  return (
    <section className="py-20 bg-white dark:bg-akusho-darker">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="What Collectors Say" subtitle="Join thousands of satisfied anime enthusiasts" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-gray-50 dark:bg-akusho-dark p-8 rounded-2xl border border-gray-200 dark:border-akusho-neon/20 group hover:border-akusho-neon/50 transition-colors"
            >
              <div className="absolute -top-4 left-6">
                <div className="w-8 h-8 bg-akusho-neon rounded-full flex items-center justify-center">
                  <span className="text-akusho-deepest font-heading text-xl">"</span>
                </div>
              </div>

              <div className="flex gap-1 mb-4 pt-2">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">"{testimonial.text}"</p>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-akusho-neon to-purple-500 flex items-center justify-center">
                  <span className="text-white font-heading text-lg">{testimonial.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-heading text-gray-900 dark:text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">Verified Collector</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Newsletter
function NewsletterSection({ isLowPerf }: { isLowPerf: boolean }) {
  const [email, setEmail] = useState("");

  return (
    <section className="relative py-20 bg-gradient-to-br from-purple-900 via-akusho-deepest to-akusho-darker overflow-hidden">
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-akusho-neon/20 rounded-full blur-3xl"
          animate={isLowPerf ? {} : { y: [0, -50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-akusho-neon" />
            <span className="text-akusho-neon text-sm font-medium">Join 10,000+ Collectors</span>
          </div>

          <h2 className="font-heading text-3xl md:text-5xl text-white mb-4">
            Get <span className="text-akusho-neon">Early Access</span> to New Drops
          </h2>

          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about exclusive releases, flash sales, and collector events.
          </p>

          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 bg-akusho-dark border border-akusho-neon/30 rounded-xl text-white placeholder-gray-500 focus:border-akusho-neon focus:ring-1 focus:ring-akusho-neon outline-none transition-all"
            />
            <motion.button
              type="submit"
              className="px-8 py-4 bg-akusho-neon text-akusho-deepest font-heading rounded-xl hover:bg-white transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Subscribe
            </motion.button>
          </form>

          <p className="text-gray-500 text-sm mt-4">No spam, unsubscribe anytime.</p>
        </motion.div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection({ isLowPerf }: { isLowPerf: boolean }) {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-purple-600 to-akusho-neon" />

      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 border border-white/10 rounded-full"
            style={{ left: `${20 + i * 15}%`, top: `${10 + i * 10}%` }}
            animate={isLowPerf ? {} : { scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-heading text-4xl md:text-6xl text-white mb-6">Ready to Start Your Collection?</h2>
          <p className="text-white/80 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Join AKUSHO today and get exclusive access to new releases, limited editions, and special discounts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-700 font-heading text-lg rounded-xl hover:bg-akusho-deepest hover:text-white transition-colors"
              >
                Start Shopping
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white font-heading text-lg rounded-xl hover:bg-white hover:text-purple-700 transition-colors"
              >
                Create Account
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}