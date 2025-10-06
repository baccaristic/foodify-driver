import { apiClient } from './api';
import type { LoginResponse } from '../types/auth';

export const loginDriver = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/api/auth/driver/login', {
    email,
    password,
  });

  return response.data;
};
