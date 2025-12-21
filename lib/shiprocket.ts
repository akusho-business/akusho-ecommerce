// lib/shiprocket.ts
// ENHANCED Shiprocket API Integration for AKUSHO
// Includes: Order workflow, RTD automation, webhook handling

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

// Token cache (valid for 10 days, we refresh after 9)
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

// ============================================
// AUTHENTICATION
// ============================================

/**
 * Get authentication token (cached for 9 days)
 */
export async function getAuthToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Shiprocket auth error:", error);
    throw new Error("Failed to authenticate with Shiprocket");
  }

  const data = await response.json();
  
  if (!data.token) {
    throw new Error("No token received from Shiprocket");
  }
  
  cachedToken = data.token;
  // Token valid for 10 days, refresh after 9 days to be safe
  tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;

  return data.token;
}

/**
 * Make authenticated API request to Shiprocket
 */
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Shiprocket API Error:", data);
    throw new Error(data.message || `Shiprocket API error: ${response.status}`);
  }

  return data;
}

// ============================================
// SERVICEABILITY & RATES
// ============================================

export interface ServiceabilityParams {
  pickupPincode: string;
  deliveryPincode: string;
  weight: number; // in kg
  cod: boolean;
  declaredValue?: number;
  length?: number; // cm
  breadth?: number; // cm
  height?: number; // cm
}

export interface CourierOption {
  id: number;
  name: string;
  rate: number;
  etd: string; // Estimated delivery days
  cod: boolean;
  codCharges: number;
  minWeight: number;
}

export interface ShippingRatesResult {
  serviceable: boolean;
  couriers: CourierOption[];
  cheapest?: CourierOption;
  fastest?: CourierOption;
}

/**
 * Check pincode serviceability and get available couriers
 */
export async function checkServiceability(
  params: ServiceabilityParams
): Promise<any> {
  const queryParams = new URLSearchParams({
    pickup_postcode: params.pickupPincode,
    delivery_postcode: params.deliveryPincode,
    weight: params.weight.toString(),
    cod: params.cod ? "1" : "0",
  });

  if (params.declaredValue) {
    queryParams.append("declared_value", params.declaredValue.toString());
  }

  if (params.length && params.breadth && params.height) {
    queryParams.append("length", params.length.toString());
    queryParams.append("breadth", params.breadth.toString());
    queryParams.append("height", params.height.toString());
  }

  return apiRequest(`/courier/serviceability/?${queryParams.toString()}`);
}

/**
 * Get shipping rates for checkout display
 */
export async function getShippingRates(
  deliveryPincode: string,
  weight: number = 0.5,
  cod: boolean = false,
  declaredValue?: number
): Promise<ShippingRatesResult> {
  const pickupPincode = process.env.WAREHOUSE_PINCODE || "110031";

  try {
    const result = await checkServiceability({
      pickupPincode,
      deliveryPincode,
      weight,
      cod,
      declaredValue,
    });

    if (
      !result.data?.available_courier_companies ||
      result.data.available_courier_companies.length === 0
    ) {
      return { serviceable: false, couriers: [] };
    }

    const couriers: CourierOption[] = result.data.available_courier_companies.map(
      (c: any) => ({
        id: c.courier_company_id,
        name: c.courier_name,
        rate: Math.round(c.rate), // Round to whole number
        etd: c.etd,
        cod: c.cod === 1,
        codCharges: c.cod_charges || 0,
        minWeight: c.min_weight,
      })
    );

    // Sort by rate (cheapest first)
    couriers.sort((a, b) => a.rate - b.rate);

    // Find fastest option
    const fastest = couriers.reduce((prev, curr) => {
      const prevDays = parseInt(prev.etd) || 99;
      const currDays = parseInt(curr.etd) || 99;
      return currDays < prevDays ? curr : prev;
    });

    return {
      serviceable: true,
      couriers,
      cheapest: couriers[0],
      fastest,
    };
  } catch (error) {
    console.error("Error getting shipping rates:", error);
    return { serviceable: false, couriers: [] };
  }
}

// ============================================
// ORDER MANAGEMENT
// ============================================

export interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  discount?: number;
  tax?: number;
  hsn?: string;
}

export interface CreateOrderParams {
  order_id: string;
  order_date: string;
  pickup_location: string;
  billing_customer_name: string;
  billing_last_name?: string;
  billing_address: string;
  billing_address_2?: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  shipping_customer_name?: string;
  shipping_address?: string;
  shipping_address_2?: string;
  shipping_city?: string;
  shipping_pincode?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_phone?: string;
  order_items: ShiprocketOrderItem[];
  payment_method: "Prepaid" | "COD";
  sub_total: number;
  length: number; // cm
  breadth: number; // cm
  height: number; // cm
  weight: number; // kg
}

