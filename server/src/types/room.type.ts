import { Document } from "mongoose";

export interface IRoom extends Document {
  name: string;
  capacity: number;
  status: "ACTIVE" | "MAINTENANCE";
  createdAt: Date;
  updatedAt: Date;
}
