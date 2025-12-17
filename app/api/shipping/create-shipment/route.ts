// ============================================
// FILE LOCATION: app/api/shipping/create-shipment/route.ts
// STATUS: REPLACE YOUR EXISTING FILE
// PURPOSE: Create Shiprocket shipment - FIXED JSON address parsing
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createOrder, assignAWB, schedulePickup, generateLabel } from "@/lib/shiprocket";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface OrderItem {
  id?: number;
  name: string;
  sku?: string;
  quantity: number;
  price: number;
}

// Helper to parse address - handles both JSON string and plain string
function parseAddress(addressField: any): {
  address: string;
  city: string;
  state: string;
  pincode: string;
} {
  // Default values
  const defaults = {
    address: "",
    city: "",
    state: "",
    pincode: "",
  };

  if (!addressField) return defaults;

  // If it's already an object
  if (typeof addressField === "object") {
    return {
      address: addressField.address || addressField.street || "",
      city: addressField.city || "",
      state: addressField.state || "",
      pincode: addressField.pincode || addressField.zip || addressField.postal_code || "",
    };
  }

  // If it's a string, try to parse as JSON
  if (typeof addressField === "string") {
    try {
      const parsed = JSON.parse(addressField);
      return {
        address: parsed.address || parsed.street || "",
        city: parsed.city || "",
        state: parsed.state || "",
        pincode: parsed.pincode || parsed.zip || parsed.postal_code || "",
      };
    } catch {
      // Not JSON, return as plain address
      return {
        ...defaults,
        address: addressField,
      };
    }
  }

  return defaults;
}

// Map state codes to full names (Shiprocket needs full names)
const STATE_MAP: Record<string, string> = {
  "DL": "Delhi",
  "MH": "Maharashtra",
  "KA": "Karnataka",
  "TN": "Tamil Nadu",
  "UP": "Uttar Pradesh",
  "WB": "West Bengal",
  "GJ": "Gujarat",
  "RJ": "Rajasthan",
  "MP": "Madhya Pradesh",
  "AP": "Andhra Pradesh",
  "TS": "Telangana",
  "KL": "Kerala",
  "PB": "Punjab",
  "HR": "Haryana",
  "BR": "Bihar",
  "OR": "Odisha",
  "JH": "Jharkhand",
  "AS": "Assam",
  "CG": "Chhattisgarh",
  "UK": "Uttarakhand",
  "HP": "Himachal Pradesh",
  "JK": "Jammu and Kashmir",
  "GA": "Goa",
  "TR": "Tripura",
  "MN": "Manipur",
  "ML": "Meghalaya",
  "NL": "Nagaland",
  "AR": "Arunachal Pradesh",
  "MZ": "Mizoram",
  "SK": "Sikkim",
  "AN": "Andaman and Nicobar Islands",
  "CH": "Chandigarh",
  "DN": "Dadra and Nagar Haveli",
  "DD": "Daman and Diu",
  "LD": "Lakshadweep",
  "PY": "Puducherry",
  "LA": "Ladakh",
};

