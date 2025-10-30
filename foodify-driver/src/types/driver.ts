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
  orderAcceptedAt: string,
  orderDeliveredAt: string;
};

export type DriverShiftDetail = {
  shiftId: number;
  from: string;
  to: string;
  total: number;
  date: string;
  orders: DriverShiftOrder[];
};

export type DriverDeposit = {
  id: number;
  depositAmount: number;
  earningsPaid: number;
  feesDeducted: number;
  status: string;
  createdAt: string;
  confirmedAt: string | null;
};

export type DriverFinanceSummary = {
  cashOnHand: number | string | null;
  unpaidEarnings: number | string | null;
  outstandingDailyFees: number | string | null;
  depositThreshold: number | string | null;
  depositRequired: boolean;
  hasPendingDeposit: boolean;
  nextPayoutAmount: number | string | null;
  feesToDeduct: number | string | null;
};
