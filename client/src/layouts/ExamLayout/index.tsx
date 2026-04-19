import { useState, useEffect, createContext, useContext, type PropsWithChildren } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Clock, CheckCircle2, FileText, Send, ChevronLeft, Menu, X, ChevronRight } from 'lucide-react';
import { examService } from '../../services/exam.service';
import type { IExam, IExamSubmission } from '../../types/exam.type';
import { PATHS } from '../../utils/constants';
import { getDecodedToken } from '../../utils/auth';

type ExamContextType = {
    exam: IExam | null;
    submission: IExamSubmission | null;
    answers: Record<string, string[]>;
    handleOptionToggle: (qId: string, optId: string) => void;
    handleSubmit: (isAuto?: boolean) => void;
    timeLeft: number | null;
    submitting: boolean;
};

export const ExamContext = createContext<ExamContextType | null>(null);

export const useExam = () => {
    const ctx = useContext(ExamContext);
    if (!ctx) throw new Error('useExam must be used within ExamLayout');
    return ctx;
};

export default function ExamLayout({ children }: PropsWithChildren) {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();
    const currentUser = getDecodedToken();

    const [exam, setExam] = useState<IExam | null>(null);
    const [submission, setSubmission] = useState<IExamSubmission | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [answers, setAnswers] = useState<Record<string, string[]>>({});
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!examId) return;
        const fetchBaseData = async () => {
            try {
                const [examRes, subRes] = await Promise.all([
                    examService.getExamById(examId),
                    examService.getSubmission(examId, currentUser?.id!)
                ]);

                if (!examRes.data || !subRes.data) {
                    toast.error('Không tìm thấy bài kiểm tra hoặc bạn chưa bắt đầu làm bài.');
                    navigate(PATHS.STUDENT_PORTAL);
                    return;
                }

                setExam(examRes.data);
                setSubmission(subRes.data);

                if (subRes.data.answers) {
                    const ansMap: Record<string, string[]> = {};
                    subRes.data.answers.forEach((ans: any) => {
                        ansMap[ans.questionId] = ans.selectedOptionIds;
                    });
                    setAnswers(ansMap);
                }

            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Không thể tải dữ liệu bài thi');
                navigate(PATHS.STUDENT_PORTAL);
            } finally {
                setLoading(false);
            }
        };

        fetchBaseData();
    }, [examId, navigate, currentUser?.id]);

    useEffect(() => {
        if (!exam || !submission || submission.status === 'SUBMITTED') return;

        const endTime = new Date(submission.startedAt).getTime() + exam.duration * 60000;

        const updateTimer = () => {
            const now = Date.now();
            const remain = Math.max(0, endTime - now);
            setTimeLeft(Math.floor(remain / 1000));

            if (remain <= 0) {
                clearInterval(interval);
                handleSubmit(true);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [exam, submission]);

    const handleOptionToggle = (qId: string, optId: string) => {
        if (submission?.status === 'SUBMITTED') return;
        setAnswers(prev => ({
            ...prev,
            [qId]: [optId]
        }));
    };

    const handleSubmit = async (isAuto = false) => {
        if (!examId || !submission || submission.status === 'SUBMITTED') return;
        if (!isAuto && !window.confirm('Bạn có chắc chắn muốn nộp bài?')) return;

        setSubmitting(true);
        try {
            const formattedAnswers = Object.entries(answers).map(([questionId, selectedOptionIds]) => ({
                questionId,
                selectedOptionIds
            }));

            const res = await examService.submitSubmission(submission._id, formattedAnswers);
            setSubmission(res.data);

            if (isAuto) {
                toast.info('Hết giờ bài làm đã được nộp tự động.');
            } else {
                toast.success('Nộp bài thành công!');
                setSidebarOpen(false);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Có lỗi khi nộp bài');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!exam || !submission) return null;

    const isSubmitted = submission.status === 'SUBMITTED';

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const totalQuestions = exam.questions.length;
    const answeredCount = Object.keys(answers).filter(k => answers[k].length > 0).length;

    return (
        <ExamContext.Provider value={{ exam, submission, answers, handleOptionToggle, handleSubmit, timeLeft, submitting }}>
            <div className="h-screen flex flex-col bg-slate-50 overflow-hidden relative">

                {/* Header section moved from StudentExamPage */}
                <header className="bg-white border-b border-gray-200 shadow-sm z-30 shrink-0">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {isSubmitted && (
                                <button
                                    onClick={() => navigate(PATHS.STUDENT_PORTAL)}
                                    className="p-2 bg-slate-50 rounded-lg border border-gray-200 text-gray-600 shadow-sm hover:bg-gray-100 transition-colors"
                                    title="Quay lại Portal"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                            )}
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 leading-tight">{exam.title}</h1>
                                <p className="text-xs text-gray-500 font-medium">Học sinh: {currentUser?.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Layout specific header info block */}
                            <div className="flex items-center gap-6 mr-4 bg-slate-50 px-4 py-2 rounded-xl border border-gray-100">
                                {isSubmitted ? (
                                    <>
                                        <div className="text-center px-2">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Thời gian</p>
                                            <p className="font-bold text-gray-800 text-sm">{Math.ceil((submission.timeTaken || 0) / 60)} phút</p>
                                        </div>
                                        <div className="w-px h-6 bg-gray-200"></div>
                                        <div className="text-center px-2">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Điểm số</p>
                                            <p className="font-black text-lg text-blue-600 leading-none">
                                                {submission.score} <span className="text-xs text-gray-400 font-medium">/ 10</span>
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Còn lại</p>
                                        <p className={`font-mono font-bold text-lg flex items-center gap-1.5 leading-none ${(timeLeft ?? 0) < 300 ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}>
                                            <Clock size={16} />
                                            {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors flex items-center gap-2 font-semibold text-sm border border-blue-200"
                            >
                                <Menu size={20} />
                                <span className="hidden sm:inline">Câu hỏi ({answeredCount}/{totalQuestions})</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto px-4 py-6 sm:p-8 relative">
                    {children}
                </main>

                {/* Sidebar Navigation */}
                <div
                    className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 z-50 flex flex-col ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}
                >
                    <div className="flex items-center justify-between px-3 py-4 border-b border-gray-100 bg-slate-50">
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="cursor-pointer p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-white">
                        <div className="mb-6 flex items-center justify-between text-sm">
                            <span className="text-gray-500 font-medium">Tiến độ bài làm</span>
                            <span className="font-bold text-blue-600">{answeredCount}/{totalQuestions}</span>
                        </div>

                        <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                            ></div>
                        </div>

                        <div className="grid grid-cols-5 gap-3">
                            {exam.questions.map((q, index) => {
                                const isAnswered = (answers[q._id || ''] || []).length > 0;
                                let btnClasses = "cursor-pointer h-10 w-full rounded-lg font-semibold text-sm transition-all border-2 flex items-center justify-center ";

                                if (isSubmitted) {
                                    if (isAnswered) {
                                        btnClasses += "bg-blue-50 border-blue-200 text-blue-700";
                                    } else {
                                        btnClasses += "border-gray-200 text-gray-400 bg-gray-50 opacity-60";
                                    }
                                } else {
                                    if (isAnswered) {
                                        btnClasses += "bg-blue-600 border-blue-600 text-white shadow-sm hover:bg-blue-700 hover:border-blue-700";
                                    } else {
                                        btnClasses += "bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600";
                                    }
                                }

                                return (
                                    <button
                                        key={q._id || index}
                                        onClick={() => {
                                            const el = document.getElementById(`question-${index}`);
                                            if (el) {
                                                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                if (window.innerWidth < 640) setSidebarOpen(false);
                                            }
                                        }}
                                        className={btnClasses}
                                    >
                                        {index + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <div className="w-3 h-3 rounded bg-blue-600"></div> Đã trả lời
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <div className="w-3 h-3 rounded border-2 border-gray-200 bg-white"></div> Chưa trả lời
                            </div>
                        </div>
                    </div>

                    {!isSubmitted && (
                        <div className="p-6 bg-slate-50 border-t border-gray-200 shrink-0">
                            <button
                                onClick={() => handleSubmit(false)}
                                disabled={submitting}
                                className="cursor-pointer w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Send size={18} />
                                )}
                                Nộp bài ngay
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                )}
            </div>
        </ExamContext.Provider>
    );
}