export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
}

export interface Tag {
  _id: string;
  name: string;
  description?: string;
  
}


export interface PaginatedProductResponse {
  data: Product[];
  hasMore: boolean;
  page: number;
  total: number;
}

export interface Fragrance {
  _id: string;
  name: string;
  // Updated structure
  notes: {
    top: string[];
    middle: string[];
    base: string[];
  };
  in_stock: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  images: string[];
  features?: string[];
  
  // --- NEW FIELDS ---
  tags?: Tag[]; // Array of Tag IDs
  available_fragrances?: (string | Fragrance)[]; // Array of Fragrance IDs
  allow_custom_message?: boolean;
  tag?: any[]; // Keep this for backward compatibility if needed, or remove
  // ------------------

  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export interface OrderItem {
  _id: string;
  product: Product; // It's now a full Product object, not just an ID
  quantity: number;
  price_at_purchase: number;
  selected_fragrances: Fragrance[]; // Array of Fragrance objects
  custom_message?: string;
}

export interface Order {
  updatedAt: string;
  _id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  // Backend might return 'shipping_address' object based on your new schema
  shipping_address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  // Fallback for old schema compatibility
  customer_address?: string; 
  
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  
  // Support both naming conventions to prevent errors
  createdAt: string; 
  created_at?: string;
  
  items: OrderItem[]; // Use the new OrderItem interface
  updated_at?: string;
}

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



export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  page: number;
  total: number;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    hasMore: boolean;
    totalFiltered: number;
  };
  stats: {
    revenue: number;
    total: number;
    pending: number;
  };
}



// Optional: Define the type here or import it if you have it elsewhere
export interface StoreSettings {
  contact_email: string;
  contact_phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export interface EnquiryData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

export interface RatingResponse {
  message: string;
}

export interface UserRatingStatus {
  hasRated: boolean;
  rating: number;
}