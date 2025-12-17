// data/products.ts
// Sample data for AKUSHO homepage - Replace with actual API data in production

export interface Product {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image: string;
  image_url?: string;
  category: string;
  subcategory?: string;
  stock?: number;
  is_featured: boolean;
  is_new: boolean;
  is_active?: boolean;
  tags?: string[];
}

export interface Collection {
  name: string;
  count: number;
  image: string;
  slug?: string;
  color?: string;
}

export interface Testimonial {
  id: number;
  name: string;
  text: string;
  rating: number;
  avatar?: string;
  location?: string;
}

export interface AnimeSeries {
  id: number;
  name: string;
  image: string;
  color: string;
  gradient: string;
  productCount: number;
  featured: boolean;
  slug?: string;
}

// ============================================
// ANIME SERIES DATA
// ============================================

export const animeSeriesData: AnimeSeries[] = [
  {
    id: 1,
    name: "One Piece",
    image: "/anime/onepiece.jpg",
    color: "#E63946",
    gradient: "from-red-600 to-orange-500",
    productCount: 156,
    featured: true,
    slug: "one-piece",
  },
  {
    id: 2,
    name: "Death Note",
    image: "/anime/deathnote.jpg",
    color: "#1D1D1D",
    gradient: "from-gray-900 to-gray-700",
    productCount: 42,
    featured: false,
    slug: "death-note",
  },
  {
    id: 3,
    name: "Naruto",
    image: "/anime/naruto.jpg",
    color: "#FF7B00",
    gradient: "from-orange-500 to-yellow-500",
    productCount: 128,
    featured: true,
    slug: "naruto",
  },
  {
    id: 4,
    name: "Attack on Titan",
    image: "/anime/aot.jpg",
    color: "#2D5A27",
    gradient: "from-green-800 to-green-600",
    productCount: 89,
    featured: false,
    slug: "attack-on-titan",
  },
  {
    id: 5,
    name: "Demon Slayer",
    image: "/anime/demonslayer.jpg",
    color: "#E91E63",
    gradient: "from-pink-600 to-red-500",
    productCount: 134,
    featured: true,
    slug: "demon-slayer",
  },
  {
    id: 6,
    name: "Jujutsu Kaisen",
    image: "/anime/jjk.jpg",
    color: "#6B21A8",
    gradient: "from-purple-700 to-blue-600",
    productCount: 98,
    featured: true,
    slug: "jujutsu-kaisen",
  },
  {
    id: 7,
    name: "Dragon Ball",
    image: "/anime/dragonball.jpg",
    color: "#F97316",
    gradient: "from-orange-500 to-yellow-400",
    productCount: 167,
    featured: true,
    slug: "dragon-ball",
  },
  {
    id: 8,
    name: "My Hero Academia",
    image: "/anime/mha.jpg",
    color: "#22C55E",
    gradient: "from-green-500 to-emerald-400",
    productCount: 76,
    featured: false,
    slug: "my-hero-academia",
  },
  {
    id: 9,
    name: "Spy x Family",
    image: "/anime/spyxfamily.jpg",
    color: "#EC4899",
    gradient: "from-pink-500 to-rose-400",
    productCount: 54,
    featured: true,
    slug: "spy-x-family",
  },
  {
    id: 10,
    name: "Chainsaw Man",
    image: "/anime/chainsawman.jpg",
    color: "#DC2626",
    gradient: "from-red-700 to-orange-600",
    productCount: 67,
    featured: true,
    slug: "chainsaw-man",
  },
  {
    id: 11,
    name: "Tokyo Revengers",
    image: "/anime/tokyorevengers.jpg",
    color: "#0EA5E9",
    gradient: "from-sky-500 to-blue-500",
    productCount: 45,
    featured: false,
    slug: "tokyo-revengers",
  },
  {
    id: 12,
    name: "Bleach",
    image: "/anime/bleach.jpg",
    color: "#000000",
    gradient: "from-gray-900 to-blue-900",
    productCount: 112,
    featured: true,
    slug: "bleach",
  },
  {
    id: 13,
    name: "Hunter x Hunter",
    image: "/anime/hxh.jpg",
    color: "#10B981",
    gradient: "from-emerald-600 to-teal-500",
    productCount: 78,
    featured: false,
    slug: "hunter-x-hunter",
  },
  {
    id: 14,
    name: "Fullmetal Alchemist",
    image: "/anime/fma.jpg",
    color: "#B45309",
    gradient: "from-amber-700 to-yellow-600",
    productCount: 65,
    featured: false,
    slug: "fullmetal-alchemist",
  },
  {
    id: 15,
    name: "Sword Art Online",
    image: "/anime/sao.jpg",
    color: "#3B82F6",
    gradient: "from-blue-600 to-cyan-500",
    productCount: 52,
    featured: false,
    slug: "sword-art-online",
  },
];

