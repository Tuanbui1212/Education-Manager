import { z } from 'zod';
import { AttendanceStatus, HomeworkStatus } from '../types/attendance.type';
import { Types } from 'mongoose';

export const UpsertAttendanceItemSchema = z.object({
    scheduleId: z.string().min(1, 'Ca học là bắt buộc').regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId').transform((val) => new Types.ObjectId(val)),
    studentId: z.string().min(1, 'Sinh viên là bắt buộc').regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId').transform((val) => new Types.ObjectId(val)),
    classId: z.string().min(1, 'Khóa học là bắt buộc').regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId').transform((val) => new Types.ObjectId(val)),
    homework: z.nativeEnum(HomeworkStatus).default(HomeworkStatus.NO_HOMEWORK),
    teacherComment: z.string().optional().default(''),
    status: z.nativeEnum(AttendanceStatus).default(AttendanceStatus.PRESENT),
});

export const UpsertAttendancesSchema = z.array(UpsertAttendanceItemSchema);

export const GetAttendanceByScheduleSchema = z.object({
    scheduleId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId'),
});

export const ScheduleStatsQuerySchema = z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).optional(),
    classId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId').optional(),
    shiftId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId').optional(),
});