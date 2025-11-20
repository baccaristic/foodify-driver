import { LucideIcon } from 'lucide-react-native';
import type { DriverDocumentType } from './driver';

export type UploadField = {
  key: string;
  label: string;
};

export type UploadStep = {
  id: number;
  title: string;
  description: string;
  type: 'text' | 'single-image' | 'dual-image';
  icon: LucideIcon;
  uploadFields?: UploadField[];
  status: 'check' | 'pending' | 'upload';
  documentType: DriverDocumentType;
  rejectionReason?: string;
};

/**
 * Map document type to API-friendly format
 */
export const mapDocumentTypeToApi = (documentType: DriverDocumentType): string => {
  const typeMap: Record<DriverDocumentType, string> = {
    ID_CARD: 'ID_CARD',
    PROFILE_PICTURE: 'picture',
    BULLETIN_N3: 'bulletin-3',
    UTILITY_BILL: 'electricity-bill',
    PATENT_NUMBER: 'PATENT_NUMBER',
  };
  
  return typeMap[documentType] || documentType;
};