// ============================================
// FEATURED PRODUCTS
// ============================================

export const featuredProducts: Product[] = [
  {
    id: 1,
    name: "Gojo Satoru - Domain Expansion",
    slug: "gojo-satoru-domain-expansion",
    price: 4999,
    originalPrice: 5999,
    image: "/products/gojo.jpg",
    category: "Jujutsu Kaisen",
    subcategory: "Scale Figures",
    is_new: true,
    is_featured: true,
    stock: 15,
    tags: ["popular", "limited"],
  },
  {
    id: 2,
    name: "Luffy Gear 5 - Nika Awakening",
    slug: "luffy-gear-5-nika",
    price: 6999,
    originalPrice: 8499,
    image: "/products/luffy.jpg",
    category: "One Piece",
    subcategory: "Scale Figures",
    is_new: true,
    is_featured: true,
    stock: 8,
    tags: ["hot", "limited"],
  },
  {
    id: 3,
    name: "Eren Yeager - Founding Titan",
    slug: "eren-founding-titan",
    price: 8999,
    image: "/products/eren.jpg",
    category: "Attack on Titan",
    subcategory: "Scale Figures",
    is_new: false,
    is_featured: true,
    stock: 12,
    tags: ["collector"],
  },
  {
    id: 4,
    name: "Tanjiro - Hinokami Kagura",
    slug: "tanjiro-hinokami-kagura",
    price: 3999,
    originalPrice: 4499,
    image: "/products/tanjiro.jpg",
    category: "Demon Slayer",
    subcategory: "Scale Figures",
    is_new: true,
    is_featured: true,
    stock: 25,
    tags: ["popular"],
  },
  {
    id: 5,
    name: "Vegeta Ultra Ego",
    slug: "vegeta-ultra-ego",
    price: 5499,
    image: "/products/vegeta.jpg",
    category: "Dragon Ball",
    subcategory: "Scale Figures",
    is_new: false,
    is_featured: true,
    stock: 18,
    tags: ["classic"],
  },
  {
    id: 6,
    name: "Ichigo Bankai Form",
    slug: "ichigo-bankai",
    price: 4299,
    image: "/products/ichigo.jpg",
    category: "Bleach",
    subcategory: "Scale Figures",
    is_new: true,
    is_featured: true,
    stock: 20,
    tags: ["new-arrival"],
  },
  {
    id: 7,
    name: "Deku 100% Power",
    slug: "deku-100-percent",
    price: 3799,
    image: "/products/deku.jpg",
    category: "My Hero Academia",
    subcategory: "Pop Up Parade",
    is_new: false,
    is_featured: true,
    stock: 30,
    tags: ["popular"],
  },
  {
    id: 8,
    name: "Zoro - Santoryu",
    slug: "zoro-santoryu",
    price: 5999,
    originalPrice: 6999,
    image: "/products/zoro.jpg",
    category: "One Piece",
    subcategory: "Scale Figures",
    is_new: true,
    is_featured: true,
    stock: 10,
    tags: ["hot", "limited"],
  },
];

// ============================================
// NEW ARRIVALS
// ============================================

