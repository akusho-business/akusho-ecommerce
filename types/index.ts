// types/index.ts
// Complete TypeScript type definitions for AKUSHO

// ============================================
// USER & AUTH TYPES
// ============================================

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

// ============================================
// PRODUCT TYPES
// ============================================

export interface Product {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  compare_price?: number;
  category?: string;
  category_id?: number;
  image?: string;
  image_url?: string;
  images?: string[];
  sku?: string;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  is_new?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductInput {
  name: string;
  description?: string;
  price: number;
  compare_price?: number;
  category?: string;
  image_url?: string;
  images?: string[];
  sku?: string;
  stock?: number;
  is_active?: boolean;
  is_featured?: boolean;
  is_new?: boolean;
}

// ============================================
// CATEGORY TYPES
// ============================================

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: number;
  is_active: boolean;
  created_at?: string;
  product_count?: number;
}

// ============================================
// CART TYPES
// ============================================

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug?: string;
  variant?: string;
  sku?: string;
}

export interface CartContextType {
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

// ============================================
// ORDER TYPES
// ============================================

export type OrderStatus = 
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "return_requested";

export type PaymentStatus = 
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
}

export interface ShippingAddress {
  address: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id?: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  
  // Customer Info
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  
  // Shipping
  shipping_address: string | ShippingAddress;
  shipping_city?: string;
  shipping_state?: string;
  shipping_pincode?: string;
  
  // Items & Pricing
  items: OrderItem[];
  subtotal: number;
  shipping_cost?: number;
  discount?: number;
  total_amount: number;
  
  // Payment
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  
  // Shiprocket
  awb_code?: string;
  shiprocket_order_id?: string;
  shiprocket_shipment_id?: string;
  courier_name?: string;
  label_url?: string;
  manifest_url?: string;
  tracking_id?: string;
  
  // Timestamps
  pickup_scheduled_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  expected_delivery?: string;
  
  // Returns
  return_reason?: string;
  return_notes?: string;
  return_requested_at?: string;
  return_awb_code?: string;
  refund_status?: string;
  refund_amount?: number;
  refunded_at?: string;
  
  // Cancellation
  cancel_reason?: string;
  
  // Dates
  created_at: string;
  updated_at: string;
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

// ============================================
// CHECKOUT TYPES
// ============================================

export interface CheckoutCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface CheckoutAddress {
  address: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface CheckoutData {
  items: CartItem[];
  customer: CheckoutCustomer;
  shippingAddress: CheckoutAddress;
  subtotal: number;
  shipping: number;
  discount: number;
  couponCode?: string;
  userId?: string;
}

export interface CheckoutResponse {
  success: boolean;
  razorpayOrderId?: string;
  orderId?: number;
  orderNumber?: string;
  amount?: number;
  error?: string;
}

// ============================================
// SHIPPING TYPES
// ============================================

export interface ShippingRate {
  id: number;
  name: string;
  rate: number;
  etd: string;
  cod: boolean;
  codCharges: number;
  minWeight: number;
}

export interface ShippingRatesResult {
  serviceable: boolean;
  couriers: ShippingRate[];
  cheapest?: ShippingRate;
  fastest?: ShippingRate;
  pincode?: string;
  weight?: number;
  defaultShipping?: number;
}

export interface TrackingActivity {
  date: string;
  status: string;
  activity: string;
  location: string;
}

export interface TrackingResponse {
  success: boolean;
  status: string;
  awb?: string;
  courier?: string;
  estimatedDelivery?: string;
  trackingUrl?: string;
  currentStatus?: {
    status: string;
    destination: string;
    origin: string;
    pickupDate: string;
    deliveredDate?: string;
  };
  activities: TrackingActivity[];
  message?: string;
}

// ============================================
// EMAIL TYPES
// ============================================

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  paymentMethod?: string;
}

export interface ShippingEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  trackingId: string;
  courierName?: string;
  trackingUrl?: string;
  expectedDelivery?: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ProductsResponse {
  products: Product[];
  error?: string;
}

export interface OrdersResponse {
  orders: Order[];
  stats?: OrderStats;
  error?: string;
}

// ============================================
// COMPONENT PROP TYPES
// ============================================

export interface ProductCardProps {
  product: Product;
  index?: number;
}

export interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
}

export interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

// ============================================
// RAZORPAY TYPES
// ============================================

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      close: () => void;
    };
  }
}

// ============================================
// UTILITY TYPES
// ============================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;