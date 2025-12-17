// context/CartContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { toast } from "sonner";

// Types
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug?: string;
  variant?: string;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  isInCart: (id: number) => boolean;
  getItemQuantity: (id: number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("akusho-cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart:", error);
        localStorage.removeItem("akusho-cart");
      }
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("akusho-cart", JSON.stringify(cart));
    }
  }, [cart, isHydrated]);

  // Calculate cart count
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // Add item to cart
  const addToCart = useCallback((item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    const quantity = item.quantity || 1;
    
    // Check existing item BEFORE setState to avoid StrictMode double-toast
    const existingItem = cart.find((i) => i.id === item.id);
    
    if (existingItem) {
      toast.success(`${item.name} — Qty: ${existingItem.quantity + quantity}`);
      setCart((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      );
    } else {
      toast.success(`Added: ${item.name}`);
      setCart((prev) => [...prev, { ...item, quantity }]);
    }
  }, [cart]);

  // Remove item from cart
  const removeFromCart = useCallback((id: number) => {
    const item = cart.find((i) => i.id === id);
    if (item) {
      toast(`Removed: ${item.name}`);
    }
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, [cart]);

  // Update item quantity
  const updateQuantity = useCallback((id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  }, [removeFromCart]);

  // Clear entire cart (silent - no toast for checkout flow)
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Check if item is in cart
  const isInCart = useCallback((id: number) => {
    return cart.some((item) => item.id === id);
  }, [cart]);

  // Get quantity of specific item
  const getItemQuantity = useCallback((id: number) => {
    const item = cart.find((i) => i.id === id);
    return item?.quantity || 0;
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}