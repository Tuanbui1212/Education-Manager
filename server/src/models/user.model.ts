import mongoose, { Schema } from 'mongoose';
import { IUser, UserStatus } from '../types/user.type';

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },

    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
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

    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);
