import { apiClient } from './api';

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
