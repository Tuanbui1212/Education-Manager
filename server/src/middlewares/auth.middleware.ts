import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  console.log('Bat dau kiem mat token trong header:', req.headers.authorization);
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access Denied!' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid Token!' });
  }
};

export const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
  console.log('Bat dau kiem tra quyen ADMIN trong token:', req.headers.authorization);
  if ((req as any).user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Chỉ ADMIN mới có quyền này!' });
  }
  next();
};
