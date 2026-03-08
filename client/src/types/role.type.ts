export interface IRole {
  _id: string;
  name: string;
  permissions: string[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleResponse {
  success: boolean;
  message: string;
  data: IRole[];
  total?: number;
}

export interface SingleRoleResponse {
  success: boolean;
  message: string;
  data: IRole;
}

export interface GetRolesParams {
  page?: number;
  limit?: number;
}
