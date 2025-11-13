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

export interface Order {
  _id: string; // MongoDB uses _id
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
  updated_at: string;
  // This schema doesn't have items, so we omit them
}

/**
 * Represents a User object from your MongoDB database
 */
export interface User {
  _id: string; // MongoDB's ID
  name: string;
  email: string;
}

/**
 * The expected response from your /api/auth/login endpoint
 */
export interface LoginResponse {
  token: string;
  user: {
    id: string; // The backend controller sends 'id', not '_id'
    name: string;
    email: string;
  };
}

// Define the shape of the login response
export interface AdminLoginResponse {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
}
