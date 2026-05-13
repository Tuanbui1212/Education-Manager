import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const initScheduleRequestSchema = z.object({
  classIds: z
    .array(z.string().regex(objectIdRegex, 'classId phải là một MongoDB ObjectId hợp lệ'))
    .min(1, 'Phải truyền lên ít nhất 1 classId để khởi tạo xếp lịch'),
});

export const updatePreferenceSchema = z.object({
  requestId: z.string().regex(objectIdRegex, 'requestId không hợp lệ'),
  classId: z.string().regex(objectIdRegex, 'classId không hợp lệ'),
  prefs: z.array(z.string()),
});

export const requestIdParamSchema = z.object({
  requestId: z.string().regex(objectIdRegex, 'requestId không hợp lệ'),
});
