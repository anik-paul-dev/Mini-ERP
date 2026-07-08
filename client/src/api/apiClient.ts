import axios from 'axios';

const API_PREFIX = '/api/v1';
const apiOrigin = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
const API_BASE_URL = apiOrigin
  ? apiOrigin.endsWith(API_PREFIX)
    ? apiOrigin
    : `${apiOrigin}${API_PREFIX}`
  : API_PREFIX;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for sending/receiving cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh attempts simultaneously
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(undefined);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle token refresh automatically
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and it's not a retry request
    // Also skip refresh attempt for auth/me and auth/refresh-token endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh-token') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // Queue this request while a refresh is already in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh token using apiClient (so it goes through Vite proxy)
        await apiClient.post('/auth/refresh-token');

        processQueue(null);

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Refresh token failed - user has no valid session
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;