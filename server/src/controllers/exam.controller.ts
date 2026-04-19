import { Request, Response } from 'express';
import { ExamService } from '../services/exam.service';
import {
    CreateExamType,
    UpdateExamType,
    CopyExamType,
    SubmitSubmissionType,
} from '../validations/exam.validation';

export class ExamController {
    private examService = new ExamService();

    // [GET] /api/exams
    getAll = async (req: Request, res: Response) => {
        try {
            const { classId, search, page, limit, teacherId, excludeClassId } = req.query as any;
            const { exams, total } = await this.examService.getExams({
                classId, search, teacherId, excludeClassId,
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 10,
            });
            res.status(200).json({ success: true, data: exams, total, message: 'Lấy danh sách bài kiểm tra thành công' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    // [GET] /api/exams/by-classes
    getByClasses = async (req: Request, res: Response) => {
        try {
            const { classIds, studentId } = req.query as { classIds: string, studentId: string };
            const ids = classIds ? classIds.split(',') : [];
            const exams = await this.examService.getExamsByStudentClasses(ids, studentId);
            res.status(200).json({ success: true, data: exams, message: 'Lấy bài kiểm tra thành công' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    // [GET] /api/exams/:id
    getOne = async (req: Request<{ id: string }>, res: Response) => {
        try {
            const exam = await this.examService.getExamById(req.params.id);
            if (!exam) return res.status(404).json({ success: false, message: 'Không tìm thấy bài kiểm tra' });
            res.status(200).json({ success: true, data: exam });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    // [POST] /api/exams
    create = async (req: Request<{}, {}, CreateExamType>, res: Response) => {
        try {
            const exam = await this.examService.createExam(req.body);
            res.status(201).json({ success: true, data: exam, message: 'Tạo bài kiểm tra thành công' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    // [PUT] /api/exams/:id
    update = async (req: Request<{ id: string }, {}, UpdateExamType>, res: Response) => {
        try {
            const exam = await this.examService.updateExam(req.params.id, req.body);
            if (!exam) return res.status(404).json({ success: false, message: 'Không tìm thấy bài kiểm tra' });
            res.status(200).json({ success: true, data: exam, message: 'Cập nhật bài kiểm tra thành công' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    // [DELETE] /api/exams/:id
    delete = async (req: Request<{ id: string }>, res: Response) => {
        try {
            await this.examService.deleteExam(req.params.id);
            res.status(200).json({ success: true, message: 'Xóa bài kiểm tra thành công' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    // [POST] /api/exams/:id/copy
    copy = async (req: Request<{ id: string }, {}, CopyExamType>, res: Response) => {
        try {
            const { targetClassId } = req.body;
            // teacherId comes from JWT token attached by auth middleware
            const teacherId = (req as any).user?.id;
            const { Types } = await import('mongoose');
            const exam = await this.examService.copyExam(
                req.params.id,
                targetClassId as any,
                new Types.ObjectId(teacherId)
            );
            res.status(201).json({ success: true, data: exam, message: 'Sao chép bài kiểm tra thành công' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    // [POST] /api/exams/submissions/start
    startSubmission = async (req: Request, res: Response) => {
        try {
            const { examId, studentId, classId } = req.body;
            const submission = await this.examService.startSubmission(examId, studentId, classId);
            res.status(201).json({ success: true, data: submission, message: 'Bắt đầu làm bài thành công' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    // [PUT] /api/exams/submissions/:id/submit
    submitSubmission = async (req: Request<{ id: string }, {}, SubmitSubmissionType>, res: Response) => {
        try {
            const submission = await this.examService.submitSubmission(req.params.id, req.body.answers as any);
            res.status(200).json({ success: true, data: submission, message: 'Nộp bài thành công' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    // [GET] /api/exams/submissions?examId=&studentId=
    getSubmission = async (req: Request, res: Response) => {
        try {
            const { examId, studentId } = req.query as any;
            const submission = await this.examService.getSubmission(examId, studentId);
            res.status(200).json({ success: true, data: submission });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    // [GET] /api/exams/submissions/active
    getActiveSubmission = async (req: Request, res: Response) => {
        try {
            // Get student ID from token
            const studentId = (req as any).user?.id;
            const submission = await this.examService.getActiveSubmission(studentId);
            res.status(200).json({ success: true, data: submission });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    // [GET] /api/exams/:id/submissions (teacher view all submissions)
    getExamSubmissions = async (req: Request<{ id: string }>, res: Response) => {
        try {
            const submissions = await this.examService.getExamSubmissions(req.params.id);
            res.status(200).json({ success: true, data: submissions });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
}
