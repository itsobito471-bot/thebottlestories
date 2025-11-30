// lib/apiService.ts

// The base URL for our API, read from the .env.local file
const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Gets the auth token from localStorage.
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null; // We are on the server
  }
  return localStorage.getItem('token');
}

/**
 * Helper function to handle 401 Unauthorized globally.
 * Clears data and redirects based on the current section of the app.
 */
function handleUnauthorized() {
  if (typeof window !== 'undefined') {
    // 1. Clear Auth Data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 2. Clear Cart Data
    localStorage.removeItem('thebottlestories_cart');

    // 3. Smart Redirect
    const currentPath = window.location.pathname;

    // Check if the user is currently inside an Admin route
    if (currentPath.startsWith('/admin')) {
      // Redirect to Admin Login page
      // CHANGE THIS if your admin login route is different (e.g. just '/admin')
      window.location.href = '/admin/login'; 
    } else {
      // Redirect to User Login page
      window.location.href = '/login';
    }
  }
}

/**
 * The core, private function that handles JSON API requests.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  isAuthRequest: boolean = false
): Promise<T> {
  // Set default headers
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    // Cache GET requests for 10 seconds to fix the stale data issue
    next: { revalidate: 10 },
  };

  if (!isAuthRequest) {
    const token = getAuthToken();
    if (token) {
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  // --- GLOBAL 401 HANDLER ---
  // Only redirect if this is NOT an auth request (login attempt)
  // We don't want to redirect if the user just typed the wrong password.
  if (response.status === 401 && !isAuthRequest) {
    handleUnauthorized();
    throw new Error('Session expired. Please login again.');
  }
  // --------------------------

  if (response.status === 204) {
    return null as T;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.msg || data.message || `API Error: ${response.status}`);
  }

  return data as T;
}

/**
 * The core, private function for FormData requests.
 */
async function apiFormRequest<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const config: RequestInit = {
    method: 'POST',
    body: formData,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  };

  const token = getAuthToken();
  if (token) {
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  // --- GLOBAL 401 HANDLER ---
  if (response.status === 401) {
    handleUnauthorized();
    throw new Error('Session expired. Please login again.');
  }
  // --------------------------

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.msg || data.message || `API Error: ${response.status}`);
  }
  return data as T;
}

// --- Public API Functions ---

function get<T>(endpoint: string) {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

function post<T>(endpoint: string, data: any, isAuthRequest: boolean = false) {
  return apiRequest<T>(
    endpoint,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    isAuthRequest
  );
}

function put<T>(endpoint:string, data: any) {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

function del<T>(endpoint: string) {
  return apiRequest<T>(endpoint, {
    method: 'DELETE',
  });
}


function patch<T>(endpoint: string, data: any) {
  return apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

function postFormData<T>(endpoint: string, data: FormData) {
  return apiFormRequest<T>(endpoint, data);
}

export const api = {
  get,
  post,
  put,
  delete: del,
  patch,
  postFormData,
};