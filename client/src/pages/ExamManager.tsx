import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
    Plus, Search, Edit2, Trash2, Copy, ChevronLeft, ChevronRight,
    Save, X, PlusCircle, Minus, Users, PlayCircle, Eye,
    FileText,
    CheckCircle2,
    BookOpen,
    Clock,
    AlertCircle,
    XCircle
} from 'lucide-react';
import { examService } from '../services/exam.service';
import type { IExam, IExamQuestion, IExamOption, IExamSubmission } from '../types/exam.type';
import { getDecodedToken } from '../utils/auth';

const STATUS_CFG: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
    DRAFT: { label: 'Nháp', bg: 'bg-gray-100', text: 'text-gray-600', icon: <FileText size={12} /> },
    PUBLISHED: { label: 'Đã phát hành', bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle2 size={12} /> },
    CLOSED: { label: 'Đã đóng', bg: 'bg-red-100', text: 'text-red-600', icon: <XCircle size={12} /> },
};

const emptyOption = (): IExamOption => ({ content: '', isCorrect: false });
const emptyQuestion = (): IExamQuestion => ({
    content: '', points: 1,
    options: [emptyOption(), emptyOption()],
});
const emptyExam = (classId: string, teacherId: string): Partial<IExam> => ({
    title: '', description: '', classId, teacherId,
    startDate: '', endDate: '', duration: 60,
    questions: [emptyQuestion()], status: 'DRAFT',
});

interface Props {
    classId: string;
}