export const newArrivals: Product[] = [
  {
    id: 9,
    name: "Anya Forger - Waku Waku",
    slug: "anya-forger-waku-waku",
    price: 2499,
    image: "/products/anya.jpg",
    category: "Spy x Family",
    subcategory: "Nendoroid",
    is_new: true,
    is_featured: false,
    stock: 45,
    tags: ["cute", "new-arrival"],
  },
  {
    id: 10,
    name: "Makima - Control Devil",
    slug: "makima-control-devil",
    price: 5499,
    image: "/products/makima.jpg",
    category: "Chainsaw Man",
    subcategory: "Scale Figures",
    is_new: true,
    is_featured: false,
    stock: 15,
    tags: ["new-arrival", "popular"],
  },
  {
    id: 11,
    name: "Itachi Uchiha - Susanoo",
    slug: "itachi-susanoo",
    price: 7999,
    image: "/products/itachi.jpg",
    category: "Naruto",
    subcategory: "Scale Figures",
    is_new: true,
    is_featured: false,
    stock: 8,
    tags: ["limited", "new-arrival"],
  },
  {
    id: 12,
    name: "Light Yagami with Death Note",
    slug: "light-yagami-death-note",
    price: 3499,
    image: "/products/light.jpg",
    category: "Death Note",
    subcategory: "Pop Up Parade",
    is_new: true,
    is_featured: false,
    stock: 22,
    tags: ["classic", "new-arrival"],
  },
  {
    id: 13,
    name: "Nezuko - Blood Demon Art",
    slug: "nezuko-blood-demon-art",
    price: 4299,
    image: "/products/nezuko.jpg",
    category: "Demon Slayer",
    subcategory: "Scale Figures",
    is_new: true,
    is_featured: false,
    stock: 18,
    tags: ["new-arrival", "cute"],
  },
  {
    id: 14,
    name: "Sukuna - King of Curses",
    slug: "sukuna-king-of-curses",
    price: 6499,
    image: "/products/sukuna.jpg",
    category: "Jujutsu Kaisen",
    subcategory: "Scale Figures",
    is_new: true,
    is_featured: false,
    stock: 12,
    tags: ["new-arrival", "villain"],
  },
  {
    id: 15,
    name: "Power - Chainsaw Man",
    slug: "power-chainsaw-man",
    price: 4999,
    image: "/products/power.jpg",
    category: "Chainsaw Man",
    subcategory: "Scale Figures",
    is_new: true,
    is_featured: false,
    stock: 20,
    tags: ["new-arrival", "popular"],
  },
  {
    id: 16,
    name: "Yor Forger - Thorn Princess",
    slug: "yor-forger-thorn-princess",
    price: 5299,
    image: "/products/yor.jpg",
    category: "Spy x Family",
    subcategory: "Scale Figures",
    is_new: true,
    is_featured: false,
    stock: 16,
    tags: ["new-arrival", "beautiful"],
  },
];

// ============================================
// FLASH SALE PRODUCTS
// ============================================

export const flashSaleProducts: Product[] = [
  {
    id: 101,
    name: "Naruto Sage Mode",
    slug: "naruto-sage-mode",
    price: 2799,
    originalPrice: 3999,
    image: "/products/naruto-sage.jpg",
    category: "Naruto",
    subcategory: "Pop Up Parade",
    is_new: false,
    is_featured: false,
    stock: 8,
    tags: ["sale"],
  },
  {
    id: 102,
    name: "Sasuke Rinnegan",
    slug: "sasuke-rinnegan",
    price: 3199,
    originalPrice: 4599,
    image: "/products/sasuke.jpg",
    category: "Naruto",
    subcategory: "Scale Figures",
    is_new: false,
    is_featured: false,
    stock: 5,
    tags: ["sale", "limited"],
  },
  {
    id: 103,
    name: "Levi Ackerman",
    slug: "levi-ackerman",
    price: 2499,
    originalPrice: 3499,
    image: "/products/levi.jpg",
    category: "Attack on Titan",
    subcategory: "Pop Up Parade",
    is_new: false,
    is_featured: false,
    stock: 12,
    tags: ["sale", "popular"],
  },
  {
    id: 104,
    name: "Mikasa Ackerman",
    slug: "mikasa-ackerman",
    price: 2299,
    originalPrice: 3299,
    image: "/products/mikasa.jpg",
    category: "Attack on Titan",
    subcategory: "Pop Up Parade",
    is_new: false,
    is_featured: false,
    stock: 15,
    tags: ["sale"],
  },
];

// ============================================
// COLLECTIONS
// ============================================

