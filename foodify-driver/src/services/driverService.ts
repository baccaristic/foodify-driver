import { apiClient } from './api';
import type { DriverShift, DriverShiftBalance } from '../types/shift';
import type { OrderDto } from '../types/order';
import type {
  DriverDeposit,
  DriverEarningsQuery,
  DriverEarningsResponse,
  DriverFinanceSummary,
  DriverShiftEarningsResponse,
  DriverShiftDetail,
  DriverVerificationSummaryDto,
  DriverDocumentType,
} from '../types/driver';

export type DriverHeartbeatPayload = {
  latitude?: number;
  longitude?: number;
};

export const sendDriverHeartbeat = async (payload?: DriverHeartbeatPayload): Promise<void> => {
  const body = payload ?? {};

  await apiClient.post('/api/driver/heartbeat', body);
};

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

export const getDriverFinanceSummary = async (): Promise<DriverFinanceSummary | null> => {
  const response = await apiClient.get<DriverFinanceSummary | null>(
    '/api/driver/finance/summary',
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

export const declineOrder = async (orderId: number | string): Promise<void> => {
  await apiClient.post(`/api/driver/decline-order/${orderId}`);
};

export const acceptOrder = async (orderId: number | string): Promise<OrderDto> => {
  const response = await apiClient.post<OrderDto>(
    `/api/driver/accept-order/${orderId}`,
  );

  return response.data;
};

export const getDriverEarnings = async (
  params?: DriverEarningsQuery,
): Promise<DriverEarningsResponse> => {
  let filteredParams: Record<string, string> | undefined;

  if (params) {
    const candidate: Record<string, string> = {};

    if (params.dateOn) {
      candidate.dateOn = params.dateOn;
    }

    if (params.from) {
      candidate.from = params.from;
    }

    if (params.to) {
      candidate.to = params.to;
    }

    if (Object.keys(candidate).length > 0) {
      filteredParams = candidate;
    }
  }

  const response = await apiClient.get<DriverEarningsResponse>('/api/driver/earnings', {
    params: filteredParams,
  });

  return response.data;
};

export const getDriverShiftEarnings = async (
  params?: DriverEarningsQuery,
): Promise<DriverShiftEarningsResponse> => {
  let filteredParams: Record<string, string> | undefined;

  if (params) {
    const candidate: Record<string, string> = {};

    if (params.dateOn) {
      candidate.dateOn = params.dateOn;
    }

    if (params.from) {
      candidate.from = params.from;
    }

    if (params.to) {
      candidate.to = params.to;
    }

    if (Object.keys(candidate).length > 0) {
      filteredParams = candidate;
    }
  }

  const response = await apiClient.get<DriverShiftEarningsResponse>(
    '/api/driver/earnings/shifts',
    {
      params: filteredParams,
    },
  );

  return response.data;
};

export const getDriverShiftDetails = async (
  shiftId: number | string,
): Promise<DriverShiftDetail> => {
  const response = await apiClient.get<DriverShiftDetail>(
    `/api/driver/earnings/shifts/${shiftId}`,
  );

  return response.data;
};

export const getDriverDeposits = async (): Promise<DriverDeposit[]> => {
  const response = await apiClient.get<DriverDeposit[]>(
    '/api/driver/finance/deposits',
  );

  return Array.isArray(response.data) ? response.data : [];
};

// Driver Document Verification Services

/**
 * Get driver verification summary with all document statuses
 */
export const getDriverDocuments = async (): Promise<DriverVerificationSummaryDto> => {
  const response = await apiClient.get<DriverVerificationSummaryDto>('/api/driver/documents');
  return response.data;
};

/**
 * Upload a document for driver verification
 * @param documentType - Type of document (ID_CARD, PROFILE_PICTURE, BULLETIN_N3, UTILITY_BILL, PATENT_NUMBER)
 * @param file - File to upload (image)
 */
export const uploadDriverDocument = async (
  documentType: DriverDocumentType | string,
  file: { uri: string; name: string; type: string }
): Promise<DriverVerificationSummaryDto> => {
  const formData = new FormData();
  
  // Append file to FormData
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  const response = await apiClient.post<DriverVerificationSummaryDto>(
    `/api/driver/documents/${documentType}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};
