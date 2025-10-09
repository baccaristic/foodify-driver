export enum DriverShiftStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export type DriverShift = {
  status: DriverShiftStatus;
  startedAt: string | null;
  finishableAt: string | null;
  endedAt: string | null;
};

export type DriverShiftBalance = {
  currentTotal: number | string | null;
};
