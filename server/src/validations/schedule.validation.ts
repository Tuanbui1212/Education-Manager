import { z } from "zod";
import { Types } from "mongoose";

export const CreateScheduleSchema = z.object({
    classId: z.string({ message: 'ID lớp học là bắt buộc' }).trim().min(1, 'ID lớp học không được để trống')
        .regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId').transform((val) => new Types.ObjectId(val)),
    shiftId: z.string({ message: 'ID ca học là bắt buộc' }).trim().min(1, 'ID ca học không được để trống')
        .regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId').transform((val) => new Types.ObjectId(val)),
    roomId: z.string().trim()
        .regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId').transform((val) => new Types.ObjectId(val)).optional(),
    teacherId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId').transform((val) => new Types.ObjectId(val)).optional(),
    date: z.coerce.date({ message: 'Ngày không hợp lệ' }),
    attendances: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId'))
        .transform((val) => [...new Set(val)]).transform((val) => val.map(id => new Types.ObjectId(id))).optional(),
});

export const UpdateScheduleSchema = CreateScheduleSchema.partial();

export const ScheduleIdSchema = z.object({
    id: z.string({ message: 'ID lịch học là bắt buộc' }).trim().min(1, 'ID lịch học không được để trống')
        .regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId'),
});

export const GetSchedulesSchema = z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).optional(),
    classId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId').optional(),
    roomId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId').optional(),
    teacherId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId').optional(),
});
export type CreateScheduleType = z.infer<typeof CreateScheduleSchema>;
export type UpdateScheduleType = z.infer<typeof UpdateScheduleSchema>;
export type ScheduleIdType = z.infer<typeof ScheduleIdSchema>;