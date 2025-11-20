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

// Driver Document Verification Types
export type DriverDocumentType = 
  | 'ID_CARD' 
  | 'PROFILE_PICTURE' 
  | 'BULLETIN_N3' 
  | 'UTILITY_BILL' 
  | 'PATENT_NUMBER';

export type DriverDocumentStatus = 
  | 'PENDING_REVIEW' 
  | 'APPROVED' 
  | 'REJECTED';

export type DriverVerificationStatus = 
  | 'PENDING_DOCUMENTS' 
  | 'IN_REVIEW' 
  | 'REJECTED' 
  | 'APPROVED';

export type DriverDocumentState = 
  | 'MISSING' 
  | 'PENDING_REVIEW' 
  | 'APPROVED' 
  | 'REJECTED';

export type DriverDocumentDto = {
  type: DriverDocumentType;
  title: string;
  instructions: string;
  state: DriverDocumentState;
  imageUrl: string | null;
  rejectionReason: string | null;
  uploadedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
};

export type DriverVerificationSummaryDto = {
  driverId: number;
  status: DriverVerificationStatus;
  totalDocuments: number;
  submittedDocuments: number;
  approvedDocuments: number;
  documents: DriverDocumentDto[];
};
