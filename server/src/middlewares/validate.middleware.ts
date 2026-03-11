import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate =
  (schema: ZodSchema, source: "body" | "params" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req[source]);
      req[source] = validatedData
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Dữ liệu đầu vào không hợp lệ",
          errors: error.flatten().fieldErrors,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi kiểm tra dữ liệu",
      });
    }
  };
