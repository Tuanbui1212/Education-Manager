import { z } from 'zod';
import { AttendanceStatus, HomeworkStatus } from '../types/attendance.type';
import { Types } from 'mongoose';

export const UpsertAttendanceItemSchema = z.object({
    scheduleId: z.string().min(1, 'Ca học là bắt buộc').regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId').transform((val) => new Types.ObjectId(val)),
    studentId: z.string().min(1, 'Sinh viên là bắt buộc').regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId').transform((val) => new Types.ObjectId(val)),
    classId: z.string().min(1, 'Khóa học là bắt buộc').regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId').transform((val) => new Types.ObjectId(val)),
    homework: z.nativeEnum(HomeworkStatus).default(HomeworkStatus.NO_HOMEWORK),
    teacherComment: z.string().optional().default(''),
    mark: z.number().min(0, 'Điểm không được âm').max(10, 'Điểm không được vượt quá 10').optional(),
    status: z.nativeEnum(AttendanceStatus).default(AttendanceStatus.PRESENT),
});

export const UpsertAttendancesSchema = z.array(UpsertAttendanceItemSchema);

export const GetActiveClassesQuerySchema = z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).optional(),
    search: z.string().trim().optional(),
});

export const GetSchedulesByClassParamsSchema = z.object({
    classId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId'),
});

export const GetSchedulesByClassQuerySchema = z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).optional(),
});

export const GetAttendanceListParamsSchema = z.object({
    classId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId'),
    scheduleId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId'),
});

export const GetAttendanceListQuerySchema = z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).optional(),
});