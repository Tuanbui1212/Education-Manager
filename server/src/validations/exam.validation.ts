import { z } from 'zod';
import { Types } from 'mongoose';
import { ExamStatus } from '../types/exam.type';

const objectId = (label: string) =>
    z.string({ message: `${label} là bắt buộc` })
        .regex(/^[0-9a-fA-F]{24}$/, `${label} không đúng định dạng ObjectId`)
        .transform(val => new Types.ObjectId(val));

const OptionSchema = z.object({
    content: z.string().trim().min(1, 'Nội dung đáp án không được để trống'),
    isCorrect: z.boolean().default(false),
});

const QuestionSchema = z.object({
    content: z.string().trim().min(1, 'Nội dung câu hỏi không được để trống'),
    points: z.number().positive('Điểm phải lớn hơn 0').default(1),
    options: z
        .array(OptionSchema)
        .min(1, 'Mỗi câu hỏi phải có ít nhất 1 đáp án')
        .max(10, 'Mỗi câu hỏi không được có quá 10 đáp án')
        .refine(opts => opts.some(o => o.isCorrect), {
            message: 'Mỗi câu hỏi phải có ít nhất 1 đáp án đúng',
        }),
});

export const CreateExamSchema = z.object({
    title: z.string().trim().min(1, 'Tiêu đề bài kiểm tra là bắt buộc'),
    description: z.string().trim().optional(),
    classId: objectId('ID lớp học'),
    teacherId: objectId('ID giáo viên'),
    startDate: z.coerce.date({ message: 'Ngày bắt đầu không hợp lệ' }),
    endDate: z.coerce.date({ message: 'Ngày kết thúc không hợp lệ' }),
    duration: z
        .number({ message: 'Thời gian làm bài là bắt buộc' })
        .positive('Thời gian làm bài phải lớn hơn 0').min(1, 'Thời gian làm bài tối thiểu 1 phút'),
    questions: z.array(QuestionSchema).optional().default([]),
    status: z.nativeEnum(ExamStatus, { message: 'Trạng thái không hợp lệ' }).default(ExamStatus.DRAFT),
}).refine(data => data.endDate > data.startDate, {
    message: 'Ngày kết thúc phải sau ngày bắt đầu',
    path: ['endDate'],
});

export const UpdateExamSchema = z.object({
    title: z.string().trim().min(1).optional(),
    description: z.string().trim().optional(),
    classId: objectId('ID lớp học').optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    duration: z.number().positive().min(1, 'Thời gian làm bài tối thiểu 1 phút').optional(),
    questions: z.array(QuestionSchema).optional(),
    status: z.nativeEnum(ExamStatus).optional(),
}).refine(data => {
    if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
    }
    return true;
}, {
    message: 'Ngày kết thúc phải sau ngày bắt đầu',
    path: ['endDate'],
});

export const ExamIdSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID bài kiểm tra không đúng định dạng'),
});
export const CopyExamSchema = z.object({
    targetClassId: objectId('ID lớp học đích'),
});

export const StartSubmissionSchema = z.object({
    examId: z.string({ message: 'ID bài kiểm tra là bắt buộc' }).trim().min(1, 'ID bài kiểm tra không được để trống')
        .regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId').transform((val) => new Types.ObjectId(val)),
    studentId: z.string({ message: 'ID học sinh là bắt buộc' }).trim().min(1, 'ID học sinh không được để trống')
        .regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId').transform((val) => new Types.ObjectId(val)),
    classId: z.string({ message: 'ID lớp học là bắt buộc' }).trim().min(1, 'ID lớp học không được để trống')
        .regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId').transform((val) => new Types.ObjectId(val)),
});

const StudentAnswerSchema = z.object({
    questionId: objectId('ID câu hỏi'),
    selectedOptionIds: z.array(
        z.string().regex(/^[0-9a-fA-F]{24}$/).transform(v => new Types.ObjectId(v))
    ),
});

export const SubmitSubmissionSchema = z.object({
    answers: z.array(StudentAnswerSchema),
});

export type CreateExamType = z.infer<typeof CreateExamSchema>;
export type UpdateExamType = z.infer<typeof UpdateExamSchema>;
export type ExamIdType = z.infer<typeof ExamIdSchema>;
export type CopyExamType = z.infer<typeof CopyExamSchema>;
export type StartSubmissionType = z.infer<typeof StartSubmissionSchema>;
export type SubmitSubmissionType = z.infer<typeof SubmitSubmissionSchema>;
