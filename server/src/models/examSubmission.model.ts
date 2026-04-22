import mongoose, { Schema } from 'mongoose';
import { ExamSubmissionStatus, IExamSubmission, IStudentAnswer } from '../types/examSubmission.type';

const StudentAnswerSchema = new Schema<IStudentAnswer>({
    questionId: { type: Schema.Types.ObjectId, required: true },
    selectedOptionIds: [{ type: Schema.Types.ObjectId }]
}, { _id: false });

const examSubmissionSchema = new Schema<IExamSubmission>({
    examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },

    answers: [StudentAnswerSchema],

    score: { type: Number, default: 0 },

    startedAt: { type: Date, required: true },
    completedAt: { type: Date },
    timeTaken: { type: Number },

    status: {
        type: String,
        enum: ExamSubmissionStatus,
        default: ExamSubmissionStatus.IN_PROGRESS
    }
}, { timestamps: true, versionKey: false });

examSubmissionSchema.index({ examId: 1, studentId: 1 }, { unique: true });

export const ExamSubmissionModel = mongoose.model('ExamSubmission', examSubmissionSchema);