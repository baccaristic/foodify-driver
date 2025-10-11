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
