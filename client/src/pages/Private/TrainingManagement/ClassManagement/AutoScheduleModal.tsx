import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, Layers, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { addDays, getDay, format } from 'date-fns';

import Button from '../../../../components/Button';
import InputField from '../../../../components/InputField';

import { shiftService } from '../../../../services/shift.service';
import { scheduleService } from '../../../../services/schedule.service';
import useFetch from '../../../../hooks/useFetch';

import { DAYS_OF_WEEK } from '../../../../utils/constants';

interface AutoScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classData: any;
}

const AutoScheduleModal: React.FC<AutoScheduleModalProps> = ({ isOpen, onClose, onSuccess, classData }) => {
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [totalSessions, setTotalSessions] = useState<number>(10);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [dayShifts, setDayShifts] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { data: shiftsData, loading } = useFetch(shiftService.getShifts, { limit: 100 }, []);
  const shiftsList = Array.isArray(shiftsData) ? shiftsData : (shiftsData as any)?.data || [];

  if (!isOpen) return null;

  const toggleDay = (dayValue: number) => {
    if (selectedDays.includes(dayValue)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayValue));
      const newDayShifts = { ...dayShifts };
      delete newDayShifts[dayValue];
      setDayShifts(newDayShifts);
    } else {
      setSelectedDays([...selectedDays, dayValue].sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b)));
    }
    setErrors((prev) => ({ ...prev, selectedDays: '', dayShifts: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!startDate) newErrors.startDate = 'Vui lòng chọn ngày khai giảng';
    if (selectedDays.length === 0) newErrors.selectedDays = 'Vui lòng chọn ít nhất 1 ngày trong tuần';
    if (totalSessions <= 0 || totalSessions > 100) newErrors.totalSessions = 'Số buổi hợp lệ từ 1 - 100';
    if (selectedDays.some((day) => !dayShifts[day])) newErrors.dayShifts = 'Vui lòng chọn đầy đủ ca học';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    setServerError(null);

    const schedules = [];
    let currentDate = new Date(startDate);
    while (schedules.length < totalSessions) {
      const dayOfWeek = getDay(currentDate);
      if (selectedDays.includes(dayOfWeek)) {
        schedules.push({
          classId: classData._id,
          shiftId: dayShifts[dayOfWeek],
          roomId: classData.roomId?._id || classData.roomId || undefined,
          teacherId: classData.teacherId?._id || classData.teacherId || undefined,
          date: format(currentDate, 'yyyy-MM-dd'),
        });
      }
      currentDate = addDays(currentDate, 1);
    }

    try {
      const res = await scheduleService.createSchedulesBulk(schedules, startDate);

      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsGenerating(false);
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Lỗi hệ thống khi sinh lịch hàng loạt';
      setServerError(errorMsg);
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isGenerating ? onClose : undefined}
      ></div>

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white flex justify-between items-center relative">
          <div className="absolute -right-4 -top-4 opacity-10">
            <Sparkles size={100} />
          </div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Layers size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Sinh lịch tự động</h3>
              <p className="text-sm text-violet-100 mt-0.5">Lớp: {classData.name}</p>
            </div>
          </div>
          {!isGenerating && (
            <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors relative z-10">
              <X size={24} />
            </button>
          )}
        </div>

        <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {serverError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 animate-in shake duration-300">
              <div className="p-1 bg-red-500 text-white rounded-full shrink-0">
                <AlertCircle size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-red-700">Lỗi tạo lịch hàng loạt </p>
                <p className="text-xs text-red-600 mt-1">{serverError}</p>
                <p className="text-[10px] text-red-400 mt-2 italic">
                  * Để đảm bảo an toàn, hệ thống đã hủy bỏ toàn bộ tiến trình. Không có lịch học nào được tạo.
                </p>
              </div>
            </div>
          )}

          {!isGenerating && !isSuccess ? (
            <>
              <div className="grid grid-cols-2 gap-6">
                <InputField
                  label="Ngày khai giảng"
                  type="date"
                  icon={<CalendarIcon size={16} />}
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setServerError(null);
                  }}
                  error={errors.startDate}
                />
                <InputField
                  label="Tổng số buổi"
                  type="number"
                  icon={<Layers size={16} />}
                  value={totalSessions}
                  onChange={(e) => {
                    setTotalSessions(Number(e.target.value));
                    setServerError(null);
                  }}
                  error={errors.totalSessions}
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700">1. Chọn lịch học định kỳ</label>
                <div className="flex justify-between gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = selectedDays.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                          isSelected
                            ? 'bg-violet-50 border-violet-500 text-violet-700 shadow-sm'
                            : 'bg-white border-gray-100 text-gray-400 hover:border-violet-200'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                {errors.selectedDays && <p className="text-xs text-red-500 font-medium">{errors.selectedDays}</p>}
              </div>

              {selectedDays.length > 0 && (
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-1">
                  <label className="block text-sm font-bold text-gray-700">2. Phân bổ ca học chi tiết</label>
                  <div className="space-y-2.5">
                    {selectedDays.map((dayVal) => (
                      <div key={dayVal} className="flex items-center gap-3">
                        <span className="w-12 font-bold text-violet-600 shrink-0">
                          {DAYS_OF_WEEK.find((d) => d.value === dayVal)?.label}:
                        </span>
                        <div className="relative flex-1">
                          <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <select
                            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-200 transition-all appearance-none cursor-pointer"
                            value={dayShifts[dayVal] || ''}
                            onChange={(e) => {
                              setDayShifts({ ...dayShifts, [dayVal]: e.target.value });
                              setServerError(null);
                            }}
                          >
                            <option value="" disabled>
                              -- Chọn ca học --
                            </option>
                            {shiftsList.map((shift: any) => (
                              <option key={shift._id} value={shift._id}>
                                {shift.name} ({shift.startTime}-{shift.endTime})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.dayShifts && <p className="text-xs text-red-500 font-medium">{errors.dayShifts}</p>}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                <Button variant="outline" className="flex-1 rounded-xl py-3" onClick={onClose}>
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 rounded-xl py-3 bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200"
                  onClick={handleGenerate}
                >
                  Bắt đầu sinh lịch
                </Button>
              </div>
            </>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
              {isSuccess ? (
                <>
                  <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle2 size={40} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Tạo lịch thành công!</h4>
                  <p className="text-gray-500">Toàn bộ {totalSessions} buổi học đã được khởi tạo an toàn.</p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin mb-6"></div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Đang xử lý ...</h4>
                  <p className="text-gray-500 font-medium">Hệ thống đang kiểm tra xung đột và lưu dữ liệu an toàn.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoScheduleModal;
