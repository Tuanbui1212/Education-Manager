// src/models/user.model.ts
import mongoose, { Schema } from "mongoose";
import { IUser, UserRole } from "../types/user.type";

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STUDENT,
    },
    // Thông tin riêng cho học viên
    student_info: {
      parentsName: { type: String },
      crmHistory: [{ type: String }],
      consultantId: { type: Schema.Types.ObjectId, ref: "User" }, // Link tới nhân viên Sale
    },
    // Thông tin riêng cho giáo viên
    teacher_info: {
      hourlyRate: { type: Number },
      degrees: [{ type: String }],
    },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model<IUser>("User", UserSchema);
