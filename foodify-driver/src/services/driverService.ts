import { apiClient } from './api';
import type { DriverShift, DriverShiftBalance } from '../types/shift';
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

export const getCurrentDriverShiftBalance = async (): Promise<DriverShiftBalance | null> => {
  const response = await apiClient.get<DriverShiftBalance | null>(
    '/api/driver/shift/balance',
  );

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

type MarkOrderPickedUpPayload = {
  orderId: number | string;
  token: string;
};

type PickupSuccessResponse = { message?: string } | string;

export const markOrderAsPickedUp = async (
  payload: MarkOrderPickedUpPayload,
): Promise<string | null> => {
  const response = await apiClient.post<PickupSuccessResponse>('/api/driver/pickup', {
    orderId: String(payload.orderId),
    token: payload.token,
  });

  const data = response.data;

  if (typeof data === 'string') {
    return data;
  }

  if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
    return data.message;
  }

  return null;
};

type ConfirmDeliveryPayload = {
  orderId: number | string;
  token: string;
};

export const confirmOrderDelivery = async (payload: ConfirmDeliveryPayload): Promise<boolean> => {
  const response = await apiClient.post<boolean>('/api/driver/deliver-order', {
    orderId: payload.orderId,
    token: payload.token,
  });

  return response.data === true;
};

export const acceptOrder = async (orderId: number | string): Promise<OrderDto> => {
  const response = await apiClient.post<OrderDto>(
    `/api/driver/accept-order/${orderId}`,
  );

  return response.data;
};
