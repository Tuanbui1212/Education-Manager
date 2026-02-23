import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { formatZodError } from '../lib/formatZodError';
import { ZodValidationError } from '../types/error.type';
export const validate =
  (schema: ZodSchema, target: 'body' | 'params' | 'query' = 'body') =>
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const validatedData = schema.safeParse(req[target]);
        formatZodError(validatedData);
        req[target] = validatedData.data;
        next();
      } catch (error) {
        if (error instanceof ZodValidationError) {
          return res.status(400).json({
            success: false,
            message: 'Dữ liệu đầu vào không hợp lệ',
            errors: error.errors,
          });
        }

        return res.status(500).json({
          success: false,
          message: 'Lỗi hệ thống khi kiểm tra dữ liệu',
        });
      }
    };