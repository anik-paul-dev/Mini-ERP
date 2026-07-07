import axios from 'axios';

const API_BASE_URL = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for sending/receiving cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle token refresh automatically
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and it's not a retry request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });
        
        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, redirect to login is handled by AuthContext
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
