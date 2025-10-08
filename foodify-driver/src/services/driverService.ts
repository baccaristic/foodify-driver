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

type OngoingOrderApiResponse = { orderDto: OrderDto | null } | OrderDto | null;

export const getDriverOngoingOrder = async (): Promise<OrderDto | null> => {
  const response = await apiClient.get<OngoingOrderApiResponse>('/api/driver/ongoing-order');

  const data = response.data;

  if (!data) {
    return null;
  }

  if (typeof data === 'object' && data !== null && 'orderDto' in data) {
    const order = (data as { orderDto: OrderDto | null }).orderDto;

    return order ?? null;
  }

  return data as OrderDto;
};
