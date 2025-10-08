import { apiClient } from './api';
import type { DriverShift } from '../types/shift';
import type { OrderDto } from '../types/order';

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

type UpdateDriverAvailabilityPayload = {
  available: boolean;
};

export const updateDriverAvailability = async (
  payload: UpdateDriverAvailabilityPayload,
): Promise<DriverShift> => {
  const response = await apiClient.post<DriverShift>('/api/driver/updateStatus', payload);

  return response.data;
};

export const acceptOrder = async (orderId: number): Promise<OrderDto> => {
  const response = await apiClient.post<OrderDto>(`/api/driver/accept-order/${orderId}`);

  return response.data;
};
