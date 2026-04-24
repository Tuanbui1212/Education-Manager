import type { IExam, IExamSubmission } from '../types/exam.type';
import axios from './axiosClient';

export const examService = {
    getExams: async (params?: {
        classId?: string;
        teacherId?: string;
        excludeClassId?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{ success: boolean; data: IExam[]; total: number }> => {
        const res = await axios.get('/exams', { params });
        return res.data;
    },

    getExamsByClasses: async (classIds: string[], studentId: string): Promise<{ success: boolean; data: IExam[] }> => {
        const res = await axios.get('/exams/by-classes', { params: { classIds: classIds.join(','), studentId } });
        return res.data;
    },

    getExamById: async (id: string): Promise<{ success: boolean; data: IExam }> => {
        const res = await axios.get(`/exams/${id}`);
        return res.data;
    },

    createExam: async (data: Partial<IExam>): Promise<{ success: boolean; data: IExam; message: string }> => {
        const res = await axios.post('/exams', data);
        return res.data;
    },

    updateExam: async (id: string, data: Partial<IExam>): Promise<{ success: boolean; data: IExam; message: string }> => {
        const res = await axios.put(`/exams/${id}`, data);
        return res.data;
    },

    deleteExam: async (id: string): Promise<{ success: boolean; message: string }> => {
        const res = await axios.delete(`/exams/${id}`);
        return res.data;
    },

    copyExam: async (sourceId: string, targetClassId: string): Promise<{ success: boolean; data: IExam; message: string }> => {
        const res = await axios.post(`/exams/${sourceId}/copy`, { targetClassId });
        return res.data;
    },

    startSubmission: async (payload: { examId: string; studentId: string; classId: string }) => {
        const res = await axios.post('/exams/submissions/start', payload);
        return res.data;
    },

    submitSubmission: async (submissionId: string, answers: { questionId: string; selectedOptionIds: string[] }[]) => {
        const res = await axios.put(`/exams/submissions/${submissionId}/submit`, { answers });
        return res.data;
    },

    getSubmission: async (examId: string, studentId: string): Promise<{ success: boolean; data: IExamSubmission | null }> => {
        const res = await axios.get('/exams/submissions', { params: { examId, studentId } });
        return res.data;
    },

    getActiveSubmission: async (): Promise<{ success: boolean; data: IExamSubmission | null }> => {
        const res = await axios.get('/exams/submissions/active');
        return res.data;
    },

    getExamSubmissions: async (examId: string): Promise<{ success: boolean; data: IExamSubmission[] }> => {
        const res = await axios.get(`/exams/${examId}/submissions`);
        return res.data;
    },
};
