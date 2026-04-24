import mongoose from 'mongoose';
import { CreateExamType, UpdateExamType } from '../validations/exam.validation';
import { ExamModel } from '../models/exam.model';
import { ExamSubmissionModel } from '../models/examSubmission.model';
import { ExamSubmissionStatus } from '../types/examSubmission.type';
import { ExamStatus } from '../types/exam.type';
import { getIO, userSocketMap } from '../lib/socket';
import { ClassModel } from '../models/class.model';
import { AttendanceNotificationModel } from '../models/attendanceNotification.model';

export class ExamService {

    async getExams(query: {
        classId?: string;
        search?: string;
        page?: number;
        limit?: number;
        teacherId?: string;
        excludeClassId?: string;
    }) {
        const { classId, search, page = 1, limit = 10, teacherId, excludeClassId } = query;
        const filter: Record<string, any> = {};

        if (classId) filter.classId = new mongoose.Types.ObjectId(classId);
        if (teacherId) filter.teacherId = new mongoose.Types.ObjectId(teacherId);
        if (excludeClassId) filter.classId = { $ne: new mongoose.Types.ObjectId(excludeClassId) };
        if (search) filter.title = { $regex: search, $options: 'i' };

        const skip = (page - 1) * limit;
        const [exams, total] = await Promise.all([
            ExamModel.find(filter)
                .populate('classId', 'name')
                .populate('teacherId', 'fullName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ExamModel.countDocuments(filter),
        ]);

        return { exams, total };
    }

    async getExamsByStudentClasses(classIds: string[], studentId: string) {
        const filter = { classId: { $in: classIds.map(id => new mongoose.Types.ObjectId(id)) }, status: ExamStatus.PUBLISHED, startDate: { $lte: new Date() } };
        const data = await ExamModel.aggregate([
            {
                $match: filter,
            },
            {
                $lookup: {
                    from: 'classes',
                    localField: 'classId',
                    foreignField: '_id',
                    as: 'classId',
                },
            },
            {
                $unwind: '$classId',
            },
            {
                $lookup: {
                    from: 'examsubmissions',
                    localField: '_id',
                    foreignField: 'examId',
                    as: 'submissions',
                    pipeline: [
                        {
                            $match: {
                                studentId: new mongoose.Types.ObjectId(studentId),
                            },
                        },
                    ],
                },
            },
            {
                $unwind: {
                    path: '$submissions',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    totalPoints: 1,
                    totalTime: 1,
                    duration: 1,
                    startDate: 1,
                    endDate: 1,
                    status: 1,
                    teacherId: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    classId: {
                        _id: 1,
                        name: 1,
                    },
                    submissions: {
                        _id: 1,
                        status: 1,
                    },
                    questions: 1,
                },
            },
            {
                $sort: { endDate: 1 },
            },
        ]);

        return data;
    }

    async getExamById(id: string) {
        return ExamModel.findById(id)
            .populate('classId', 'name')
            .populate('teacherId', 'fullName')
            .lean();
    }

    async createExam(data: CreateExamType) {
        const exam = await ExamModel.create(data);
        const classes = await ClassModel.findById(data.classId);
        if (!classes) throw new Error('Không tìm thấy lớp học');
        const notifications = classes.studentIds.map(studentId => {
            return ({
                userId: studentId,
                title: `Lớp ${classes.name} có bài kiểm tra mới`,
                content: `${exam.title} ${exam.description ? `- ${exam.description}` : ''}`,
                examId: exam._id,
                isRead: false
            })
        })
        const savedNotifs = await AttendanceNotificationModel.insertMany(notifications);
        const io = getIO();
        savedNotifs.forEach(notif => {
            const socketId = userSocketMap.get(notif.userId.toString());
            if (socketId) {
                io.to(socketId).emit('new_notification', notif.toObject());
            }
        });
        return exam;
    }
    async updateExam(id: string, data: UpdateExamType) {
        return ExamModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
    }

    async deleteExam(id: string) {
        try {
            await ExamSubmissionModel.deleteMany({ examId: id });
            return ExamModel.findByIdAndDelete(id).lean();
        } catch (error) {
            throw new Error('Không thể xóa bài kiểm tra');
        }
    }

    async copyExam(sourceId: string, targetClassId: mongoose.Types.ObjectId, teacherId: mongoose.Types.ObjectId) {
        const source = await ExamModel.findById(sourceId).lean();
        if (!source) throw new Error('Không tìm thấy bài kiểm tra nguồn');

        const { _id, createdAt, updatedAt, ...rest } = source as any;
        const newExam = await ExamModel.create({
            ...rest,
            classId: targetClassId,
            teacherId,
            status: 'DRAFT',
        });
        return newExam;
    }

    async startSubmission(examId: string, studentId: string, classId: string) {
        const exam = await ExamModel.findById(examId).lean();
        if (!exam) throw new Error('Không tìm thấy bài kiểm tra');

        const existing = await ExamSubmissionModel.findOne({ examId, studentId });
        if (existing) return existing;

        return ExamSubmissionModel.create({
            examId,
            studentId,
            classId,
            startedAt: new Date(),
            status: 'IN_PROGRESS',
        });
    }

    async submitSubmission(
        submissionId: string,
        answers: { questionId: mongoose.Types.ObjectId; selectedOptionIds: mongoose.Types.ObjectId[] }[]
    ) {
        const submission = await ExamSubmissionModel.findById(submissionId);
        if (!submission) throw new Error('Không tìm thấy bài làm');
        if (submission.status === 'SUBMITTED') throw new Error('Bài làm đã được nộp trước đó');

        const exam = await ExamModel.findById(submission.examId).lean() as any;
        if (!exam) throw new Error('Không tìm thấy bài kiểm tra');

        let score = 0;
        for (const question of exam.questions) {
            const studentAnswer = answers.find(
                a => a.questionId.toString() === question._id.toString()
            );
            if (!studentAnswer) continue;

            const correctIds = question.options
                .filter((o: any) => o.isCorrect)
                .map((o: any) => o._id.toString());
            const selectedIds = studentAnswer.selectedOptionIds.map((id: any) => id.toString());

            const allCorrect =
                correctIds.length === selectedIds.length &&
                correctIds.every((id: string) => selectedIds.includes(id));

            if (allCorrect) score += question.points;
        }

        const completedAt = new Date();
        const timeTaken = Math.floor((completedAt.getTime() - new Date(submission.startedAt).getTime()) / 1000);

        submission.answers = answers as any;
        submission.score = score;
        submission.completedAt = completedAt;
        submission.timeTaken = timeTaken;
        submission.status = ExamSubmissionStatus.SUBMITTED;

        await submission.save();
        return submission;
    }

    async getSubmission(examId: string, studentId: string) {
        return ExamSubmissionModel.findOne({ examId, studentId }).lean();
    }

    async getActiveSubmission(studentId: string) {
        return ExamSubmissionModel.findOne({ studentId, status: ExamSubmissionStatus.IN_PROGRESS }).lean();
    }

    async getExamSubmissions(examId: string) {
        return ExamSubmissionModel.find({ examId })
            .populate('studentId', 'fullName email')
            .sort({ completedAt: -1 })
            .lean();
    }
}
