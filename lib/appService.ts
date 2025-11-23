// lib/appService.ts

import { api } from './apiService';
import { DashboardStats, Product, Order, LoginResponse, AdminLoginResponse, Fragrance, Tag, PaginatedResponse } from './types';


// --- Auth Endpoints ---

/**
 * Logs in the admin.
 * Saves the token to localStorage.
 * @param data - { email: string, password: string }
 */
export const loginAdmin = async (data: any) => {
  // Tell 'api.post' this is an auth request (so it doesn't send a token)
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
// These all use the 'api' object

export const getAdminStats = () => {
  return api.get<DashboardStats>('/admin/stats');
};

export const getAdminOrders = () => {
  return api.get<Order[]>('/admin/orders'); // <-- Use Order[] type
};

/**
 * Updates an order's status.
 */
export const updateOrderStatus = (orderId: string, status: { status: string }) => {
  return api.put(`/admin/orders/${orderId}`, status);
};

// --- Product Endpoints ---

export const getProducts = () => {
  return api.get('/product');
};

export const getAdminProducts = () => {
  return api.get<Product[]>('/admin/products');
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

// --- UPDATED: File Upload Endpoint ---

/**
 * Uploads images to the server using the api.postFormData function.
 * @param formData - The FormData object containing the files
 */
export const uploadAdminImages = (formData: FormData) => {
  // This endpoint must match the one in your Node.js server
  return api.postFormData<{ urls: string[] }>('/admin/upload', formData);
};



// --- Product Endpoints ---

// export const getProducts = () => {
//   return api.get('/product'); // Note: Your route file has /products. Might be a typo?
// };

// ... (getAdminProducts, createAdminProduct, etc. stay the same)

// --- NEW PUBLIC ENDPOINT ---

/**
 * Gets the top-rated "Most Preferred" products.
 * This is a public endpoint.
 */
export const getPreferredProducts = () => {
  // This endpoint must match the one in your Node.js server
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

/**
 * Defines the shape of the paginated response from the API
 */
interface FilterResponse {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
}

/**
 * Fetches products with filtering, sorting, and pagination.
 * This is a public endpoint.
 */
export const filterProducts = (params: FilterParams) => {
  // Create query parameters from the params object
  const queryParams = new URLSearchParams();
  
  if (params.search) queryParams.append('search', params.search);
  if (params.tag) queryParams.append('tag', params.tag);
  if (params.minPrice) queryParams.append('minPrice', String(params.minPrice));
  if (params.maxPrice) queryParams.append('maxPrice', String(params.maxPrice));
  if (params.minRating) queryParams.append('minRating', String(params.minRating));
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.page) queryParams.append('page', String(params.page));
  if (params.limit) queryParams.append('limit', String(params.limit));

  // Call the API with the generated query string
  return api.get<FilterResponse>(`/products/filter?${queryParams.toString()}`);
};

/**
 * Gets a single product by its ID.
 * This is a public endpoint.
 */
export const getProductById = (id: string) => {
  // This matches your controller route: router.get('/:id', getProductById);
  return api.get<Product>(`/products/${id}`);
};

/**
 * Gets all product IDs for static generation.
 * This is a public endpoint.
 */
export const getAllProductIds = () => {
  return api.get<string[]>(`/products/all/ids`);
};


/**
 * Registers a new user.
 */
export const registerUser = (data: any) => {
  // Pass 'true' because this is an auth request and shouldn't send a token
  return api.post('/auth/register', data, true);
};

/**
 * Logs in a user and returns a token and user object.
 */
export const loginUser = (data: any) => {
  // Pass 'true' because this is an auth request
  return api.post<LoginResponse>('/auth/login', data, true);
};

export const getTags = (page = 1, limit = 10) => {
  return api.get<PaginatedResponse<Tag>>(`/admin/tags?page=${page}&limit=${limit}`);
};

/**
 * Fetches paginated fragrances.
 * Default limit is 10.
 */
export const getFragrances = (page = 1, limit = 10) => {
  return api.get<PaginatedResponse<Fragrance>>(`/admin/fragrances?page=${page}&limit=${limit}`);
};




// ... (keep existing imports and functions) ...

// --- TAGS ---

export const createTag = (data: { name: string }) => {
  return api.post<Tag>('/admin/tags', data);
};

export const deleteTag = (id: string) => {
  return api.delete(`/admin/tags/${id}`);
};

// --- FRAGRANCES ---

export const createFragrance = (data: { name: string; description: string; in_stock: boolean }) => {
  return api.post<Fragrance>('/admin/fragrances', data);
};

export const deleteFragrance = (id: string) => {
  return api.delete(`/admin/fragrances/${id}`);
};

export const updateFragranceStock = (id: string, in_stock: boolean) => {
  return api.put<Fragrance>(`/admin/fragrances/${id}`, { in_stock });
};