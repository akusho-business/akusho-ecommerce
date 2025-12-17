export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: number;
          created_at: string;
          updated_at: string;
          name: string;
          description: string | null;
          price: number;
          image: string | null;
          category: string | null;
          stock: number;
          is_featured: boolean;
          is_new_arrival: boolean;
          is_active: boolean;
        };
        Insert: {
          id?: number;
          created_at?: string;
          updated_at?: string;
          name: string;
          description?: string | null;
          price: number;
          image?: string | null;
          category?: string | null;
          stock?: number;
          is_featured?: boolean;
          is_new_arrival?: boolean;
          is_active?: boolean;
        };
        Update: {
          id?: number;
          created_at?: string;
          updated_at?: string;
          name?: string;
          description?: string | null;
          price?: number;
          image?: string | null;
          category?: string | null;
          stock?: number;
          is_featured?: boolean;
          is_new_arrival?: boolean;
          is_active?: boolean;
        };
      };
      categories: {
        Row: {
          id: number;
          created_at: string;
          name: string;
          slug: string;
          image: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          name: string;
          slug: string;
          image?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          name?: string;
          slug?: string;
          image?: string | null;
        };
      };
      orders: {
        Row: {
          id: number;
          created_at: string;
          customer_email: string;
          customer_name: string;
          customer_phone: string | null;
          shipping_address: string;
          total_amount: number;
          status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
          items: Json;
        };
        Insert: {
          id?: number;
          created_at?: string;
          customer_email: string;
          customer_name: string;
          customer_phone?: string | null;
          shipping_address: string;
          total_amount: number;
          status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
          items: Json;
        };
        Update: {
          id?: number;
          created_at?: string;
          customer_email?: string;
          customer_name?: string;
          customer_phone?: string | null;
          shipping_address?: string;
          total_amount?: number;
          status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
          items?: Json;
        };
      };
    };
  };
}

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
export type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderStatus = Order["status"];