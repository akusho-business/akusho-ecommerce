"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  Shield,
  Truck,
  Package,
  RefreshCw,
  Sparkles,
  Zap,
  TrendingUp,
  Heart,
  ShoppingCart,
  Play,
  ExternalLink,
} from "lucide-react";
import { Hero, ProductGrid, SectionHeader, Button } from "@/components";
import { useCart } from "@/context/CartContext";

// ============================================
// DATA - Anime Series for Carousel
// ============================================

const animeSeriesData = [
  {
    id: 1,
    name: "One Piece",
    image: "/anime/onepiece.jpg",
    color: "#E63946",
    gradient: "from-red-600 to-orange-500",
    productCount: 156,
    featured: true,
  },
  {
    id: 2,
    name: "Death Note",
    image: "/anime/deathnote.jpg",
    color: "#1D1D1D",
    gradient: "from-gray-900 to-gray-700",
    productCount: 42,
    featured: false,
  },
  {
    id: 3,
    name: "Naruto",
    image: "/anime/naruto.jpg",
    color: "#FF7B00",
    gradient: "from-orange-500 to-yellow-500",
    productCount: 128,
    featured: true,
  },
  {
    id: 4,
    name: "Attack on Titan",
    image: "/anime/aot.jpg",
    color: "#2D5A27",
    gradient: "from-green-800 to-green-600",
    productCount: 89,
    featured: false,
  },
  {
    id: 5,
    name: "Demon Slayer",
    image: "/anime/demonslayer.jpg",
    color: "#E91E63",
    gradient: "from-pink-600 to-red-500",
    productCount: 134,
    featured: true,
  },
  {
    id: 6,
    name: "Jujutsu Kaisen",
    image: "/anime/jjk.jpg",
    color: "#6B21A8",
    gradient: "from-purple-700 to-blue-600",
    productCount: 98,
    featured: true,
  },
  {
    id: 7,
    name: "Dragon Ball",
    image: "/anime/dragonball.jpg",
    color: "#F97316",
    gradient: "from-orange-500 to-yellow-400",
    productCount: 167,
    featured: true,
  },
  {
    id: 8,
    name: "My Hero Academia",
    image: "/anime/mha.jpg",
    color: "#22C55E",
    gradient: "from-green-500 to-emerald-400",
    productCount: 76,
    featured: false,
  },
  {
    id: 9,
    name: "Spy x Family",
    image: "/anime/spyxfamily.jpg",
    color: "#EC4899",
    gradient: "from-pink-500 to-rose-400",
    productCount: 54,
    featured: true,
  },
  {
    id: 10,
    name: "Chainsaw Man",
    image: "/anime/chainsawman.jpg",
    color: "#DC2626",
    gradient: "from-red-700 to-orange-600",
    productCount: 67,
    featured: true,
  },
  {
    id: 11,
    name: "Tokyo Revengers",
    image: "/anime/tokyorevengers.jpg",
    color: "#0EA5E9",
    gradient: "from-sky-500 to-blue-500",
    productCount: 45,
    featured: false,
  },
  {
    id: 12,
    name: "Bleach",
    image: "/anime/bleach.jpg",
    color: "#000000",
    gradient: "from-gray-900 to-blue-900",
    productCount: 112,
    featured: true,
  },
];

// Sample products data (in production, fetch from API)
const featuredProducts = [
  { id: 1, name: "Gojo Satoru - Domain Expansion", price: 4999, image: "/products/gojo.jpg", category: "Jujutsu Kaisen", is_new: true, is_featured: true },
  { id: 2, name: "Luffy Gear 5 - Nika", price: 6999, image: "/products/luffy.jpg", category: "One Piece", is_new: true, is_featured: true },
  { id: 3, name: "Eren Yeager - Founding Titan", price: 8999, image: "/products/eren.jpg", category: "Attack on Titan", is_new: false, is_featured: true },
  { id: 4, name: "Tanjiro - Hinokami Kagura", price: 3999, image: "/products/tanjiro.jpg", category: "Demon Slayer", is_new: true, is_featured: true },
];

