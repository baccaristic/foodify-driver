import { apiClient } from './api';
import type { DriverShift } from '../types/shift';

type UpdateDriverLocationPayload = {
  driverId: number;
  latitude: number;
  longitude: number;
};

export const updateDriverLocation = async ({
  driverId,
  latitude,
  longitude,
}: UpdateDriverLocationPayload): Promise<void> => {
  await apiClient.post('/api/driver/location', {
    driverId,
    latitude,
    longitude,
  });
};

export const getCurrentDriverShift = async (): Promise<DriverShift | null> => {
  const response = await apiClient.get<DriverShift | null>('/api/driver/shift');

  return response.data;
};