export interface CreateOrderResponse {
  order_id: number;
  shipment_id: number;
  status: string;
  status_code: number;
  onboarding_completed_now: number;
  awb_code: string | null;
  courier_company_id: string | null;
  courier_name: string | null;
}

/**
 * Create order in Shiprocket
 */
export async function createOrder(
  orderData: CreateOrderParams
): Promise<CreateOrderResponse> {
  return apiRequest("/orders/create/adhoc", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
}

/**
 * Cancel order in Shiprocket
 */
export async function cancelOrder(orderIds: number[]): Promise<any> {
  return apiRequest("/orders/cancel", {
    method: "POST",
    body: JSON.stringify({ ids: orderIds }),
  });
}

/**
 * Cancel shipment (before pickup)
 */
export async function cancelShipment(awbs: string[]): Promise<any> {
  return apiRequest("/orders/cancel/shipment/awbs", {
    method: "POST",
    body: JSON.stringify({ awbs }),
  });
}

// ============================================
// COURIER & AWB
// ============================================

export interface AssignAWBResponse {
  awb_assign_status: number;
  response: {
    data: {
      awb_code: string;
      courier_company_id: number;
      courier_name: string;
      assigned_date_time: {
        date: string;
        timezone_type: number;
        timezone: string;
      };
    };
  };
}

/**
 * Assign AWB (courier) to shipment
 * If courierId is not provided, Shiprocket auto-selects the best courier
 */
export async function assignAWB(
  shipmentId: number,
  courierId?: number
): Promise<AssignAWBResponse> {
  const body: Record<string, any> = { shipment_id: shipmentId };
  if (courierId) {
    body.courier_id = courierId;
  }

  return apiRequest("/courier/assign/awb", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Schedule pickup for shipment
 */
export async function schedulePickup(shipmentIds: number[]): Promise<any> {
  return apiRequest("/courier/generate/pickup", {
    method: "POST",
    body: JSON.stringify({ shipment_id: shipmentIds }),
  });
}

// ============================================
// LABELS & MANIFESTS
// ============================================

/**
 * Generate shipping label
 */
export async function generateLabel(shipmentIds: number[]): Promise<any> {
  return apiRequest("/courier/generate/label", {
    method: "POST",
    body: JSON.stringify({ shipment_id: shipmentIds }),
  });
}

/**
 * Generate manifest
 */
export async function generateManifest(shipmentIds: number[]): Promise<any> {
  return apiRequest("/manifests/generate", {
    method: "POST",
    body: JSON.stringify({ shipment_id: shipmentIds }),
  });
}

/**
 * Print manifest
 */
export async function printManifest(orderIds: number[]): Promise<any> {
  return apiRequest("/manifests/print", {
    method: "POST",
    body: JSON.stringify({ order_ids: orderIds }),
  });
}

/**
 * Print invoice
 */
export async function printInvoice(orderIds: number[]): Promise<any> {
  return apiRequest("/orders/print/invoice", {
    method: "POST",
    body: JSON.stringify({ ids: orderIds }),
  });
}

// ============================================
// TRACKING
// ============================================

export interface TrackingResponse {
  tracking_data: {
    track_status: number;
    shipment_status: number;
    shipment_track: Array<{
      id: number;
      awb_code: string;
      courier_company_id: number;
      shipment_id: number;
      order_id: number;
      pickup_date: string;
      delivered_date: string;
      weight: string;
      packages: number;
      current_status: string;
      delivered_to: string;
      destination: string;
      consignee_name: string;
      origin: string;
      courier_agent_details: string | null;
      edd: string;
    }>;
    shipment_track_activities: Array<{
      date: string;
      status: string;
      activity: string;
      location: string;
      sr_status: string;
      sr_status_label: string;
    }>;
    track_url: string;
    etd: string;
  };
}

/**
 * Track shipment by AWB code
 */
export async function trackByAWB(awbCode: string): Promise<TrackingResponse> {
  return apiRequest(`/courier/track/awb/${awbCode}`);
}

/**
 * Track shipment by Shiprocket order ID
 */
export async function trackByShiprocketOrderId(
  orderId: string
): Promise<TrackingResponse> {
  return apiRequest(`/courier/track?order_id=${orderId}`);
}

/**
 * Track shipment by your channel order ID
 */
export async function trackByChannelOrderId(
  channelOrderId: string
): Promise<TrackingResponse> {
  return apiRequest(`/courier/track?channel_order_id=${channelOrderId}`);
}

// ============================================
// PICKUP LOCATIONS
// ============================================

/**
 * Get all pickup locations
 */
export async function getPickupLocations(): Promise<any> {
  return apiRequest("/settings/company/pickup");
}

/**
 * Add pickup location
 */
export async function addPickupLocation(locationData: {
  pickup_location: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  address_2?: string;
  city: string;
  state: string;
  country: string;
  pin_code: string;
}): Promise<any> {
  return apiRequest("/settings/company/addpickup", {
    method: "POST",
    body: JSON.stringify(locationData),
  });
}

// ============================================
// UTILITIES
// ============================================

/**
 * Get list of all orders (with pagination)
 */
export async function getOrders(
  page: number = 1,
  perPage: number = 20
): Promise<any> {
  return apiRequest(`/orders?page=${page}&per_page=${perPage}`);
}

/**
 * Get specific order details
 */
export async function getOrder(orderId: number): Promise<any> {
  return apiRequest(`/orders/show/${orderId}`);
}

// ============================================
// STATUS MAPPING
// ============================================

/**
 * Shiprocket status ID to label mapping
 */
export const SHIPROCKET_STATUS_MAP: Record<number, string> = {
  1: "awb_assigned",
  2: "label_generated",
  3: "pickup_scheduled",
  4: "pickup_queued",
  5: "manifest_generated",
  6: "shipped",
  7: "delivered",
  8: "cancelled",
  9: "rto_initiated",
  10: "rto_delivered",
  17: "out_for_delivery",
  18: "in_transit",
  19: "out_for_pickup",
  20: "pickup_exception",
  21: "undelivered",
  38: "reached_destination",
  42: "picked_up",
};

/**
 * Map Shiprocket status to AKUSHO order status
 */
export function mapShiprocketToOrderStatus(shiprocketStatusId: number): string {
  const statusMapping: Record<number, string> = {
    1: "processing",      // AWB Assigned
    2: "processing",      // Label Generated  
    3: "processing",      // Pickup Scheduled
    4: "processing",      // Pickup Queued
    5: "processing",      // Manifest Generated
    6: "shipped",         // Shipped
    7: "delivered",       // Delivered
    8: "cancelled",       // Cancelled
    9: "rto_initiated",   // RTO Initiated
    10: "rto_delivered",  // RTO Delivered
    17: "out_for_delivery", // Out for Delivery
    18: "shipped",        // In Transit
    19: "processing",     // Out for Pickup
    20: "processing",     // Pickup Exception
    21: "undelivered",    // Undelivered
    38: "shipped",        // Reached Destination
    42: "shipped",        // Picked Up
  };

  return statusMapping[shiprocketStatusId] || "processing";
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pending Payment",
    pending_review: "Awaiting Review",
    confirmed: "Order Confirmed",
    processing: "Processing",
    ready_to_dispatch: "Ready to Dispatch",
    shipped: "Shipped",
    in_transit: "In Transit",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    rto_initiated: "Return Initiated",
    rto_delivered: "Returned to Seller",
    undelivered: "Delivery Failed",
  };

  return labels[status] || status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

// ============================================
// READY TO DISPATCH (RTD) WORKFLOW
// ============================================

export interface RTDResult {
  success: boolean;
  shiprocketOrderId?: number;
  shipmentId?: number;
  awbCode?: string;
  courierName?: string;
  labelUrl?: string;
  trackingUrl?: string;
  expectedDelivery?: string;
  error?: string;
}

/**
 * Complete Ready to Dispatch flow:
 * 1. Create order in Shiprocket
 * 2. Assign AWB (auto-select courier)
 * 3. Schedule pickup
 * 4. Generate label
 * 
 * @param order - Order data from your database
 * @returns RTDResult with all shipping details
 */
export async function processReadyToDispatch(order: {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
    sku?: string;
  }>;
  subtotal: number;
  total: number;
  payment_status: string;
}): Promise<RTDResult> {
  console.log(`🚀 Starting RTD process for order ${order.order_number}`);
  
  try {
    // 1. Create order in Shiprocket
    console.log("Step 1: Creating Shiprocket order...");
    
    const orderItems: ShiprocketOrderItem[] = order.items.map((item) => ({
      name: item.name,
      sku: item.sku || `SKU-${item.id}`,
      units: item.quantity,
      selling_price: item.price,
    }));

    // Parse shipping address
    const addressParts = order.shipping_address.split(",").map(s => s.trim());
    const addressLine1 = addressParts[0] || order.shipping_address;
    const addressLine2 = addressParts.slice(1).join(", ");

    // Parse customer name
    const nameParts = order.customer_name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "";

    const shiprocketOrderData: CreateOrderParams = {
      order_id: order.order_number,
      order_date: new Date().toISOString().split("T")[0],
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: addressLine1,
      billing_address_2: addressLine2,
      billing_city: order.shipping_city || "Unknown",
      billing_pincode: order.shipping_pincode || "000000",
      billing_state: order.shipping_state || "Unknown",
      billing_country: "India",
      billing_email: order.customer_email,
      billing_phone: order.customer_phone.replace(/\D/g, "").slice(-10),
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: order.payment_status === "paid" ? "Prepaid" : "COD",
      sub_total: order.subtotal,
      length: 20, // Default dimensions - adjust based on your products
      breadth: 15,
      height: 10,
      weight: 0.5, // Default weight in kg
    };

    const shiprocketOrder = await createOrder(shiprocketOrderData);
    console.log("✅ Shiprocket order created:", shiprocketOrder.order_id);

    // 2. Assign AWB (auto-select best courier)
    console.log("Step 2: Assigning AWB...");
    const awbResult = await assignAWB(shiprocketOrder.shipment_id);
    
    if (awbResult.awb_assign_status !== 1) {
      throw new Error("Failed to assign AWB - courier may not be available");
    }
    
    const awbCode = awbResult.response.data.awb_code;
    const courierName = awbResult.response.data.courier_name;
    console.log(`✅ AWB assigned: ${awbCode} (${courierName})`);

    // 3. Schedule pickup
    console.log("Step 3: Scheduling pickup...");
    await schedulePickup([shiprocketOrder.shipment_id]);
    console.log("✅ Pickup scheduled");

    // 4. Generate label
    console.log("Step 4: Generating label...");
    const labelResult = await generateLabel([shiprocketOrder.shipment_id]);
    const labelUrl = labelResult.label_url || null;
    console.log("✅ Label generated:", labelUrl);

    // 5. Get tracking info
    let trackingUrl: string | undefined = undefined;
    let expectedDelivery: string | undefined = undefined;
    
    try {
      const trackingData = await trackByAWB(awbCode);
      trackingUrl = trackingData.tracking_data?.track_url || undefined;
      expectedDelivery = trackingData.tracking_data?.etd || undefined;
    } catch (e) {
      console.log("Tracking URL not available yet");
    }

    console.log(`✅ RTD complete for order ${order.order_number}`);

    return {
      success: true,
      shiprocketOrderId: shiprocketOrder.order_id,
      shipmentId: shiprocketOrder.shipment_id,
      awbCode,
      courierName,
      labelUrl: labelUrl || undefined,
      trackingUrl,
      expectedDelivery,
    };
  } catch (error: any) {
    console.error("❌ RTD process failed:", error);
    return {
      success: false,
      error: error.message || "Failed to process RTD",
    };
  }
}

// ============================================
// WEBHOOK PROCESSING
// ============================================

export interface ShiprocketWebhookPayload {
  awb: string;
  courier_name: string;
  current_status: string;
  current_status_id: number;
  shipment_status: string;
  shipment_status_id: number;
  current_timestamp: string;
  order_id: string; // Your order_number + Shiprocket suffix
  sr_order_id: number;
  awb_assigned_date: string;
  pickup_scheduled_date: string;
  etd: string;
  scans: Array<{
    date: string;
    status: string;
    activity: string;
    location: string;
    "sr-status": string;
    "sr-status-label": string;
  }>;
  is_return: number;
  channel_id: number;
  pod_status: string;
  pod: string;
}

/**
 * Process Shiprocket webhook payload
 * Returns the mapped order status and tracking info
 */
export function processWebhookPayload(payload: ShiprocketWebhookPayload): {
  orderNumber: string;
  status: string;
  statusLabel: string;
  awbCode: string;
  courierName: string;
  currentActivity: string;
  location: string;
  timestamp: string;
  expectedDelivery: string | null;
  isReturn: boolean;
} {
  // Extract order number (remove Shiprocket suffix like "_123456")
  const orderNumber = payload.order_id.split("_")[0];
  
  // Map status
  const status = mapShiprocketToOrderStatus(payload.current_status_id);
  const statusLabel = getStatusLabel(status);
  
  // Get latest scan info
  const latestScan = payload.scans?.[payload.scans.length - 1];
  
  return {
    orderNumber,
    status,
    statusLabel,
    awbCode: payload.awb,
    courierName: payload.courier_name,
    currentActivity: latestScan?.activity || payload.current_status,
    location: latestScan?.location || "",
    timestamp: payload.current_timestamp,
    expectedDelivery: payload.etd || null,
    isReturn: payload.is_return === 1,
  };
}

export default {
  getAuthToken,
  checkServiceability,
  getShippingRates,
  createOrder,
  cancelOrder,
  cancelShipment,
  assignAWB,
  schedulePickup,
  generateLabel,
  generateManifest,
  printManifest,
  printInvoice,
  trackByAWB,
  trackByShiprocketOrderId,
  trackByChannelOrderId,
  getPickupLocations,
  addPickupLocation,
  getOrders,
  getOrder,
  processReadyToDispatch,
  processWebhookPayload,
  mapShiprocketToOrderStatus,
  getStatusLabel,
  SHIPROCKET_STATUS_MAP,
};