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
