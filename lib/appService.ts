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
  EnquiryData,
  RatingResponse,
  UserRatingStatus,
  Testimonial,
  AnalyticsData
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
export const updateOrderStatus = (
  orderId: string,
  status: string,
  trackingData?: { trackingId: string; trackingUrl: string }
) => {
  // 1. Create a flat payload object
  const payload: any = { status };

  // 2. Merge tracking data if it exists
  if (trackingData) {
    payload.trackingId = trackingData.trackingId;
    payload.trackingUrl = trackingData.trackingUrl;
  }

  // 3. Send payload directly (do NOT wrap it in { status: ... } again)
  return api.put<Order>(`/admin/orders/${orderId}/status`, payload);
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
  return api.get<PaginatedResponse<Fragrance>>(`/admin/fragrances?page=${page}&limit=${limit}`, { cache: 'no-store' });
};

export const createTag = (data: { name: string }) => {
  return api.post<Tag>('/admin/tags', data);
};

export const deleteTag = (id: string) => {
  return api.delete(`/admin/tags/${id}`);
};

// Updated to support image
export const createFragrance = (data: { name: string; description?: string; in_stock: boolean; image?: string; notes?: any }) => {
  return api.post<Fragrance>('/admin/fragrances', data);
};

export const deleteFragrance = (id: string) => {
  return api.delete(`/admin/fragrances/${id}`);
};

export const updateFragranceStock = (id: string, in_stock: boolean) => {
  return api.put<Fragrance>(`/admin/fragrances/${id}`, { in_stock });
};

// Generic update for all fragrance fields
export const updateFragrance = (id: string, data: Partial<Fragrance>) => {
  return api.put<Fragrance>(`/admin/fragrances/${id}`, data);
};

export const getFragranceById = (id: string) => {
  return api.get<Fragrance>(`/fragrances/${id}`, { cache: 'no-store' });
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


export const getGeneralStoreSettings = () => {
  return api.get<StoreSettings>('/settings');
};

/**
 * Submits a rating (1-5) for a specific product.
 */
export const submitProductRating = (productId: string, rating: number) => {
  return api.post<RatingResponse>(`/products/${productId}/rate`, { rating });
};

/**
 * Checks if the logged-in user has already rated a specific product.
 */
export const checkUserRating = (productId: string) => {
  return api.get<UserRatingStatus>(`/products/${productId}/user-rating`);
};


export const getApprovedTestimonials = (limit = 10) => {
  return api.get<Testimonial[]>(`/testimonials/approved?limit=${limit}`);
};

export const submitTestimonial = (formData: FormData) => {
  // Use postFormData if you set that up in the previous step, 
  // or standard api.post depending on how you handle images.
  return api.postFormData('/testimonials', formData);
};



export const getAdminTestimonials = (page = 1, limit = 10, status = 'all') => {
  return api.get(`/admin/testimonials?page=${page}&limit=${limit}&status=${status}`);
};

export const approveTestimonial = (id: string) => {
  return api.patch(`/admin/testimonials/${id}/approve`, {});
};

export const deleteTestimonial = (id: string) => {
  return api.delete(`/admin/testimonials/${id}`);
};



export const getUserProfileData = () => {
  return api.get<{ user: any, addresses: any[] }>('/user/profile');
};

export const updateUserProfileData = (data: { name: string; phone: string; dob: string }) => {
  return api.put('/user/profile', data);
};

export const addUserAddress = (data: any) => {
  return api.post('/user/address', data);
};

export const deleteUserAddress = (id: string) => {
  return api.delete(`/user/address/${id}`);
};


export const uploadUserProfilePicture = (formData: FormData) => {
  // Uses postFormData which handles multipart/form-data headers
  return api.postFormData('/user/avatar', formData);
};


// --- Updated Types based on your Schema ---

export interface Address {
  _id: string;
  label: string;      // e.g. "Home", "Office"
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'worker' | 'customer';
  phone?: string;
  dob?: string;
  profilePicture?: string;
  createdAt: string;

  // The aggregated field from the backend
  addressDetails: Address[];

  // Optional birthday field
  daysUntilBirthday?: number;
}

export interface PaginatedUserResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    hasMore: boolean;
  };
}

export const getAdminUsers = (page = 1, limit = 10, search = '', filterBirthday = false) => {
  return api.get<PaginatedUserResponse>(
    `/admin/users?page=${page}&limit=${limit}&search=${search}&filterBirthday=${filterBirthday}`
  );
};

// --- Analytics ---

export const getAnalytics = (range = '30d') => {
  return api.get<AnalyticsData>(`/analytics?range=${range}`);
};