const newArrivals = [
  { id: 5, name: "Anya Forger - Waku Waku", price: 2499, image: "/products/anya.jpg", category: "Spy x Family", is_new: true, is_featured: false },
  { id: 6, name: "Makima - Control Devil", price: 5499, image: "/products/makima.jpg", category: "Chainsaw Man", is_new: true, is_featured: false },
  { id: 7, name: "Itachi Uchiha - Susanoo", price: 7999, image: "/products/itachi.jpg", category: "Naruto", is_new: true, is_featured: false },
  { id: 8, name: "Light Yagami - Death Note", price: 3499, image: "/products/light.jpg", category: "Death Note", is_new: true, is_featured: false },
];

const collections = [
  { name: "Scale Figures", count: 234, image: "/collections/scale.jpg" },
  { name: "Nendoroids", count: 189, image: "/collections/nendoroid.jpg" },
  { name: "Pop Up Parade", count: 156, image: "/collections/popup.jpg" },
  { name: "Limited Edition", count: 45, image: "/collections/limited.jpg" },
];

const testimonials = [
  { id: 1, name: "Rahul S.", text: "Best quality figures I've ever bought. The packaging was incredible and delivery was super fast!", rating: 5 },
  { id: 2, name: "Priya M.", text: "AKUSHO is my go-to for anime collectibles. 100% authentic products every time.", rating: 5 },
  { id: 3, name: "Arjun K.", text: "Amazing collection and great prices. Customer service is top-notch!", rating: 5 },
];

// Live purchase notifications
const recentPurchases = [
  { name: "Amit", city: "Mumbai", product: "Gojo Figure", time: "2 min ago" },
  { name: "Sneha", city: "Delhi", product: "Luffy Gear 5", time: "5 min ago" },
  { name: "Raj", city: "Bangalore", product: "Tanjiro Figure", time: "8 min ago" },
  { name: "Pooja", city: "Chennai", product: "Anya Nendoroid", time: "12 min ago" },
];

// ============================================
// COMPONENTS
// ============================================

