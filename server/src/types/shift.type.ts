import { Document } from 'mongoose';

export enum ShiftStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}
export interface IShift extends Document {
  name: string;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
}
