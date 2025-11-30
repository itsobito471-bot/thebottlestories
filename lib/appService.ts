// lib/appService.ts

import { CartItem } from '@/app/context/CartContext';
import { api } from './apiService';
import { 
  DashboardStats, 
  Product, 
  Order, 
  LoginResponse, 
  AdminLoginResponse, 
  Fragrance, 
  Tag, 
  PaginatedResponse, 
  PaginatedProductResponse, 
  OrdersResponse, 
  StoreSettings,
  EnquiryData
} from './types';


// --- Auth Endpoints ---

/**
 * Logs in the admin.
 * Saves the token to localStorage.
 * @param data - { email: string, password: string }
 */
export const loginAdmin = async (data: any) => {
  // Tell 'api.post' this is an auth request (true) 
  // This prevents the page from reloading if the password is wrong (401)
  const response = await api.post<AdminLoginResponse>('/admin-auth/admin-login', data, true);

  if (response.token) {
    localStorage.setItem('token', response.token);
  }
  return response.user;
};

/**
 * Logs out the admin by clearing localStorage.
 */
export const logoutAdmin = () => {
  localStorage.removeItem('token');
  return Promise.resolve();
};

// --- Admin Endpoints (Protected) ---

export const getAdminStats = () => {
  return api.get<DashboardStats>('/admin/stats');
};

export const getAdminOrders = (page = 1, limit = 10, search = '', status = 'all') => {
  // Build query string
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (search) params.append('search', search);
  if (status && status !== 'all') params.append('status', status);

  return api.get<OrdersResponse>(`/admin/orders?${params.toString()}`);
};

/**
 * Updates an order's status.
 */
export const updateOrderStatus = (orderId: string, status: string) => {
  return api.put<Order>(`/admin/orders/${orderId}/status`, { status });
};

// --- Product Endpoints ---

export const getAdminProducts = (page = 1, limit = 10) => {
  return api.get<PaginatedProductResponse>(`/admin/products?page=${page}&limit=${limit}`);
};

export const createAdminProduct = (data: Omit<Product, '_id' | 'created_at' | 'updated_at'>) => {
  return api.post<Product>('/admin/products', data);
};

export const updateAdminProduct = (id: string, data: Partial<Product>) => {
  return api.put<Product>(`/admin/products/${id}`, data);
};

export const deleteAdminProduct = (id: string) => {
  return api.delete(`/admin/products/${id}`);
};

/**
 * Uploads images to the server using the api.postFormData function.
 */
export const uploadAdminImages = (formData: FormData) => {
  return api.postFormData<{ urls: string[] }>('/admin/upload', formData);
};

// --- Public / User Product Endpoints ---

export const getProducts = () => {
  return api.get('/product');
};

/**
 * Gets the top-rated "Most Preferred" products.
 */
export const getPreferredProducts = () => {
  return api.get<Product[]>('/products/preferred');
};

interface FilterParams {
  search?: string;
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

interface FilterResponse {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
}

/**
 * Fetches products with filtering, sorting, and pagination.
 */
export const filterProducts = (params: FilterParams) => {
  const queryParams = new URLSearchParams();
  
  if (params.search) queryParams.append('search', params.search);
  // We will now pass the Tag ID here
  if (params.tag) queryParams.append('tag', params.tag);
  if (params.minPrice) queryParams.append('minPrice', String(params.minPrice));
  if (params.maxPrice) queryParams.append('maxPrice', String(params.maxPrice));
  if (params.minRating) queryParams.append('minRating', String(params.minRating));
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.page) queryParams.append('page', String(params.page));
  if (params.limit) queryParams.append('limit', String(params.limit));

  return api.get<FilterResponse>(`/products/filter?${queryParams.toString()}`);
};
export const getProductById = (id: string) => {
  return api.get<Product>(`/products/${id}`);
};

export const getAllProductIds = () => {
  return api.get<string[]>(`/products/all/ids`);
};

// --- User Auth ---

export const registerUser = (data: any) => {
  // Pass 'true' because this is an auth request
  return api.post('/auth/register', data, true);
};

export const loginUser = (data: any) => {
  // Pass 'true' because this is an auth request
  return api.post<LoginResponse>('/auth/login', data, true);
};

// --- Tags & Fragrances (Admin) ---

export const getTags = (page = 1, limit = 10) => {
  return api.get<PaginatedResponse<Tag>>(`/admin/tags?page=${page}&limit=${limit}`);
};

export const getFragrances = (page = 1, limit = 10) => {
  return api.get<PaginatedResponse<Fragrance>>(`/admin/fragrances?page=${page}&limit=${limit}`);
};

export const createTag = (data: { name: string }) => {
  return api.post<Tag>('/admin/tags', data);
};

export const deleteTag = (id: string) => {
  return api.delete(`/admin/tags/${id}`);
};

export const createFragrance = (data: { name: string; description: string; in_stock: boolean }) => {
  return api.post<Fragrance>('/admin/fragrances', data);
};

export const deleteFragrance = (id: string) => {
  return api.delete(`/admin/fragrances/${id}`);
};

export const updateFragranceStock = (id: string, in_stock: boolean) => {
  return api.put<Fragrance>(`/admin/fragrances/${id}`, { in_stock });
};


interface UserOrdersResponse {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * Fetches the logged-in user's orders with pagination and optional status filtering.
 */
export const getUserOrders = (page = 1, limit = 10, status = 'all') => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  if (status && status !== 'all') {
    params.append('status', status);
  }

  return api.get<UserOrdersResponse>(`/orders/myorders?${params.toString()}`);
};


export const fetchCart = () => {
  return api.get<any[]>('/cart');
};

export const saveCart = (items: CartItem[]) => {
  return api.post('/cart', { items });
};

export const mergeCart = (localItems: CartItem[]) => {
  return api.post('/cart/merge', { localItems });
};

export const getStoreSettings = () => {
  return api.get<StoreSettings>('/admin/settings');
};

export const updateStoreSettings = (settings: StoreSettings) => {
  // We pass the settings object directly as the body because 
  // the backend expects req.body.contact_email, etc.
  return api.post('/admin/settings', settings);
};


// Add/Update this function
export const getAdminEnquiries = (page: number = 1, limit: number = 10) => {
  return api.get(`/admin/enquiries?page=${page}&limit=${limit}`);
};

// Ensure this exists from previous step
export const markEnquiryAsRead = (id: string) => {
  return api.patch(`/admin/enquiries/${id}/read`, {});
};

export const submitEnquiry = (data: EnquiryData) => {
  return api.post('/enquiries', data);
};


export const getAllTags = () => {
  return api.get<Tag[]>('/tags');
};