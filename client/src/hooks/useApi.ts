import { useState, useCallback } from 'react';
import apiClient from '../api/apiClient';
import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import toast from 'react-hot-toast';

interface ApiOptions extends AxiosRequestConfig {
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async <T>(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: any, options: ApiOptions = {}): Promise<T | null> => {
      setLoading(true);
      setError(null);

      const { showSuccessToast = false, successMessage, showErrorToast = true, ...axiosConfig } = options;

      try {
        const response: AxiosResponse = await apiClient({
          url,
          method,
          data,
          ...axiosConfig,
        });

        if (showSuccessToast) {
          toast.success(successMessage || response.data.message || 'Success');
        }

        return response.data.data;
      } catch (err) {
        const error = err as AxiosError<{ message: string; errors?: any[] }>;
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        
        setError(errorMessage);
        
        if (showErrorToast) {
          toast.error(errorMessage);
        }

        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const get = useCallback(<T>(url: string, options?: ApiOptions) => request<T>(url, 'GET', undefined, options), [request]);
  const post = useCallback(<T>(url: string, data?: any, options?: ApiOptions) => request<T>(url, 'POST', data, options), [request]);
  const put = useCallback(<T>(url: string, data?: any, options?: ApiOptions) => request<T>(url, 'PUT', data, options), [request]);
  const del = useCallback(<T>(url: string, options?: ApiOptions) => request<T>(url, 'DELETE', undefined, options), [request]);

  return { loading, error, request, get, post, put, del };
}
