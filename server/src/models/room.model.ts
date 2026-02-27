import mongoose, { Schema } from 'mongoose';
import { IRoom } from '../types/room.type';
import { RoomType } from '../types/room.type';

const RoomSchema = new Schema<IRoom>(
  {
    name: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: Object.values(RoomType),
      default: RoomType.ACTIVE,
    },
  },
  { timestamps: true },
);

export const RoomModel = mongoose.model<IRoom>('Room', RoomSchema);
