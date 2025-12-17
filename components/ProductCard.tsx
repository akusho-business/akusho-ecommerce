"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Eye } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart } = useCart();
  
  // Use image_url or image field
  const productData = product as Product & { image_url?: string };
  const imageUrl = productData.image_url || product.image || "";
  const hasImage = imageUrl && imageUrl.length > 0;

  // Handle add to cart with proper type
  const handleAddToCart = () => {
    addToCart({
      ...product,
      image: imageUrl,
    } as any);
  };

  return (
    <motion.div
      className="group relative bg-white dark:bg-akusho-dark rounded-lg overflow-hidden border border-gray-200 dark:border-purple-500/20 hover:border-purple-400 dark:hover:border-purple-500/50 transition-all duration-300 shadow-sm hover:shadow-lg dark:shadow-none dark:glow-border dark:card-glow"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-akusho-darker rounded-t-lg">
        {hasImage ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          /* Placeholder when no image */
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-gray-100 dark:from-akusho-neonDark/20 dark:to-akusho-deepest flex items-center justify-center">
            <span className="text-purple-400 dark:text-akusho-neon/50 text-sm">
              {product.name.split(" ")[0]}
            </span>
          </div>
        )}

        {/* Overlay on Hover */}
        <motion.div
          className="absolute inset-0 bg-black/60 dark:bg-akusho-deepest/80 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={false}
        >
          <Link href={`/product/${product.id}`}>
            <motion.button
              className="p-3 bg-purple-500 dark:bg-akusho-neon rounded-full text-white dark:text-akusho-deepest"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="View product"
            >
              <Eye className="w-5 h-5" />
            </motion.button>
          </Link>
          <motion.button
            className="p-3 bg-white rounded-full text-gray-900 dark:text-akusho-deepest"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddToCart}
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Border glow on hover - only in dark mode */}
        <div className="absolute inset-0 border-2 border-transparent dark:group-hover:border-akusho-neon transition-colors duration-300 pointer-events-none" />
      </div>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-heading text-lg text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-akusho-neon transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>
        {product.category && (
          <span className="text-xs text-purple-500 dark:text-akusho-neon/70 uppercase tracking-wider">
            {product.category}
          </span>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="font-heading text-xl text-gray-900 dark:text-white">
            ₹{product.price.toLocaleString()}
          </span>
          <motion.button
            className="md:hidden p-2 bg-purple-500 dark:bg-akusho-neon rounded-full text-white dark:text-akusho-deepest"
            whileTap={{ scale: 0.9 }}
            onClick={handleAddToCart}
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}