const ExamForm = ({
    initial, classId, teacherId, onSave, onCancel,
}: {
    initial: Partial<IExam> | null;
    classId: string;
    teacherId: string;
    onSave: () => void;
    onCancel: () => void;
}) => {
    const [form, setForm] = useState<Partial<IExam>>(
        initial ?? emptyExam(classId, teacherId)
    );
    const [saving, setSaving] = useState(false);

    const setField = (k: keyof IExam, v: any) => setForm(p => ({ ...p, [k]: v }));

    const setQuestion = (qi: number, k: keyof IExamQuestion, v: any) =>
        setForm(p => {
            const qs = [...(p.questions ?? [])];
            qs[qi] = { ...qs[qi], [k]: v };
            return { ...p, questions: qs };
        });

    const setOption = (qi: number, oi: number, k: keyof IExamOption, v: any) =>
        setForm(p => {
            const qs = [...(p.questions ?? [])];
            const opts = [...qs[qi].options];
            opts[oi] = { ...opts[oi], [k]: v };
            qs[qi] = { ...qs[qi], options: opts };
            return { ...p, questions: qs };
        });

    const toggleCorrect = (qi: number, oi: number) =>
        setForm(p => {
            const qs = [...(p.questions ?? [])];
            const opts = qs[qi].options.map((o, idx) => ({ ...o, isCorrect: idx === oi }));
            qs[qi] = { ...qs[qi], options: opts };
            return { ...p, questions: qs };
        });

    const addQuestion = () => setForm(p => ({ ...p, questions: [...(p.questions ?? []), emptyQuestion()] }));
    const removeQuestion = (qi: number) => setForm(p => ({ ...p, questions: (p.questions ?? []).filter((_, i) => i !== qi) }));
    const addOption = (qi: number) => setForm(p => {
        const qs = [...(p.questions ?? [])];
        if (qs[qi].options.length >= 10) return p;
        qs[qi] = { ...qs[qi], options: [...qs[qi].options, emptyOption()] };
        return { ...p, questions: qs };
    });
    const removeOption = (qi: number, oi: number) => setForm(p => {
        const qs = [...(p.questions ?? [])];
        if (qs[qi].options.length <= 1) return p;
        qs[qi] = { ...qs[qi], options: qs[qi].options.filter((_, i) => i !== oi) };
        return { ...p, questions: qs };
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, classId, teacherId };
            if (initial?._id) {
                await examService.updateExam(initial._id, payload);
                toast.success('Cập nhật bài kiểm tra thành công!');
            } else {
                await examService.createExam(payload);
                toast.success('Tạo bài kiểm tra thành công!');
            }
            onSave();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white';

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h4 className="font-bold text-gray-800 text-base flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" /> Thông tin cơ bản
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Tiêu đề *</label>
                        <input required className={inputCls} value={form.title ?? ''} onChange={e => setField('title', e.target.value)} placeholder="Nhập tiêu đề bài kiểm tra" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Mô tả</label>
                        <textarea rows={2} className={inputCls} value={form.description ?? ''} onChange={e => setField('description', e.target.value)} placeholder="Nhập mô tả (tuỳ chọn)" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày bắt đầu *</label>
                        <input required type="datetime-local" className={inputCls} value={form.startDate ? form.startDate.slice(0, 16) : ''} onChange={e => setField('startDate', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày kết thúc *</label>
                        <input required type="datetime-local" className={inputCls} value={form.endDate ? form.endDate.slice(0, 16) : ''} onChange={e => setField('endDate', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Thời gian làm bài (phút) *</label>
                        <input required type="number" min={1} className={inputCls} value={form.duration ?? 60} onChange={e => setField('duration', Number(e.target.value))} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Trạng thái</label>
                        <select className={inputCls} value={form.status ?? 'DRAFT'} onChange={e => setField('status', e.target.value)}>
                            <option value="DRAFT">Nháp</option>
                            <option value="PUBLISHED">Phát hành</option>
                            <option value="CLOSED">Đóng</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
                {(form.questions ?? []).map((q, qi) => (
                    <div key={qi} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                                Câu {qi + 1}
                            </span>
                            <div className="flex items-center gap-2">
                                <input type="number" step="any" min={0} className="w-20 px-2 py-1 text-sm border border-gray-200 rounded-lg text-center" value={q.points} onChange={e => setQuestion(qi, 'points', Number(e.target.value))} title="Điểm" />
                                <span className="text-xs text-gray-500">điểm</span>
                                {(form.questions?.length ?? 0) > 1 && (
                                    <button type="button" onClick={() => removeQuestion(qi)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <textarea
                            required rows={2}
                            className={`${inputCls} mb-3`}
                            placeholder={`Nội dung câu hỏi ${qi + 1}`}
                            value={q.content}
                            onChange={e => setQuestion(qi, 'content', e.target.value)}
                        />
                        <div className="space-y-2">
                            {q.options.map((opt, oi) => (
                                <div key={oi} className={`flex items-center gap-2 p-2 rounded-xl border transition-colors ${opt.isCorrect ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                    <input
                                        type="radio"
                                        name={`question-${qi}`}
                                        checked={opt.isCorrect}
                                        onChange={() => toggleCorrect(qi, oi)}
                                        className="w-4 h-4 cursor-pointer text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                                    />
                                    <input
                                        required className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
                                        placeholder={`Đáp án ${oi + 1}`}
                                        value={opt.content}
                                        onChange={e => setOption(qi, oi, 'content', e.target.value)}
                                    />
                                    {q.options.length > 1 && (
                                        <button type="button" onClick={() => removeOption(qi, oi)} className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                                            <Minus size={12} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {q.options.length < 10 && (
                            <button type="button" onClick={() => addOption(qi)} className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold py-1 px-2 hover:bg-blue-50 rounded-lg transition-colors">
                                <PlusCircle size={13} /> Thêm đáp án
                            </button>
                        )}
                    </div>
                ))}

                <button type="button" onClick={addQuestion} className="w-full py-3 border-2 border-dashed border-blue-200 rounded-2xl text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 text-sm font-semibold">
                    <Plus size={16} /> Thêm câu hỏi
                </button>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <X size={15} /> Hủy
                </button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-2 shadow-md shadow-blue-600/20">
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
                    {initial?._id ? 'Lưu thay đổi' : 'Tạo bài kiểm tra'}
                </button>
            </div>
        </form>
    );
};

const CopyFromOtherClasses = ({
    currentClassId, teacherId, onCopied,
}: {
    currentClassId: string;
    teacherId: string;
    onCopied: (exam: IExam) => void;
}) => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [exams, setExams] = useState<IExam[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const LIMIT = 6;

    const fetchExams = useCallback(async () => {
        setLoading(true);
        try {
            const res = await examService.getExams({ excludeClassId: currentClassId, search, page, limit: LIMIT });
            setExams(res.data);
            setTotal(res.total);
        } catch { } finally {
            setLoading(false);
        }
    }, [currentClassId, search, page]);

    useEffect(() => { fetchExams(); }, [fetchExams]);
    // reset page on search
    useEffect(() => { setPage(1); }, [search]);

    const handleCopy = async (exam: IExam) => {
        try {
            const res = await examService.copyExam(exam._id, currentClassId);
            onCopied(res.data);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Sao chép thất bại');
        }
    };

    const totalPages = Math.ceil(total / LIMIT);

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text" placeholder="Tìm kiếm bài kiểm tra..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : exams.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-sm">
                    <BookOpen size={32} className="mx-auto mb-2 opacity-40" />
                    Không tìm thấy bài kiểm tra nào từ lớp khác.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {exams.map(exam => {
                        const sc = STATUS_CFG[exam.status] ?? STATUS_CFG.DRAFT;
                        const className = typeof exam.classId === 'object' ? exam.classId.name : exam.classId;
                        return (
                            <div key={exam._id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${sc.bg} ${sc.text}`}>
                                        {sc.icon} {sc.label}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-full">
                                        {className}
                                    </span>
                                </div>
                                <h5 className="font-bold text-sm text-gray-800 line-clamp-2 mb-1">{exam.title}</h5>
                                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                                    <Clock size={10} /> {exam.duration} phút · {exam.questions.length} câu hỏi
                                </p>
                                <button
                                    onClick={() => handleCopy(exam)}
                                    className="mt-3 w-full py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border border-blue-100 hover:border-blue-600 active:scale-95"
                                >
                                    <Copy size={12} /> Sao chép vào lớp này
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                        <ChevronLeft size={14} />
                    </button>
                    <span className="text-sm text-gray-600 font-medium">{page} / {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                        <ChevronRight size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

export const ExamManager = ({ classId }: Props) => {
    const currentUser = getDecodedToken();
    const teacherId = currentUser?.id ?? '';

    const [view, setView] = useState<'list' | 'form' | 'copy' | 'submissions'>('list');
    const [editingExam, setEditingExam] = useState<IExam | null>(null);
    const [selectedExamForSubmissions, setSelectedExamForSubmissions] = useState<IExam | null>(null);

    const [exams, setExams] = useState<IExam[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const LIMIT = 6;

    const fetchExams = useCallback(async () => {
        setLoading(true);
        try {
            const res = await examService.getExams({ classId, search, page, limit: LIMIT });
            setExams(res.data);
            setTotal(res.total);
        } catch { } finally { setLoading(false); }
    }, [classId, search, page]);

    useEffect(() => { fetchExams(); }, [fetchExams]);
    useEffect(() => { setPage(1); }, [search]);

    const totalPages = Math.ceil(total / LIMIT);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc muốn xóa bài kiểm tra này?')) return;
        try {
            await examService.deleteExam(id);
            toast.success('Đã xóa bài kiểm tra');
            fetchExams();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Xóa thất bại');
        }
    };

    const handleEdit = (exam: IExam) => {
        setEditingExam(exam);
        setView('form');
    };

    const handleCopied = (exam: IExam) => {
        setEditingExam(exam);
        setView('form');
    };

    const handleSaved = () => {
        setView('list');
        setEditingExam(null);
        fetchExams();
    };

    const handleViewSubmissions = (exam: IExam) => {
        setSelectedExamForSubmissions(exam);
        setView('submissions');
    };

    const handleCancel = () => {
        setView('list');
        setEditingExam(null);
    };

    if (view === 'list') return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-5">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Tìm kiếm bài kiểm tra..." value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setView('copy')} className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
                        <Copy size={15} /> Sao chép từ lớp khác
                    </button>
                    <button onClick={() => { setEditingExam(null); setView('form'); }} className="px-4 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md shadow-blue-600/20">
                        <Plus size={15} /> Tạo bài kiểm tra
                    </button>
                </div>
            </div>

            {/* Exam cards */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />)}
                </div>
            ) : exams.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-sm">
                    <FileText size={40} className="mx-auto text-blue-300 mb-3" />
                    <p className="font-bold text-gray-700 mb-1">Chưa có bài kiểm tra nào</p>
                    <p className="text-sm text-gray-400">{search ? 'Không tìm thấy kết quả phù hợp.' : 'Tạo bài kiểm tra mới hoặc sao chép từ lớp khác.'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exams.map(exam => {
                        const sc = STATUS_CFG[exam.status] ?? STATUS_CFG.DRAFT;
                        return (
                            <div key={exam._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 group flex flex-col h-full justify-between">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${sc.bg} ${sc.text}`}>
                                        {sc.icon} {sc.label}
                                    </span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(exam)} title="Chỉnh sửa" className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(exam._id)} title="Xóa" className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors">{exam.title}</h4>
                                    {exam.description && <p className="text-xs text-gray-400 line-clamp-1 mb-3">{exam.description}</p>}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap border-t border-gray-50 pt-3">
                                        <span className="flex items-center gap-1"><Clock size={11} /> {exam.duration} phút</span>
                                        <span className="flex items-center gap-1"><FileText size={11} /> {exam.questions.length} câu</span>
                                        <span className="flex items-center gap-1"><AlertCircle size={11} className="text-amber-400" />
                                            {new Date(exam.startDate).toLocaleDateString('vi-VN')} → {new Date(exam.endDate).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleViewSubmissions(exam)}
                                        className="cursor-pointer mt-4 w-full py-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border border-blue-100 hover:border-blue-600 active:scale-95"
                                    >
                                        <Eye size={14} /> Xem bài làm của học sinh
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-gray-600 font-medium px-2">{page} / {totalPages} · {total} bài</span>
                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );

    // ─── Copy view ─────────────────────────────────────────────────────
    if (view === 'copy') return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-5">
                <button onClick={() => setView('list')} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                    <ChevronLeft size={16} />
                </button>
                <div>
                    <h4 className="font-bold text-gray-800">Sao chép từ lớp khác</h4>
                    <p className="text-xs text-gray-400">Chọn bài kiểm tra để sao chép vào lớp hiện tại. Bạn có thể chỉnh sửa trước khi phát hành.</p>
                </div>
            </div>
            <CopyFromOtherClasses currentClassId={classId} teacherId={teacherId} onCopied={handleCopied} />
        </div>
    );
    // ─── Submissions view ──────────────────────────────────────────────
    if (view === 'submissions' && selectedExamForSubmissions) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-5">
                    <button onClick={() => setView('list')} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                        <ChevronLeft size={16} />
                    </button>
                    <div>
                        <h4 className="font-bold text-gray-800">Bài làm học sinh</h4>
                        <p className="text-xs text-gray-400">"{selectedExamForSubmissions.title}"</p>
                    </div>
                </div>
                <ExamSubmissionsList examId={selectedExamForSubmissions._id} />
            </div>
        );
    }

    // ─── Form view ─────────────────────────────────────────────────────
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-5">
                <button onClick={handleCancel} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                    <ChevronLeft size={16} />
                </button>
                <div>
                    <h4 className="font-bold text-gray-800">{editingExam ? 'Chỉnh sửa bài kiểm tra' : 'Tạo bài kiểm tra mới'}</h4>
                    <p className="text-xs text-gray-400">Điền đầy đủ thông tin và câu hỏi bên dưới</p>
                </div>
            </div>
            <ExamForm initial={editingExam} classId={classId} teacherId={teacherId} onSave={handleSaved} onCancel={handleCancel} />
        </div>
    );
};

const ExamSubmissionsList = ({ examId }: { examId: string }) => {
    const [submissions, setSubmissions] = useState<IExamSubmission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        examService.getExamSubmissions(examId)
            .then(res => setSubmissions(res.data))
            .catch(err => toast.error('Không thể tải danh sách bài làm'))
            .finally(() => setLoading(false));
    }, [examId]);

    if (loading) {
        return <div className="grid gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />)}</div>;
    }

    if (submissions.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-sm">
                <Users size={40} className="mx-auto text-blue-200 mb-3" />
                <p className="font-bold text-gray-700">Chưa có học sinh nào làm bài</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Học sinh</th>
                            <th className="px-6 py-4 text-center">Trạng thái</th>
                            <th className="px-6 py-4 text-center">Thời gian làm</th>
                            <th className="px-6 py-4 text-center">Nộp lúc</th>
                            <th className="px-6 py-4 text-right">Điểm số</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {submissions.map(sub => {
                            const student = sub.studentId as any;
                            const isDone = sub.status === 'SUBMITTED';
                            return (
                                <tr key={sub._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-800">{student?.fullName || 'Không rõ'}</p>
                                        <p className="text-xs text-gray-400">{student?.email}</p>
                                    </td>
                                    <td className="px-6 py-4 justify-center">
                                        <div className="flex justify-center">
                                            {isDone ? (
                                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-600 border border-green-100 flex items-center gap-1">
                                                    <CheckCircle2 size={10} /> Đã nộp
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1">
                                                    <PlayCircle size={10} /> Đang làm
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {isDone ? `${Math.ceil((sub.timeTaken || 0) / 60)} phút` : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center text-xs">
                                        {sub.completedAt ? new Date(sub.completedAt).toLocaleString('vi-VN') : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {isDone ? (
                                            <span className="text-lg font-black text-blue-600">{sub.score}</span>
                                        ) : (
                                            <span className="text-gray-300">-</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExamManager;
