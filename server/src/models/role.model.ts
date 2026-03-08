import mongoose, { Schema } from 'mongoose';
import { IRole } from '../types/role.type';

const RoleSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model<IRole>('Role', RoleSchema, 'roles');
