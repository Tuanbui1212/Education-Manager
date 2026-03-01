export interface IShift {
  _id?: string;
  name: string;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
  createdAt: string;
  updatedAt: string;
}

export type ShiftStatus = 'ACTIVE' | 'INACTIVE';

export interface GetShiftsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ShiftStatus;
}

export interface IShiftData {
  _id?: string;
  name: string;
  startTime: string;
  endTime: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<IShiftData>) => void;
  initialData?: IShiftData | null;
}