function getFullStateName(stateCode: string): string {
  const code = stateCode.toUpperCase().trim();
  return STATE_MAP[code] || stateCode; // Return as-is if not found (might already be full name)
}

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    // Fetch order from database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Order fetch error:", orderError);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if shipment already exists
    if (order.shiprocket_order_id) {
      return NextResponse.json({
        success: false,
        error: "Shipment already created for this order",
        shiprocketOrderId: order.shiprocket_order_id,
      });
    }

    // Check payment status
    if (order.payment_status !== "paid") {
      return NextResponse.json({
        success: false,
        error: "Order payment not completed",
      });
    }

    // Parse the shipping address (handles JSON or plain string)
    const shippingAddr = parseAddress(order.shipping_address);
    
    // Use individual fields if available, otherwise use parsed values
    const billingCity = order.shipping_city || shippingAddr.city || "New Delhi";
    const billingState = getFullStateName(order.shipping_state || shippingAddr.state || "Delhi");
    const billingPincode = order.shipping_pincode || shippingAddr.pincode || "110001";
    const billingAddress = shippingAddr.address || order.shipping_address || "Address not provided";

    // Parse items
    let items: OrderItem[] = [];
    if (typeof order.items === "string") {
      try {
        items = JSON.parse(order.items);
      } catch {
        items = [];
      }
    } else if (Array.isArray(order.items)) {
      items = order.items;
    }

    // Calculate weight (0.3kg minimum per item)
    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const weight = Math.max(0.5, totalItems * 0.3);

    // Prepare Shiprocket order data
    const shiprocketOrderData = {
      order_id: order.order_number,
      order_date: new Date(order.created_at).toISOString().split("T")[0],
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
      billing_customer_name: order.customer_name?.split(" ")[0] || "Customer",
      billing_last_name: order.customer_name?.split(" ").slice(1).join(" ") || "",
      billing_address: billingAddress.substring(0, 200), // Shiprocket limit
      billing_address_2: "",
      billing_city: billingCity,
      billing_pincode: billingPincode,
      billing_state: billingState,
      billing_country: "India",
      billing_email: order.customer_email || "noreply@akusho.com",
      billing_phone: order.customer_phone?.replace(/\D/g, "").slice(-10) || "9999999999",
      shipping_is_billing: true,
      order_items: items.map((item, index) => ({
        name: item.name?.substring(0, 100) || `Product ${index + 1}`,
        sku: item.sku || `AKU-${order.id}-${index}`,
        units: item.quantity || 1,
        selling_price: item.price || 0,
        discount: 0,
        tax: 0,
      })),
      payment_method: "Prepaid" as const,
      sub_total: order.total_amount || 0,
      length: 20,
      breadth: 15,
      height: 10,
      weight: weight,
    };

    console.log("Creating Shiprocket order:", JSON.stringify(shiprocketOrderData, null, 2));

    // Create order in Shiprocket
    const shiprocketResponse = await createOrder(shiprocketOrderData);

    console.log("Shiprocket response:", shiprocketResponse);

    // Update order with Shiprocket details
    const updateData: Record<string, any> = {
      shiprocket_order_id: shiprocketResponse.order_id?.toString(),
      shiprocket_shipment_id: shiprocketResponse.shipment_id?.toString(),
      status: "processing",
      updated_at: new Date().toISOString(),
    };

    // Try to auto-assign AWB
    let awbAssigned = false;
    if (shiprocketResponse.shipment_id) {
      try {
        const awbResponse = await assignAWB(shiprocketResponse.shipment_id);
        console.log("AWB response:", awbResponse);

        if (awbResponse.awb_assign_status === 1 && awbResponse.response?.data) {
          updateData.awb_code = awbResponse.response.data.awb_code;
          updateData.courier_name = awbResponse.response.data.courier_name;
          awbAssigned = true;

          // Try to schedule pickup
          try {
            await schedulePickup([shiprocketResponse.shipment_id]);
            updateData.pickup_scheduled_at = new Date().toISOString();
          } catch (pickupError) {
            console.log("Pickup scheduling failed (can be done manually):", pickupError);
          }

          // Try to generate label
          try {
            const labelResponse = await generateLabel([shiprocketResponse.shipment_id]);
            if (labelResponse.label_url) {
              updateData.label_url = labelResponse.label_url;
            }
          } catch (labelError) {
            console.log("Label generation failed (can be done manually):", labelError);
          }
        }
      } catch (awbError) {
        console.log("AWB assignment failed (can be done manually):", awbError);
      }
    }

    // Update order in database
    const { error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId);

    if (updateError) {
      console.error("Order update error:", updateError);
    }

    return NextResponse.json({
      success: true,
      message: awbAssigned
        ? "Shipment created and AWB assigned"
        : "Shipment created (assign AWB manually)",
      shiprocketOrderId: shiprocketResponse.order_id,
      shipmentId: shiprocketResponse.shipment_id,
      awbCode: updateData.awb_code || null,
      courierName: updateData.courier_name || null,
    });

  } catch (error: any) {
    console.error("Create shipment error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create shipment",
      },
      { status: 500 }
    );
  }
}