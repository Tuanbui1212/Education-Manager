import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Không tìm thấy mã xác thực!' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Mã xác thực không hợp lệ hoặc đã hết hạn Token!' });
  }
};

export const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Chỉ ADMIN mới có quyền này!' });
  }
  next();
};
