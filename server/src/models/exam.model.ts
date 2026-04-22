import { ExamStatus, IExam, IOption, IQuestion } from '../types/exam.type';
import mongoose, { Schema } from 'mongoose';

const OptionSchema = new Schema<IOption>({
    content: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
}, { _id: true });

const QuestionSchema = new Schema<IQuestion>({
    content: { type: String, required: true },
    points: { type: Number, default: 1 },
    options: {
        type: [OptionSchema],
        validate: [
            {
                validator: (arr: IOption[]) => { return arr.length >= 1 && arr.length <= 10; },
                message: 'Each question must have 1 to 10 answers.'
            },
            {
                validator: (arr: IOption[]) => { return arr.some(opt => opt.isCorrect); },
                message: 'Must have at least one correct answer.'
            }
        ]
    }
}, { _id: true });

const examSchema = new Schema<IExam>({
    title: { type: String, required: true },
    description: { type: String },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    duration: { type: Number, required: true },
    questions: [QuestionSchema],
    status: {
        type: String,
        enum: ExamStatus,
        default: ExamStatus.DRAFT
    }
}, { timestamps: true, versionKey: false });

export const ExamModel = mongoose.model<IExam>('Exam', examSchema);