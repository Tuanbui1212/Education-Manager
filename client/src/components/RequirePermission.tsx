// import React from 'react';
// import { checkPermission } from '../utils/permission.util';

// interface RequirePermissionProps {
//   required: string;
//   children: React.ReactNode;
// }

// const RequirePermission: React.FC<RequirePermissionProps> = ({ required, children }) => {
//   const { hasPermission } = checkPermission();

//   if (hasPermission(required)) {
//     return <>{children}</>;
//   }

//   return null;
// };

// export default RequirePermission;

import React from 'react';
import { checkPermission } from '../utils/permission.util';

interface RequirePermissionProps {
  required: string | string[];
  children: React.ReactNode;
}

const RequirePermission: React.FC<RequirePermissionProps> = ({ required, children }) => {
  const { hasPermission } = checkPermission();

  const permissions = Array.isArray(required) ? required : [required];

  const allowed = permissions.some((permission) => hasPermission(permission));

  if (!allowed) return null;

  return <>{children}</>;
};

export default RequirePermission;
