import { LucideIcon } from 'lucide-react-native';

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
};
