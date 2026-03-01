import { Document } from "mongoose";

export enum RoomType {
  ACTIVE = "ACTIVE",
  MAINTENANCE = "MAINTENANCE",
  INACTIVE = "INACTIVE",
}

export interface IRoom extends Document {
  name: string;
  capacity: number;
  status: RoomType;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetRoomsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: RoomType;
}
