import { useExam } from '../layouts/ExamLayout';

const StudentExamPage = () => {
    const { exam, submission, answers, handleOptionToggle } = useExam();

    if (!exam || !submission) return null;

    const isSubmitted = submission.status === 'SUBMITTED';

    return (
        <div className="max-w-4xl mx-auto pb-10 animate-in fade-in duration-500 relative">
            {/* Questions List */}
            <div className="space-y-6">
                {exam.questions.map((q, qIndex) => {
                    const qAnswers = answers[q._id || ''] || [];

                    return (
                        <div
                            id={`question-${qIndex}`}
                            key={q._id || qIndex}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden relative"
                        >
                            {/* Question Header */}
                            <div className="flex items-start gap-4 mb-4">
                                <div className="shrink-0 w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                                    {qIndex + 1}
                                </div>
                                <div className="flex-1 pt-1">
                                    <h4 className="font-semibold text-gray-800 text-lg leading-relaxed">{q.content}</h4>
                                    <p className="text-xs text-blue-500 font-medium mt-2">{q.points} điểm</p>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-3 pl-12 -ml-2">
                                {q.options.map((opt, oIndex) => {
                                    const isSelected = qAnswers.includes(opt._id || '');

                                    // Logic for visual feedback AFTER submission
                                    let optionStatusCls = 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30';
                                    let indicatorBg = 'border-gray-300';

                                    if (isSubmitted) {
                                        if (isSelected) {
                                            if (opt.isCorrect) {
                                                optionStatusCls = 'bg-green-50 border-green-200';
                                                indicatorBg = 'bg-green-500 border-green-500';
                                            } else {
                                                optionStatusCls = 'bg-red-50 border-red-200';
                                                indicatorBg = 'bg-red-500 border-red-500';
                                            }
                                        } else {
                                            if (opt.isCorrect) {
                                                optionStatusCls = 'bg-green-50 border-green-200 opacity-60';
                                                indicatorBg = 'bg-green-500 border-green-500';
                                            } else {
                                                optionStatusCls = 'border-gray-200 opacity-50';
                                            }
                                        }
                                    } else {
                                        if (isSelected) {
                                            optionStatusCls = 'bg-blue-50 border-blue-400 shadow-sm';
                                            indicatorBg = 'bg-blue-500 border-blue-500';
                                        }
                                    }

                                    return (
                                        <label
                                            key={opt._id || oIndex}
                                            className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${optionStatusCls}`}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${q._id || qIndex}`}
                                                checked={isSelected}
                                                onChange={() => handleOptionToggle(q._id || '', opt._id || '')}
                                                disabled={isSubmitted}
                                                className="hidden"
                                            />
                                            <div className={`shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-colors ${indicatorBg}`}>
                                                {(isSelected || (isSubmitted && opt.isCorrect)) && (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                                )}
                                            </div>
                                            <span className={`text-base font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {opt.content}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StudentExamPage;
