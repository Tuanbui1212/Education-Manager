import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import RoleModel from '../models/role.model';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Không tìm thấy mã xác thực!' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Mã xác thực không hợp lệ hoặc đã hết hạn!' });
  }
};

export const requirePermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?._id || (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Chưa xác thực người dùng!' });
      }

      const user = await UserModel.findById(userId).populate('roleId');

      if (!user || !user.roleId) {
        return res.status(403).json({ success: false, message: 'Người dùng không có vai trò hợp lệ!' });
      }

      const userRole = user.roleId as any;

      if (userRole.name === 'ADMIN' || userRole.permissions.includes('*')) {
        return next();
      }

      if (!userRole.permissions.includes(requiredPermission)) {
        return res.status(403).json({
          success: false,
          message: `Bạn không có quyền thực hiện hành động này. Cần quyền: [${requiredPermission}]`,
        });
      }

      next();
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Lỗi máy chủ khi kiểm tra quyền!' });
    }
  };
};
