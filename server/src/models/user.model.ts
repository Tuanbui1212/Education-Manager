import mongoose, { Schema } from 'mongoose';
import { IUser, UserRole, UserStatus } from '../types/user.type';

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STUDENT,
    },

    student_info: {
      parentsName: { type: String },
      crmHistory: [{ type: String }],
      consultantId: { type: Schema.Types.ObjectId, ref: 'User' },
    },

    teacher_info: {
      hourlyRate: { type: Number },
      degrees: [{ type: String }],
    },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);
