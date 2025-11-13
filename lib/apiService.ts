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
    // --- THIS IS THE UPDATE ---
    // This tells Next.js to cache all GET requests for 10 seconds.
    // This fixes your stale data problem on the product page.
    next: { revalidate: 10 },
    // --------------------------
  };

  if (!isAuthRequest) {
    const token = getAuthToken();
    if (token) {
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (response.status === 204) {
    return null as T;
  }
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.msg || data.message || `API Error: ${response.status}`);
  }
  return data as T;
}

// --- NEW: Core, private function for FormData requests ---
// (This one doesn't need the revalidate flag, as it's for POST/uploads)
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

// --- NEW: Public function for FormData ---
function postFormData<T>(endpoint: string, data: FormData) {
  return apiFormRequest<T>(endpoint, data);
}

// Export all functions as a single 'api' object
export const api = {
  get,
  post,
  put,
  delete: del,
  postFormData,
};