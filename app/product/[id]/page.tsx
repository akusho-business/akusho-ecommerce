"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, 
  Heart, 
  Minus, 
  Plus, 
  Loader2,
  Check,
  Package,
  Truck,
  Shield,
  RotateCcw,
  Star,
  ZoomIn,
  X,
  ChevronRight
} from "lucide-react";
import { useCart } from "@/context/CartContext";

interface ProductImage {
  url: string;
  isMain?: boolean;
  label?: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  image_url: string;
  images?: ProductImage[] | null;
  category: string;
  stock: number;
  is_featured: boolean;
  is_active: boolean;
  is_new: boolean;
}

export default function ProductDetailPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/products/${params.id}`);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
          return;
        }

        if (data.product) {
          setProduct(data.product);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Build array of all available images
  const getAllImages = (): string[] => {
    if (!product) return [];
    
    const imageList: string[] = [];
    
    // Check if product has images array with content
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach((img) => {
        if (img.url) {
          imageList.push(img.url);
        }
      });
    }
    
    // If no images from array, use image_url or image
    if (imageList.length === 0) {
      const mainImage = product.image_url || product.image;
      if (mainImage) {
        imageList.push(mainImage);
      }
    }
    
    return imageList;
  };

  const allImages = getAllImages();
  const currentImage = allImages[selectedImageIndex] || "";
  const hasImage = currentImage.length > 0;
  const hasMultipleImages = allImages.length > 1;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-akusho-deepest pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-akusho-neon animate-spin" />
          <p className="text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-akusho-deepest pt-24 flex flex-col items-center justify-center">
        <Package className="w-20 h-20 text-gray-600 mb-4" />
        <h1 className="text-2xl font-heading text-white mb-2">Product Not Found</h1>
        <p className="text-gray-400 mb-6">The product you are looking for does not exist.</p>
        <Link 
          href="/shop"
          className="px-6 py-3 bg-akusho-neon text-akusho-deepest font-heading uppercase tracking-wider rounded-lg hover:bg-akusho-neon/90 transition-colors"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-akusho-deepest pt-20">
      {/* Breadcrumb */}
      <div className="bg-akusho-darker border-b border-akusho-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-600" />
            <Link href="/shop" className="text-gray-400 hover:text-white transition-colors">
              Shop
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-600" />
            {product.category && (
              <>
                <span className="text-gray-400">{product.category}</span>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </>
            )}
            <span className="text-akusho-neon truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          
          {/* Left Column - Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div 
              ref={imageContainerRef}
              className="relative aspect-square bg-gradient-to-br from-akusho-dark to-akusho-darker rounded-2xl overflow-hidden cursor-zoom-in group"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onMouseMove={handleMouseMove}
              onClick={() => setIsZoomModalOpen(true)}
            >
              {hasImage ? (
                <>
                  <Image
                    src={currentImage}
                    alt={product.name}
                    fill
                    className={`object-contain p-6 transition-opacity duration-300 ${isHovering ? "opacity-0" : "opacity-100"}`}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                  
                  <div 
                    className={`absolute inset-0 transition-opacity duration-300 ${isHovering ? "opacity-100" : "opacity-0"}`}
                    style={{
                      backgroundImage: `url(${currentImage})`,
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      backgroundSize: "200%",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="w-32 h-32 text-akusho-neon/20" />
                </div>
              )}

              <div className={`absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-black/60 rounded-lg text-white text-sm transition-opacity ${isHovering ? "opacity-0" : "opacity-100"}`}>
                <ZoomIn className="w-4 h-4" />
                <span>Hover to zoom</span>
              </div>

              <div className={`absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-black/60 rounded-lg text-white text-sm transition-opacity ${isHovering ? "opacity-100" : "opacity-0"}`}>
                <ZoomIn className="w-4 h-4" />
                <span>Click to expand</span>
              </div>

              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.is_new && (
                  <span className="px-3 py-1.5 bg-akusho-neon text-akusho-deepest text-xs font-bold uppercase rounded-md shadow-lg shadow-akusho-neon/30">
                    New Arrival
                  </span>
                )}
                {product.is_featured && (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold uppercase rounded-md">
                    Featured
                  </span>
                )}
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="px-3 py-1.5 bg-orange-500 text-white text-xs font-bold uppercase rounded-md">
                    Only {product.stock} left
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery - Only show if there are images */}
            {hasImage && (
              <div className="flex gap-3 mt-4">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-akusho-neon bg-akusho-dark"
                        : "border-akusho-dark/50 bg-akusho-darker hover:border-akusho-neon/50"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} - Image ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right Column - Product Info */}
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              {product.category && (
                <span className="text-akusho-neon text-sm uppercase tracking-wider">
                  {product.category}
                </span>
              )}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-4 h-4 ${star <= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} 
                  />
                ))}
                <span className="text-gray-400 text-sm ml-2">(24 reviews)</span>
              </div>
            </div>

            <h1 className="font-heading text-3xl lg:text-4xl xl:text-5xl text-white mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-akusho-dark">
              <span className="font-heading text-4xl text-akusho-neon">
                ₹{product.price.toLocaleString()}
              </span>
              <div className="flex items-center gap-2">
                {product.stock > 0 ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 text-sm rounded-full border border-green-500/30">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    In Stock
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-400 text-sm rounded-full border border-red-500/30">
                    <span className="w-2 h-2 bg-red-400 rounded-full" />
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-white font-medium mb-2">Description</h3>
              <p className="text-gray-400 leading-relaxed">
                {product.description || "Experience premium quality with this authentic anime collectible. Perfect for display and adding to your collection."}
              </p>
            </div>

            <div className="space-y-4 mb-6 pb-6 border-b border-akusho-dark">
              <div className="flex items-center gap-4">
                <span className="text-gray-300 w-20">Quantity:</span>
                <div className="flex items-center border border-akusho-dark rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 bg-akusho-dark text-white hover:bg-akusho-darker transition-colors disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(Math.min(Math.max(1, val), product.stock));
                    }}
                    className="w-16 text-center bg-akusho-darker text-white py-3 border-x border-akusho-dark focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 bg-akusho-dark text-white hover:bg-akusho-darker transition-colors disabled:opacity-50"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-gray-500 text-sm">{product.stock} available</span>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addedToCart}
                  className={`flex-1 py-4 px-8 rounded-xl font-heading uppercase tracking-wider flex items-center justify-center gap-3 text-lg transition-all ${
                    addedToCart
                      ? "bg-green-500 text-white"
                      : product.stock === 0
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-akusho-neon text-akusho-deepest hover:shadow-lg hover:shadow-akusho-neon/30"
                  }`}
                  whileHover={product.stock > 0 && !addedToCart ? { scale: 1.02 } : {}}
                  whileTap={product.stock > 0 && !addedToCart ? { scale: 0.98 } : {}}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-5 h-5" />
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </>
                  )}
                </motion.button>

                <motion.button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`p-4 rounded-xl border transition-all ${
                    isWishlisted 
                      ? "bg-red-500/10 border-red-500 text-red-500" 
                      : "border-akusho-dark text-gray-400 hover:border-akusho-neon hover:text-akusho-neon"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart className={`w-6 h-6 ${isWishlisted ? "fill-current" : ""}`} />
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-akusho-dark/50 rounded-xl">
                <div className="p-2 bg-akusho-neon/10 rounded-lg">
                  <Truck className="w-5 h-5 text-akusho-neon" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Free Shipping</p>
                  <p className="text-gray-500 text-xs">On orders over ₹999</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-akusho-dark/50 rounded-xl">
                <div className="p-2 bg-akusho-neon/10 rounded-lg">
                  <Shield className="w-5 h-5 text-akusho-neon" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Secure Payment</p>
                  <p className="text-gray-500 text-xs">100% secure checkout</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-akusho-dark/50 rounded-xl">
                <div className="p-2 bg-akusho-neon/10 rounded-lg">
                  <RotateCcw className="w-5 h-5 text-akusho-neon" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Easy Returns</p>
                  <p className="text-gray-500 text-xs">7 days return policy</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-akusho-dark/50 rounded-xl">
                <div className="p-2 bg-akusho-neon/10 rounded-lg">
                  <Package className="w-5 h-5 text-akusho-neon" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Quality Assured</p>
                  <p className="text-gray-500 text-xs">Authentic products</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-16 border-t border-akusho-dark pt-12">
          <div className="flex gap-8 border-b border-akusho-dark mb-8">
            <button className="pb-4 text-akusho-neon border-b-2 border-akusho-neon font-medium">
              Description
            </button>
            <button className="pb-4 text-gray-400 hover:text-white transition-colors">
              Specifications
            </button>
            <button className="pb-4 text-gray-400 hover:text-white transition-colors">
              Reviews (24)
            </button>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-400 leading-relaxed">
              {product.description || `Introducing the ${product.name} - a must-have addition to any anime collection. This premium collectible features exceptional attention to detail and high-quality materials.`}
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              Each piece is carefully crafted to capture the essence of the character, making it perfect for display. The figure comes in protective packaging to ensure it arrives in perfect condition.
            </p>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomModalOpen && hasImage && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomModalOpen(false)}
          >
            <button 
              className="absolute top-4 right-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
              onClick={() => setIsZoomModalOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            
            <motion.div
              className="relative w-full max-w-4xl aspect-square"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </motion.div>
            
            {/* Modal Thumbnails for multiple images */}
            {hasMultipleImages && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(index);
                    }}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-akusho-neon"
                        : "border-white/20 hover:border-white/50"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-400 text-sm">
              Click anywhere to close
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}