export type DriverEarningsResponse = {
  avilableBalance: number;
  todayBalance: number;
  weekBalance: number;
  monthBalance: number;
  totalEarnings?: number;
};

export type DriverEarningsQuery = {
  dateOn?: string;
  from?: string;
  to?: string;
};

export type DriverShiftEarning = {
  id: number;
  startTime: string;
  endTime: string | null;
  total: number;
};

export type DriverShiftEarningsResponse = {
  total: number;
  shifts: DriverShiftEarning[];
};

export type DriverShiftOrder = {
  orderId: number;
  deliveryId: number;
  pickUpLocation: string;
  deliveryLocation: string;
  orderTotal: number;
  driverEarningFromOrder: number;
  deliveryFee: number;
  restaurantName: string;
  orderItemsCount: number;
};

export type DriverShiftDetail = {
  shiftId: number;
  from: string;
  to: string;
  total: number;
  date: string;
  orders: DriverShiftOrder[];
};
