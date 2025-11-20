import { apiClient } from '../services/api';
import type { DriverUser } from './auth';

export interface UpdateDriverProfileRequest {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

interface UpdateDriverProfileResponse {
  user: DriverUser;
}

export const updateDriverProfile = async (payload: UpdateDriverProfileRequest) => {
  const { data } = await apiClient.put<UpdateDriverProfileResponse>('/api/auth/driver/profile', payload);
  return data.user;
};

