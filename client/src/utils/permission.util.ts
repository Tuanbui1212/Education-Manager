import { getDecodedToken } from './auth';

export const checkPermission = () => {
  const currentUser = getDecodedToken();

  const userRole = currentUser?.role;
  const userPermissions = (userRole?.permissions as string[]) || [];

  const isSuperAdmin = userRole?.name?.toLowerCase() === 'super admin' || userPermissions.includes('*');

  const hasPermission = (permissionCode: string) => {
    if (!currentUser) return false;

    if (isSuperAdmin) return true;

    if (!userPermissions || userPermissions.length === 0) return false;

    return userPermissions.includes(permissionCode);
  };

  return { hasPermission, isSuperAdmin };
};
