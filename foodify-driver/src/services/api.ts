import axios from 'axios';

import { ENV } from '../constants/env';

export const apiClient = axios.create({
  baseURL: ENV.baseApiUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: any) => {
  // Attach any default query params or headers here when wiring the real backend.
  return config;
});

apiClient.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    // Central place for logging or transforming API errors.
    return Promise.reject(error);
  },
);
