export enum AddressType {
  HOME = 'HOME',
  APARTMENT = 'APARTMENT',
  WORK = 'WORK',
  OTHER = 'OTHER',
}

export type LocationDto = {
  lat: number;
  lng: number;
};

export type SavedAddressSummary = {
  id: string;
  type: AddressType;
  label: string | null;
  formattedAddress: string | null;
  placeId: string | null;
  entrancePreference: string | null;
  entranceNotes: string | null;
  directions: string | null;
  notes: string | null;
  primary: boolean;
};

export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY_FOR_PICK_UP = 'READY_FOR_PICK_UP',
  IN_DELIVERY = 'IN_DELIVERY',
  DELIVERED = 'DELIVERED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED',
}

export type OrderItemDto = {
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  extras: string[];
  specialInstructions: string | null;
};

export type OrderDto = {
  id: number;
  restaurantName: string | null;
  restaurantId: number | null;
  restaurantAddress: string | null;
  restaurantLocation: LocationDto | null;
  restaurantPhone: string | null;
  clientId: number | null;
  clientName: string | null;
  clientPhone: string | null;
  clientAddress: string | null;
  clientLocation: LocationDto | null;
  savedAddress: SavedAddressSummary | null;
  total: number | null;
  status: OrderStatus;
  createdAt: string | null;
  items: OrderItemDto[];
  driverId: number | null;
  driverName: string | null;
  driverPhone: string | null;
  estimatedPickUpTime: number | string | null;
  estimatedDeliveryTime: number | string | null;
  driverAssignedAt: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  upcoming: boolean;
};
