import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string({ message: 'Tên vai trò là bắt buộc' }).min(2, 'Tên quá ngắn'),
  permissions: z.array(z.string(), { message: 'Danh sách quyền phải là một mảng' }).default([]),
});

export const updateRoleSchema = z.object({
  name: z.string({ message: 'Tên vai trò là bắt buộc' }).min(2, 'Tên quá ngắn').optional(),
  permissions: z.array(z.string()).optional(),
});
