import { z } from 'zod';

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const CreateShiftSchema = z.object({
  name: z.string().min(1, 'Tên ca không được để trống').trim().nonempty('Tên ca là bắt buộc'),
  startTime: z
    .string()
    .regex(timeRegex, 'Định dạng startTime không hợp lệ (HH:mm)')
    .trim()
    .nonempty('Thời gian bắt đầu là bắt buộc'),
  endTime: z
    .string()
    .regex(timeRegex, 'Định dạng endTime không hợp lệ (HH:mm)')
    .trim()
    .nonempty('Thời gian kết thúc là bắt buộc'),
});
export const UpdateShiftSchema = CreateShiftSchema.partial();
