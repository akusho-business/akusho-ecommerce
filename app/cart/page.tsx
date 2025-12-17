"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { NeonText, Button } from "@/components";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  const shippingCost = cartTotal >= 999 ? 0 : 99;
  const totalWithShipping = cartTotal + shippingCost;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-akusho-deepest pt-24 flex items-center justify-center">
        <motion.div
          className="text-center px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-24 h-24 bg-akusho-dark rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-akusho-neon/50" />
          </div>
          <NeonText as="h1" className="text-3xl md:text-4xl mb-4">
            Your Cart is Empty
          </NeonText>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Looks like you haven't added anything to your cart yet.
            Start exploring our collection!
          </p>
          <Button href="/shop" size="lg">
            Start Shopping
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-akusho-deepest pt-24">
      {/* Header */}
      <section className="py-12 bg-akusho-darker">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <NeonText as="h1" className="text-4xl md:text-5xl text-center">
            YOUR CART
          </NeonText>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <span className="text-gray-400">
                  {cart.length} {cart.length === 1 ? "item" : "items"}
                </span>
                <button
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-400 text-sm transition-colors"
                >
                  Clear Cart
                </button>
              </div>

              <AnimatePresence mode="popLayout">
                {cart.map((item, index) => {
                  // Get image URL - check both image_url and image fields
                  const itemData = item as typeof item & { image_url?: string; category?: string };
                  const imageUrl = itemData.image_url || item.image;
                  const hasImage = imageUrl && imageUrl.length > 0;

                  return (
                    <motion.div
                      key={item.id}
                      className="flex gap-4 sm:gap-6 p-4 sm:p-6 bg-akusho-dark rounded-lg mb-4 glow-border"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30, height: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      layout
                    >
                      {/* Product Image */}
                      <Link 
                        href={`/product/${item.id}`}
                        className="relative w-24 h-24 sm:w-32 sm:h-32 bg-akusho-darker rounded-lg overflow-hidden flex-shrink-0"
                      >
                        {hasImage ? (
                          <Image
                            src={imageUrl}
                            alt={item.name}
                            fill
                            className="object-contain p-2"
                            sizes="128px"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-akusho-neon/20 to-transparent flex items-center justify-center">
                            <span className="text-akusho-neon/50 text-xs">
                              {item.name.split(" ")[0]}
                            </span>
                          </div>
                        )}
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${item.id}`}>
                          <h3 className="font-heading text-lg text-white hover:text-akusho-neon transition-colors line-clamp-2">
                            {item.name}
                          </h3>
                        </Link>
                        {itemData.category && (
                          <span className="text-xs text-akusho-neon/70 uppercase tracking-wider">
                            {itemData.category}
                          </span>
                        )}

                        {/* Mobile Price */}
                        <div className="sm:hidden mt-2">
                          <span className="font-heading text-lg text-akusho-neon">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-2 bg-akusho-darker rounded-lg">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="p-2 text-gray-400 hover:text-white transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="p-2 text-gray-400 hover:text-white transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Desktop Price */}
                      <div className="hidden sm:flex flex-col items-end justify-between">
                        <span className="font-heading text-xl text-akusho-neon">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                        <span className="text-gray-500 text-sm">
                          ₹{item.price.toLocaleString()} each
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                className="sticky top-24 p-6 bg-akusho-dark rounded-lg glow-border"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="font-heading text-2xl text-white mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-green-500">FREE</span>
                      ) : (
                        `₹${shippingCost}`
                      )}
                    </span>
                  </div>
                  {shippingCost > 0 && (
                    <p className="text-xs text-gray-500">
                      Free shipping on orders over ₹999
                    </p>
                  )}
                  <div className="border-t border-akusho-neon/20 pt-4">
                    <div className="flex justify-between text-white font-heading text-xl">
                      <span>Total</span>
                      <span className="text-akusho-neon">
                        ₹{totalWithShipping.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code"
                      className="flex-1 px-4 py-3 bg-akusho-darker border border-akusho-neon/30 rounded-lg text-white placeholder-gray-500 focus:border-akusho-neon transition-colors"
                    />
                    <Button variant="outline" size="sm">
                      Apply
                    </Button>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button href="/checkout" className="w-full" size="lg">
                  Proceed to Checkout
                </Button>

                {/* Continue Shopping */}
                <Link
                  href="/shop"
                  className="block text-center text-akusho-neon hover:text-white transition-colors mt-4"
                >
                  Continue Shopping
                </Link>

                {/* Trust Badges */}
                <div className="mt-8 pt-6 border-t border-akusho-neon/20">
                  <div className="grid grid-cols-2 gap-4 text-center text-xs text-gray-400">
                    <div>
                      <span className="block text-akusho-neon mb-1">🔒</span>
                      Secure Checkout
                    </div>
                    <div>
                      <span className="block text-akusho-neon mb-1">📦</span>
                      Fast Delivery
                    </div>
                    <div>
                      <span className="block text-akusho-neon mb-1">✨</span>
                      100% Authentic
                    </div>
                    <div>
                      <span className="block text-akusho-neon mb-1">↩️</span>
                      Easy Returns
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}