export const collections: Collection[] = [
  {
    name: "Scale Figures",
    count: 234,
    image: "/collections/scale.jpg",
    slug: "scale-figures",
    color: "#8B5CF6",
  },
  {
    name: "Nendoroids",
    count: 189,
    image: "/collections/nendoroid.jpg",
    slug: "nendoroid",
    color: "#EC4899",
  },
  {
    name: "Pop Up Parade",
    count: 156,
    image: "/collections/popup.jpg",
    slug: "popup-parade",
    color: "#00A8FF",
  },
  {
    name: "Limited Edition",
    count: 45,
    image: "/collections/limited.jpg",
    slug: "limited-edition",
    color: "#F59E0B",
  },
  {
    name: "Plush Toys",
    count: 89,
    image: "/collections/plush.jpg",
    slug: "plush",
    color: "#10B981",
  },
  {
    name: "Pre-Orders",
    count: 67,
    image: "/collections/preorder.jpg",
    slug: "pre-order",
    color: "#EF4444",
  },
];

// ============================================
// TESTIMONIALS
// ============================================

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Rahul Sharma",
    text: "Best quality figures I've ever bought! The packaging was incredible and delivery was super fast. My Gojo figure looks absolutely stunning in my collection.",
    rating: 5,
    location: "Mumbai",
  },
  {
    id: 2,
    name: "Priya Menon",
    text: "AKUSHO is my go-to for anime collectibles. 100% authentic products every time. The attention to detail on these figures is amazing!",
    rating: 5,
    location: "Bangalore",
  },
  {
    id: 3,
    name: "Arjun Kumar",
    text: "Amazing collection and great prices compared to other stores. Customer service is top-notch - they helped me track my order instantly!",
    rating: 5,
    location: "Delhi",
  },
  {
    id: 4,
    name: "Sneha Patel",
    text: "Ordered my first figure from AKUSHO and I'm blown away by the quality. The Luffy Gear 5 figure exceeded all my expectations!",
    rating: 5,
    location: "Ahmedabad",
  },
  {
    id: 5,
    name: "Vikram Singh",
    text: "Fast delivery, secure packaging, and genuine products. What more could you ask for? Will definitely order again!",
    rating: 5,
    location: "Chennai",
  },
  {
    id: 6,
    name: "Ananya Roy",
    text: "The best place to buy anime figures in India. Great prices and the collection is unmatched. Love my new Nezuko figure!",
    rating: 5,
    location: "Kolkata",
  },
];

// ============================================
// LIVE PURCHASE NOTIFICATIONS
// ============================================

export const recentPurchases = [
  { name: "Amit", city: "Mumbai", product: "Gojo Figure", time: "2 min ago" },
  { name: "Sneha", city: "Delhi", product: "Luffy Gear 5", time: "5 min ago" },
  { name: "Raj", city: "Bangalore", product: "Tanjiro Figure", time: "8 min ago" },
  { name: "Pooja", city: "Chennai", product: "Anya Nendoroid", time: "12 min ago" },
  { name: "Vikram", city: "Hyderabad", product: "Eren Titan", time: "15 min ago" },
  { name: "Priya", city: "Pune", product: "Nezuko Figure", time: "18 min ago" },
  { name: "Arjun", city: "Kolkata", product: "Itachi Susanoo", time: "22 min ago" },
  { name: "Neha", city: "Jaipur", product: "Makima Figure", time: "25 min ago" },
];

// ============================================
// STATS DATA
// ============================================

export const statsData = [
  { value: 50000, suffix: "+", label: "Figures Sold" },
  { value: 15000, suffix: "+", label: "Happy Collectors" },
  { value: 500, suffix: "+", label: "Anime Series" },
  { value: 99, suffix: "%", label: "Authentic Products" },
];

// ============================================
// TRUST BADGES
// ============================================

export const trustBadges = [
  { title: "100% Authentic", description: "Genuine products only", icon: "shield" },
  { title: "Fast Delivery", description: "Pan-India shipping", icon: "truck" },
  { title: "Easy Returns", description: "7-day return policy", icon: "refresh" },
  { title: "Secure Packaging", description: "Premium protection", icon: "package" },
];

// ============================================
// EXPORT ALL
// ============================================

export default {
  animeSeriesData,
  featuredProducts,
  newArrivals,
  flashSaleProducts,
  collections,
  testimonials,
  recentPurchases,
  statsData,
  trustBadges,
};