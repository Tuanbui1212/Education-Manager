// middleware/logIp.middleware.ts
import { Request, Response, NextFunction } from 'express';

export const logIpMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || req.ip;

  console.log(`[IP] ${ip} - ${req.method} ${req.originalUrl}`);

  next();
};