// Anime Series Carousel Component
function AnimeSeriesCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

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
      carousel.addEventListener("scroll", checkScroll);
      return () => carousel.removeEventListener("scroll", checkScroll);
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="relative py-12 md:py-16 bg-gray-50 dark:bg-akusho-darker overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="h-[2px] w-12 bg-gradient-to-r from-akusho-neon to-purple-500" />
              <span className="text-akusho-neon text-sm font-semibold uppercase tracking-widest">
                Browse by Series
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-heading text-3xl md:text-4xl text-gray-900 dark:text-white"
            >
              Popular <span className="text-akusho-neon">Anime</span> Series
            </motion.h2>
          </div>

          {/* Navigation Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <motion.button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`p-3 rounded-xl border transition-all duration-300 ${
                canScrollLeft
                  ? "bg-white dark:bg-akusho-dark border-gray-200 dark:border-akusho-neon/30 text-gray-700 dark:text-white hover:border-akusho-neon hover:text-akusho-neon"
                  : "bg-gray-100 dark:bg-akusho-dark/50 border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed"
              }`}
              whileHover={canScrollLeft ? { scale: 1.05 } : {}}
              whileTap={canScrollLeft ? { scale: 0.95 } : {}}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`p-3 rounded-xl border transition-all duration-300 ${
                canScrollRight
                  ? "bg-white dark:bg-akusho-dark border-gray-200 dark:border-akusho-neon/30 text-gray-700 dark:text-white hover:border-akusho-neon hover:text-akusho-neon"
                  : "bg-gray-100 dark:bg-akusho-dark/50 border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed"
              }`}
              whileHover={canScrollRight ? { scale: 1.05 } : {}}
              whileTap={canScrollRight ? { scale: 0.95 } : {}}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 dark:from-akusho-darker to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 dark:from-akusho-darker to-transparent z-10 pointer-events-none" />

          <div
            ref={carouselRef}
            className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollPaddingLeft: "1rem", scrollPaddingRight: "1rem" }}
          >
            {animeSeriesData.map((anime, index) => (
              <motion.div
                key={anime.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                onMouseEnter={() => setHoveredId(anime.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="flex-shrink-0 first:ml-4 last:mr-4"
              >
                <Link href={`/shop?series=${anime.name.toLowerCase().replace(/\s+/g, "-")}`}>
                  <motion.div
                    className="relative w-40 md:w-48 aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group"
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${anime.gradient}`} />

                    {/* Image Placeholder - Replace with actual images */}
                    <div className="absolute inset-0 bg-black/20" />

                    {/* Animated Border Glow */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        boxShadow: `inset 0 0 30px ${anime.color}66, 0 0 40px ${anime.color}44`,
                      }}
                    />

                    {/* Shine Effect */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                    </motion.div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4">
                      {/* Featured Badge */}
                      {anime.featured && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute top-3 right-3"
                        >
                          <div className="px-2 py-1 bg-akusho-neon/90 backdrop-blur-sm rounded-full">
                            <span className="text-[10px] font-bold text-akusho-deepest uppercase tracking-wider flex items-center gap-1">
                              <Flame className="w-3 h-3" />
                              Hot
                            </span>
                          </div>
                        </motion.div>
                      )}

                      {/* Series Name */}
                      <h3 className="font-heading text-xl md:text-2xl text-white leading-tight mb-1 drop-shadow-lg">
                        {anime.name}
                      </h3>

                      {/* Product Count */}
                      <p className="text-white/80 text-sm">
                        {anime.productCount} Products
                      </p>

                      {/* Hover Arrow */}
                      <motion.div
                        className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100"
                        initial={{ x: -10 }}
                        whileHover={{ x: 0 }}
                      >
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                      </motion.div>
                    </div>

                    {/* Bottom Gradient */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile Scroll Indicator */}
        <div className="flex md:hidden justify-center mt-4 gap-1">
          {[...Array(Math.ceil(animeSeriesData.length / 3))].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Infinite Marquee Component
function AnimeMarquee() {
  const animeNames = [
    "ONE PIECE",
    "NARUTO",
    "DEMON SLAYER",
    "JUJUTSU KAISEN",
    "ATTACK ON TITAN",
    "DRAGON BALL",
    "DEATH NOTE",
    "MY HERO ACADEMIA",
    "CHAINSAW MAN",
    "SPY × FAMILY",
    "BLEACH",
    "TOKYO REVENGERS",
  ];

  return (
    <div className="relative py-4 bg-akusho-deepest dark:bg-akusho-deepest overflow-hidden border-y border-akusho-neon/20">
      {/* Glow Line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-akusho-neon/50 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-akusho-neon/50 to-transparent" />

      <div className="flex animate-marquee">
        {[...animeNames, ...animeNames].map((name, index) => (
          <div key={index} className="flex items-center mx-8 whitespace-nowrap">
            <Sparkles className="w-4 h-4 text-akusho-neon/60 mr-3" />
            <span
              className="font-heading text-lg md:text-xl text-gray-600 dark:text-gray-500 tracking-widest hover:text-akusho-neon transition-colors cursor-default"
            >
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Flash Sale Section with Countdown
function FlashSaleSection() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashProducts = featuredProducts.slice(0, 4);

  return (
    <section className="relative py-16 md:py-20 bg-gradient-to-br from-red-900/20 via-akusho-deepest to-orange-900/20 dark:from-red-900/20 dark:via-akusho-deepest dark:to-orange-900/20 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
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
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <Zap className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              </motion.div>
              <span className="text-red-500 font-bold text-lg uppercase tracking-wider">
                Flash Sale
              </span>
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
            <span className="text-gray-400 text-sm uppercase tracking-wider hidden sm:block">
              Ends in:
            </span>
            <div className="flex gap-2">
              {[
                { value: timeLeft.hours, label: "HRS" },
                { value: timeLeft.minutes, label: "MIN" },
                { value: timeLeft.seconds, label: "SEC" },
              ].map((item, index) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-red-500/20 backdrop-blur-sm rounded-xl border border-red-500/30 flex items-center justify-center">
                      <span className="font-heading text-2xl md:text-3xl text-white">
                        {String(item.value).padStart(2, "0")}
                      </span>
                    </div>
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 uppercase tracking-wider">
                      {item.label}
                    </span>
                  </div>
                  {index < 2 && (
                    <span className="text-red-500 text-2xl font-bold mb-4">:</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Flash Sale Products */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {flashProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-akusho-dark rounded-2xl overflow-hidden border border-red-500/20 hover:border-red-500/50 transition-all duration-300"
            >
              {/* Discount Badge */}
              <div className="absolute top-3 left-3 z-10">
                <div className="px-3 py-1 bg-red-500 rounded-full">
                  <span className="text-white text-xs font-bold">-30%</span>
                </div>
              </div>

              {/* Image */}
              <div className="relative aspect-square bg-akusho-darker">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 flex items-center justify-center">
                  <span className="text-gray-600 text-sm">{product.name}</span>
                </div>
                <motion.div
                  className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-xs text-red-400 uppercase tracking-wider mb-1">
                  {product.category}
                </p>
                <h3 className="font-heading text-white text-sm md:text-base line-clamp-2 mb-2 group-hover:text-red-400 transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="font-heading text-lg text-white">
                    ₹{Math.round(product.price * 0.7).toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ₹{product.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
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

// Stats Counter Section
function StatsSection() {
  const stats = [
    { value: 50000, suffix: "+", label: "Figures Sold", icon: Package },
    { value: 15000, suffix: "+", label: "Happy Collectors", icon: Heart },
    { value: 500, suffix: "+", label: "Anime Series", icon: Sparkles },
    { value: 99, suffix: "%", label: "Authentic Products", icon: Shield },
  ];

  const [inView, setInView] = useState(false);

  return (
    <section className="relative py-16 bg-akusho-deepest overflow-hidden">
      {/* Background Pattern */}
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
                  {inView && (
                    <CountUp end={stat.value} suffix={stat.suffix} />
                  )}
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

// Count Up Animation Component
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

// Bento Grid Collections
function BentoCollections() {
  return (
    <section className="py-16 md:py-20 bg-white dark:bg-akusho-darker">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Shop by Category"
          subtitle="Find the perfect figure for your collection"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-4 md:gap-6 mt-12">
          {/* Large Card - Scale Figures */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-2 row-span-2 relative group overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-600 aspect-square md:aspect-auto"
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
              <span className="text-white/70 text-sm uppercase tracking-wider mb-2">
                Premium Collection
              </span>
              <h3 className="font-heading text-3xl md:text-4xl text-white mb-2">
                Scale Figures
              </h3>
              <p className="text-white/80 text-sm md:text-base mb-4 max-w-xs">
                High-quality detailed figures from your favorite anime
              </p>
              <Link
                href="/shop?category=scale-figures"
                className="inline-flex items-center gap-2 text-white font-semibold group-hover:gap-4 transition-all"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <motion.div
              className="absolute top-4 right-4 w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full blur-2xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </motion.div>

          {/* Nendoroids */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 aspect-square"
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
              <h3 className="font-heading text-xl md:text-2xl text-white mb-1">Nendoroids</h3>
              <Link
                href="/shop?category=nendoroid"
                className="text-white/80 text-sm flex items-center gap-1 hover:gap-2 transition-all"
              >
                Explore <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>

          {/* Pop Up Parade */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 aspect-square"
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
              <h3 className="font-heading text-xl md:text-2xl text-white mb-1">Pop Up Parade</h3>
              <Link
                href="/shop?category=popup-parade"
                className="text-white/80 text-sm flex items-center gap-1 hover:gap-2 transition-all"
              >
                Explore <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>

          {/* Plush */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 aspect-square"
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
              <h3 className="font-heading text-xl md:text-2xl text-white mb-1">Plush Toys</h3>
              <Link
                href="/shop?category=plush"
                className="text-white/80 text-sm flex items-center gap-1 hover:gap-2 transition-all"
              >
                Explore <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>

          {/* Limited Edition */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 aspect-square"
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
              <div className="flex items-center gap-1 mb-1">
                <Star className="w-4 h-4 text-white fill-white" />
                <span className="text-white/80 text-xs uppercase">Exclusive</span>
              </div>
              <h3 className="font-heading text-xl md:text-2xl text-white mb-1">Limited Edition</h3>
              <Link
                href="/shop?category=limited"
                className="text-white/80 text-sm flex items-center gap-1 hover:gap-2 transition-all"
              >
                Explore <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Live Purchase Notifications
function LivePurchaseNotification() {
  const [currentPurchase, setCurrentPurchase] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showNotification = () => {
      setIsVisible(true);
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setCurrentPurchase((prev) => (prev + 1) % recentPurchases.length);
        }, 500);
      }, 4000);
    };

    // Initial delay
    const initialTimeout = setTimeout(showNotification, 3000);

    // Recurring notifications
    const interval = setInterval(showNotification, 8000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  const purchase = recentPurchases[currentPurchase];

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

// Trust Badges Section
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
                  <h4 className="font-heading text-gray-900 dark:text-white text-sm md:text-base">
                    {badge.title}
                  </h4>
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

// Featured Product Spotlight
function FeaturedSpotlight() {
  const { addToCart } = useCart();
  const [stock] = useState(12);

  const featuredProduct = {
    id: 100,
    name: "Gojo Satoru - Infinite Void Domain Expansion",
    price: 12999,
    originalPrice: 16999,
    image: "/products/gojo-special.jpg",
    category: "Jujutsu Kaisen",
    description: "Limited edition 1/7 scale figure featuring Gojo's iconic Infinite Void technique. Premium PVC with LED base.",
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
            {/* Glow Ring */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: "conic-gradient(from 0deg, #00A8FF, #8B5CF6, #EC4899, #00A8FF)",
                padding: "3px",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-full h-full bg-akusho-deepest rounded-3xl" />
            </motion.div>

            {/* Product Image Container */}
            <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-purple-900/50 to-akusho-dark overflow-hidden m-1">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-600 text-xl">Featured Product Image</span>
              </div>

              {/* Limited Badge */}
              <div className="absolute top-4 left-4">
                <motion.div
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  animate={{ scale: [1, 1.05, 1] }}
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
                {featuredProduct.category}
              </span>
              <span className="px-3 py-1 bg-red-500/20 rounded-full text-red-400 text-xs font-semibold uppercase tracking-wider">
                24% OFF
              </span>
            </div>

            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-white mb-4 leading-tight">
              {featuredProduct.name}
            </h2>

            <p className="text-gray-400 text-lg mb-6">
              {featuredProduct.description}
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
                ₹{featuredProduct.price.toLocaleString()}
              </span>
              <span className="text-xl text-gray-500 line-through">
                ₹{featuredProduct.originalPrice.toLocaleString()}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                onClick={() => addToCart(featuredProduct as any)}
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

            {/* Features */}
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

// Newsletter Section
function NewsletterSection() {
  const [email, setEmail] = useState("");

  return (
    <section className="relative py-20 bg-gradient-to-br from-purple-900 via-akusho-deepest to-akusho-darker overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-akusho-neon/20 rounded-full blur-3xl"
          animate={{
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-akusho-neon/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-akusho-neon" />
            <span className="text-akusho-neon text-sm font-medium">Join 10,000+ Collectors</span>
          </div>

          <h2 className="font-heading text-3xl md:text-5xl text-white mb-4">
            Get <span className="text-akusho-neon">Early Access</span> to New Drops
          </h2>

          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about exclusive releases,
            flash sales, and collector events.
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

          <p className="text-gray-500 text-sm mt-4">
            No spam, unsubscribe anytime. By subscribing you agree to our Privacy Policy.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// Testimonials Section Enhanced
function TestimonialsSection() {
  return (
    <section className="py-20 bg-white dark:bg-akusho-darker">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="What Collectors Say"
          subtitle="Join thousands of satisfied anime enthusiasts"
        />

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
              {/* Quote Mark */}
              <div className="absolute -top-4 left-6">
                <div className="w-8 h-8 bg-akusho-neon rounded-full flex items-center justify-center">
                  <span className="text-akusho-deepest font-heading text-xl">"</span>
                </div>
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4 pt-2">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-akusho-neon to-purple-500 flex items-center justify-center">
                  <span className="text-white font-heading text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-heading text-gray-900 dark:text-white">
                    {testimonial.name}
                  </p>
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

// CTA Section Enhanced
function CTASection() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Video/Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-purple-600 to-akusho-neon" />

      {/* Animated Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 border border-white/10 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 10}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading text-4xl md:text-6xl text-white mb-6">
            Ready to Start Your Collection?
          </h2>
          <p className="text-white/80 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Join AKUSHO today and get exclusive access to new releases,
            limited editions, and special discounts.
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

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function HomePage() {
  return (
    <>
      {/* Live Purchase Notifications */}
      <LivePurchaseNotification />

      {/* Hero Section */}
      <Hero />

      {/* Anime Marquee - Infinite Scroll */}
      <AnimeMarquee />

      {/* Anime Series Carousel - RIGHT BELOW HERO */}
      <AnimeSeriesCarousel />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Flash Sale Section */}
      <FlashSaleSection />

      {/* Featured Product Spotlight */}
      <FeaturedSpotlight />

      {/* Stats Counter */}
      <StatsSection />

      {/* Bento Grid Collections */}
      <BentoCollections />

      {/* New Arrivals */}
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

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Newsletter */}
      <NewsletterSection />

      {/* CTA Section */}
      <CTASection />
    </>
  );
}