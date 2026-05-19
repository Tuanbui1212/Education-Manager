import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { ClassModel } from '../models/class.model';

const getUserId = (req: Request): string | null => {
  return (req as any).user?._id || (req as any).user?.id || null;
};

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Không tìm thấy mã xác thực!',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);

    (req as any).user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Mã xác thực không hợp lệ hoặc đã hết hạn!',
    });
  }
};

export const requirePermission = (...requiredPermissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Chưa xác thực người dùng!',
        });
      }

      const user = await UserModel.findById(userId).populate('roleId');

      if (!user || !user.roleId) {
        return res.status(403).json({
          success: false,
          message: 'Người dùng không có vai trò hợp lệ!',
        });
      }

      const userRole = user.roleId as any;

      // ADMIN hoặc * => full quyền
      if (userRole.name === 'ADMIN' || userRole.permissions.includes('*')) {
        return next();
      }

      // Chỉ cần có 1 trong các quyền
      const hasPermission = requiredPermissions.some((permission) => userRole.permissions.includes(permission));

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Bạn không có quyền thực hiện hành động này!`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi kiểm tra quyền!',
      });
    }
  };
};

export const requireTeacherForAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Chưa xác thực người dùng!',
      });
    }

    const classId = req.params.classId;

    const classData = await ClassModel.findById(classId);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lớp học!',
      });
    }

    if (classData.teacherId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không phải giáo viên phụ trách lớp này!',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi kiểm tra quyền!',
    });
  }
};
