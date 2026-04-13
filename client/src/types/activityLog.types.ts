export type ActivityAction =
  | 'CREATE_USER'
  | 'UPDATE_USER'
  | 'DELETE_USER'
  | 'CREATE_ROLE'
  | 'UPDATE_ROLE'
  | 'DELETE_ROLE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'CHANGE_PASSWORD'
  | 'ASSIGN_ROLE';

export interface IActivityLog {
  _id: string;
  actorId: {
    _id: string;
    fullName: string;
    email: string;
  };
  action: ActivityAction;
  targetType: 'User' | 'Role' | 'System';
  targetName?: string;
  description: string;
  ipAddress?: string;
  createdAt: string;
}
