import { z } from "zod";

export const CreateCourseSchema = z.object({
    title: z.string({ message: 'Tiêu đề khóa học là bắt buộc' }).trim()
        .min(2, "Tiêu đề phải có ít nhất 2 ký tự")
        .max(150, "Tiêu đề không được quá 150 ký tự"),
    basePrice: z.number({ message: 'Giá khóa học là bắt buộc' })
        .min(1, "Giá khóa học phải lớn hơn 0"),
    syllabus: z.string({ message: 'Nội dung (syllabus) là bắt buộc' }).trim()
        .min(1, "Nội dung không được để trống"),
    totalLessons: z.number({ message: 'Số lượng bài học là bắt buộc' })
        .int("Số lượng bài học phải là số nguyên")
        .min(1, "Số lượng bài học phải lớn hơn 0"),
});

export const CourseIdSchema = z.object({
    id: z.string({ message: 'ID khóa học là bắt buộc' })
        .trim()
        .min(1, 'ID khóa học không được để trống')
        .regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId'),
});

export const UpdateCourseSchema = CreateCourseSchema.partial();

export type CreateCourseType = z.infer<typeof CreateCourseSchema>;
export type UpdateCourseType = z.infer<typeof UpdateCourseSchema>;
export type CourseIdType = z.infer<typeof CourseIdSchema>;
