import axios, { isAxiosError } from 'axios';

import { ENV } from '../constants/env';
import { useAuthStore } from '../store/authStore';
import type { RefreshResponse } from '../types/auth';

export const apiClient = axios.create({
  baseURL: ENV.baseApiUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshClient = axios.create({
  baseURL: ENV.baseApiUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

type QueuedRequest = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: any;
};

let isRefreshing = false;
const failedQueue: QueuedRequest[] = [];

const processQueue = (error: unknown, token: string | null) => {
  while (failedQueue.length > 0) {
    const { resolve, reject, config } = failedQueue.shift()!;

    if (!token) {
      reject(error);
      continue;
    }

    const headers = (config.headers as Record<string, string> | undefined) ?? {};
    headers.Authorization = `Bearer ${token}`;
    config.headers = headers;

    apiClient(config)
      .then(resolve)
      .catch(reject);
  }
};

apiClient.interceptors.request.use((config: any) => {
  const { accessToken } = useAuthStore.getState();

  const requestUrl = typeof config.url === 'string' ? config.url : '';
  const isAuthPath =
    requestUrl.endsWith('/api/auth/driver/login') || requestUrl.endsWith('/api/auth/refresh');

  if (accessToken && !isAuthPath) {
    const headers = config.headers ?? {};

    if (!headers.Authorization) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    config.headers = headers;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const status = error?.response?.status;
    const originalRequest = error?.config ?? {};

    if (status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const requestUrl = typeof originalRequest.url === 'string' ? originalRequest.url : '';
    if (requestUrl.endsWith('/api/auth/driver/login') || requestUrl.endsWith('/api/auth/refresh')) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const { refreshToken, setTokens, logout } = useAuthStore.getState();

    if (!refreshToken) {
      logout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    isRefreshing = true;

    try {
      const response = await refreshClient.post<RefreshResponse>('/api/auth/refresh', {
        refreshToken,
      });

      const tokens: RefreshResponse = response.data;

      setTokens({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken ?? refreshToken,
      });

      processQueue(null, tokens.accessToken);

      const headers = originalRequest.headers ?? {};
      headers.Authorization = `Bearer ${tokens.accessToken}`;
      originalRequest.headers = headers;

      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      if (isAxiosError(refreshError)) {
        const refreshStatus = refreshError.response?.status;

        if (refreshStatus === 401 || refreshStatus === 403) {
          logout();
        }
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
