export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
}

export interface Product {
  _id: string; // MongoDB uses _id
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  images: string[];       // Changed from string | null
  features?: string[];
  tag?: string;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}