// lib/toast.ts
// Utility functions for toast notifications
import { toast } from "sonner";

// Custom styled toasts for AKUSHO

/**
 * Show success toast
 */
export const showSuccess = (message: string, description?: string) => {
  toast.success(message, {
    description,
    icon: "✨",
  });
};

/**
 * Show error toast
 */
export const showError = (message: string, description?: string) => {
  toast.error(message, {
    description,
    icon: "❌",
  });
};

/**
 * Show info toast
 */
export const showInfo = (message: string, description?: string) => {
  toast.info(message, {
    description,
    icon: "ℹ️",
  });
};

/**
 * Show warning toast
 */
export const showWarning = (message: string, description?: string) => {
  toast.warning(message, {
    description,
    icon: "⚠️",
  });
};

/**
 * Show loading toast (returns toast id for dismissing)
 */
export const showLoading = (message: string) => {
  return toast.loading(message, {
    icon: "⏳",
  });
};

/**
 * Dismiss a specific toast
 */
export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};

/**
 * Cart specific toasts
 */
export const cartToasts = {
  added: (productName: string) => {
    toast.success("Added to cart!", {
      description: productName,
      icon: "🛒",
    });
  },
  
  removed: (productName: string) => {
    toast.info("Removed from cart", {
      description: productName,
      icon: "🗑️",
    });
  },
  
  updated: (productName: string, quantity: number) => {
    toast.success("Cart updated", {
      description: `${productName} (${quantity} in cart)`,
      icon: "✏️",
    });
  },
  
  cleared: () => {
    toast.info("Cart cleared", {
      icon: "🧹",
    });
  },
};

/**
 * Auth specific toasts
 */
export const authToasts = {
  loginSuccess: (name?: string) => {
    toast.success(`Welcome back${name ? `, ${name}` : ""}!`, {
      icon: "👋",
    });
  },
  
  loginError: (message?: string) => {
    toast.error("Login failed", {
      description: message || "Please check your credentials",
      icon: "🔒",
    });
  },
  
  logoutSuccess: () => {
    toast.info("Logged out successfully", {
      icon: "👋",
    });
  },
  
  signupSuccess: () => {
    toast.success("Account created!", {
      description: "Welcome to AKUSHO",
      icon: "🎉",
    });
  },
  
  signupError: (message?: string) => {
    toast.error("Signup failed", {
      description: message || "Please try again",
      icon: "❌",
    });
  },
  
  passwordResetSent: () => {
    toast.success("Password reset email sent", {
      description: "Check your inbox",
      icon: "📧",
    });
  },
};

/**
 * Order specific toasts
 */
export const orderToasts = {
  creating: () => {
    return toast.loading("Creating order...", {
      icon: "📦",
    });
  },
  
  processing: () => {
    return toast.loading("Processing payment...", {
      icon: "💳",
    });
  },
  
  verifying: () => {
    return toast.loading("Verifying payment...", {
      icon: "🔐",
    });
  },
  
  success: (orderNumber: string) => {
    toast.success("Order placed successfully! 🎉", {
      description: `Order #${orderNumber}`,
      duration: 5000,
    });
  },
  
  failed: (message?: string) => {
    toast.error("Order failed", {
      description: message || "Please try again",
      icon: "❌",
    });
  },
  
  paymentCancelled: () => {
    toast.info("Payment cancelled", {
      icon: "↩️",
    });
  },
};

/**
 * Wishlist specific toasts
 */
export const wishlistToasts = {
  added: (productName: string) => {
    toast.success("Added to wishlist", {
      description: productName,
      icon: "❤️",
    });
  },
  
  removed: (productName: string) => {
    toast.info("Removed from wishlist", {
      description: productName,
      icon: "💔",
    });
  },
};

/**
 * Generic promise toast
 */
export const promiseToast = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) => {
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  });
};

export default toast;