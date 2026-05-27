import { z } from "zod";
import { ClassStatus } from "../types/class.type";
import { Types } from "mongoose";

export const CreateClassSchema = z.object({
    name: z.string().trim().min(1, 'Tên lớp học là bắt buộc'),
    courseId: z.string({ message: 'ID khóa học là bắt buộc' }).trim().min(1, 'ID khóa học không được để trống')
        .regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId').transform((val) => new Types.ObjectId(val)),
    teacherId: z.string({ message: 'ID giáo viên là bắt buộc' }).trim().min(1, 'ID giáo viên không được để trống')
        .regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId').transform((val) => new Types.ObjectId(val)),
    roomId: z.string().trim()
        .regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId').transform((val) => new Types.ObjectId(val)).optional(),
    documents: z.array(z.string())
        .transform((val) => [...new Set(val)]).optional(),
    studentIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId'))
        .transform((val) => [...new Set(val)]).transform((val) => val.map(id => new Types.ObjectId(id))).optional(),
    status: z.enum(ClassStatus, { message: 'Trạng thái không hợp lệ' }).default(ClassStatus.ACTIVE),
    startDate: z.string().optional(),
    totalLessons: z.number({ message: 'Số lượng bài học là bắt buộc' })
        .int('Số lượng bài học phải là số nguyên')
        .min(1, 'Số lượng bài học phải lớn hơn 0'),
    lessonsPerWeek: z.number().min(1, 'Số lượng bài học mỗi tuần phải lớn hơn 0').int('Số lượng bài học mỗi tuần phải là số nguyên'),
    maxNumberOfStudents: z.number().min(1, 'Số lượng học viên tối đa phải lớn hơn 0').int('Số lượng học viên tối đa phải là số nguyên'),
    optionalRequirements: z.array(z.string()).optional(),
}).refine((data) => data.lessonsPerWeek <= data.totalLessons, {
    message: 'Số lượng bài học mỗi tuần không được vượt quá tổng số bài học',
    path: ['lessonsPerWeek'],
});

export const UpdateClassSchema = z.object({
    name: z.string().trim().min(1, 'Tên lớp học là bắt buộc').optional(),
    courseId: z.string({ message: 'ID khóa học là bắt buộc' }).trim().min(1, 'ID khóa học không được để trống')
        .regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId').transform((val) => new Types.ObjectId(val)).optional(),
    teacherId: z.string({ message: 'ID giáo viên là bắt buộc' }).trim().min(1, 'ID giáo viên không được để trống')
        .regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId').transform((val) => new Types.ObjectId(val)).optional(),
    roomId: z.string().trim()
        .regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId').transform((val) => new Types.ObjectId(val)).optional(),
    documents: z.array(z.string())
        .transform((val) => [...new Set(val)]).optional(),
    studentIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId'))
        .transform((val) => [...new Set(val)]).transform((val) => val.map(id => new Types.ObjectId(id))).optional(),
    status: z.enum(ClassStatus, { message: 'Trạng thái không hợp lệ' }).default(ClassStatus.ACTIVE),
    startDate: z.string().optional(),
    totalLessons: z.number({ message: 'Số lượng bài học là bắt buộc' })
        .int('Số lượng bài học phải là số nguyên')
        .min(1, 'Số lượng bài học phải lớn hơn 0').optional(),
    lessonsPerWeek: z.number().min(1, 'Số lượng bài học mỗi tuần phải lớn hơn 0').int('Số lượng bài học mỗi tuần phải là số nguyên').optional(),
    maxNumberOfStudents: z.number().min(1, 'Số lượng học viên tối đa phải lớn hơn 0').int('Số lượng học viên tối đa phải là số nguyên').optional(),
    optionalRequirements: z.array(z.string()).optional(),
}).refine((data) => {
    if (data.lessonsPerWeek && data.totalLessons && data.lessonsPerWeek > data.totalLessons) {
        return false;
    }
    return true;
}, {
    message: 'Số lượng bài học mỗi tuần không được vượt quá tổng số bài học',
    path: ['lessonsPerWeek'],
});

export const ClassIdSchema = z.object({
    id: z.string({ message: 'ID lớp học là bắt buộc' }).trim().min(1, 'ID lớp học không được để trống')
        .regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId'),
});

export type CreateClassType = z.infer<typeof CreateClassSchema>;
export type UpdateClassType = z.infer<typeof UpdateClassSchema>;
export type ClassIdType = z.infer<typeof ClassIdSchema>;