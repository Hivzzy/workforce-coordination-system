import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/features/auth/store/auth.store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Automatically attach Authorization token from Zustand
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().getAccessToken();
    const tokenType = useAuthStore.getState().tokenType || "Bearer";
    if (token) {
      config.headers.Authorization = `${tokenType} ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors & session expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    if (status === 401 || status === 403) {
      if (url.includes("/auth/login")) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Email atau kata sandi yang Anda masukkan salah";
        return Promise.reject(new Error(message));
      }

      if (typeof window !== "undefined") {
        useAuthStore.getState().logout();
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login?expired=true";
        }
      }
      return Promise.reject(new Error("Sesi otentikasi telah berakhir. Silakan masuk kembali."));
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      `HTTP Error ${status}`;
    return Promise.reject(new Error(message));
  }
);

export async function apiFetch<T = any>(endpoint: string, options: AxiosRequestConfig = {}): Promise<T> {
  const response = await apiClient({
    url: endpoint,
    ...options,
  });
  return response.data;
}
