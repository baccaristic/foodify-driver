import axios from 'axios';

import { apiClient } from './api';
import { ENV } from '../constants/env';
import type { LoginResponse, LogoutRequest, RefreshResponse, SessionStatusResponse } from '../types/auth';
import { getDeviceId } from '../utils/deviceId';

const sessionClient = axios.create({
  baseURL: ENV.baseApiUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const loginDriver = async (email: string, password: string): Promise<LoginResponse> => {
  const deviceId = await getDeviceId();

  const response = await apiClient.post<LoginResponse>('/api/auth/driver/login', {
    email,
    password,
    deviceId,
  });

  return response.data;
};

export const refreshDriverSession = async (
  refreshToken: string,
): Promise<RefreshResponse> => {
  const response = await sessionClient.post<RefreshResponse>('/api/auth/refresh', {
    refreshToken,
  });

  return response.data;
};

export const checkDriverSession = async (
  accessToken: string,
): Promise<SessionStatusResponse> => {
  const response = await sessionClient.post<SessionStatusResponse>(
    '/api/driver/heartbeat',
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data;
};
export const logout = async (payload: LogoutRequest): Promise<{ success: boolean }> => {
  const response = await apiClient.post<{ success: boolean }>('/auth/logout', payload);
  return response.data;
};
