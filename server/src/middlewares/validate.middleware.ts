import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu đầu vào không hợp lệ',
        errors: error.flatten().fieldErrors,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi kiểm tra dữ liệu',
    });
  }
};
