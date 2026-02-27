import { Document } from "mongoose";

export interface IShift extends Document {
  name: string;
  startTime: string;
  endTime: string;
}
