import { Document, Types } from 'mongoose';

export interface IClassPreference {
  classId: Types.ObjectId | string;
  optionalRequirements: string[];
}

export interface IScheduleRequest extends Document {
  classes: IClassPreference[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}
