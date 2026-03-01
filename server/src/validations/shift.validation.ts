import { z } from 'zod';
import { ShiftStatus } from '../types/shift.type';

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const CreateShiftSchema = z.object({
  name: z
    .string({ message: 'Tên ca phải là một chuỗi và không được để trống' })
    .min(1, 'Tên ca không được để trống')
    .trim(),
  startTime: z
    .string({ message: 'Thời gian bắt đầu phải là một chuỗi và không được để trống' })
    .regex(timeRegex, 'Định dạng startTime không hợp lệ (HH:mm)')
    .trim(),
  endTime: z
    .string({ message: 'Thời gian kết thúc phải là một chuỗi và không được để trống' })
    .regex(timeRegex, 'Định dạng endTime không hợp lệ (HH:mm)')
    .trim(),
  status: z.enum(Object.values(ShiftStatus)).optional(),
});
export const UpdateShiftSchema = CreateShiftSchema.partial();
