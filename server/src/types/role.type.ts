import { Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  permissions: string[];
}

export interface GetRolesQuery {
  page?: number;
  limit?: number;
  search?: string;
}
