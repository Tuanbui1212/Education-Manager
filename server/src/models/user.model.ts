import mongoose, { Schema } from 'mongoose';
import { IUser, UserStatus, TeacherType, Gender } from '../types/user.type';

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, trim: true },
    gender: { type: String, enum: Object.values(Gender), default: Gender.OTHER },
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

    degrees: [{ type: String }],
    certificates: [{ type: String }],
    baseSalary: { type: Number, default: 0 },
    bankInfo: {
      bankName: { type: String, default: '' },
      bankBin: { type: String, default: '' },
      accountNo: { type: String, default: '' },
      accountName: { type: String, default: '' },
    },

    student_info: {
      parentsName: { type: String },
      crmHistory: [{ type: String }],
      consultantId: { type: Schema.Types.ObjectId, ref: 'User' },
    },

    teacher_info: {
      type: {
        type: String,
        enum: Object.values(TeacherType),
        default: TeacherType.PART_TIME,
      },
      hourlyRate: { type: Number, default: 0 },
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
