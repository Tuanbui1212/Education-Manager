import { useState } from 'react';
import { ArrowLeft, RotateCcw, CheckCircle2, AlertTriangle, CalendarDays, Star, Activity } from 'lucide-react';
import type { IClass } from '../../../../types/class.type';
import { CLASS_COLORS, DAYS, DAYS_FULL } from '../../../../utils/constants';
import Button from '../../../../components/Button';
import StatCard from '../../../../components/StatCard';

interface IBackendResult {
  finalSchedule: any[];
  classResults: any[];
  totalScore: number;
}

function Page3({
  result,
  selectedClasses,
  shifts,
  onBack,
  onRerun,
  onReset,
}: {
  result: IBackendResult;
  selectedClasses: IClass[];
  shifts: any[];
  onBack: () => void;
  onRerun: () => void;
  onReset: () => void;
}) {
  const { finalSchedule, classResults, totalScore } = result;
  const [activeView, setActiveView] = useState<'timetable' | 'scores'>('timetable');

  function getCellEntries(dayIdx: number, slotIdx: number) {
    return finalSchedule.filter((e) => e.day === dayIdx && e.slot === slotIdx);
  }

  const unscheduled = classResults.filter((r) => r.sessions.length === 0);
  const scheduledCount = classResults.filter((r) => r.sessions.length > 0).length;
  const sortedShifts = shifts ? [...shifts].sort((a, b) => a.startTime.localeCompare(b.startTime)) : [];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="outline"
          icon={<ArrowLeft size={15} />}
          onClick={onBack}
          className="flex-shrink-0 mt-0.5 px-3 py-2"
        >
          Quay lại
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">Kết quả xếp lịch</h1>
          <p className="text-sm text-gray-500 mt-1">
            {selectedClasses.length} lớp · Tổng điểm: <strong className="text-primary">{totalScore}</strong>
          </p>
        </div>
        <Button
          variant="outline"
          icon={<RotateCcw size={14} />}
          onClick={onRerun}
          className="flex-shrink-0 mt-0.5 px-3 py-2"
        >
          Xếp lại
        </Button>
      </div>

      {/* Stat Cards — dùng StatCard component */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<Activity size={20} />}
          label="Lớp đưa vào"
          value={selectedClasses.length}
          gradient="bg-gradient-to-br from-primary to-primary/80"
          textColor="text-primary"
          active={false}
          onClick={() => {}}
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Lớp đã xếp được"
          value={scheduledCount}
          gradient="bg-gradient-to-br from-primary to-primary/80"
          textColor="text-primary"
          active={false}
          onClick={() => {}}
        />
        <StatCard
          icon={<Star size={20} />}
          label="Tổng điểm"
          value={totalScore}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-400"
          textColor="text-emerald-600"
          active={false}
          onClick={() => {}}
        />
      </div>

      {/* Warning */}
      {unscheduled.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-800">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <span>
            <strong>{unscheduled.length} lớp không xếp được</strong>: {unscheduled.map((r) => r.cls.name).join(', ')} —
            có thể do xung đột phòng/GV hoặc ràng buộc quá khắt khe.
          </span>
        </div>
      )}

      {/* Tabs + Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {(['timetable', 'scores'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setActiveView(key)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2
                ${
                  activeView === key
                    ? 'text-primary border-primary'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              {key === 'timetable' ? (
                <>
                  <CalendarDays size={15} /> Thời khoá biểu
                </>
              ) : (
                <>
                  <Star size={15} /> Phân tích điểm
                </>
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* ── TIMETABLE VIEW ── */}
          {activeView === 'timetable' && (
            <div>
              {/* Legend */}
              <div className="flex flex-wrap gap-3 mb-4">
                {classResults
                  .filter((r) => r.sessions.length > 0)
                  .map((r) => {
                    const c = CLASS_COLORS[r.colorIdx % CLASS_COLORS.length] || CLASS_COLORS[0];
                    return (
                      <div key={r.cls._id} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: c.dot }} />
                        {r.cls.name}
                      </div>
                    );
                  })}
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="bg-gray-50 px-3 py-2.5 border border-gray-100 font-semibold text-gray-600 text-center whitespace-nowrap w-28">
                        Ca học
                      </th>
                      {DAYS_FULL.map((d) => (
                        <th
                          key={d}
                          className="bg-gray-50 px-3 py-2.5 border border-gray-100 font-semibold text-gray-600 text-center whitespace-nowrap min-w-[100px]"
                        >
                          {d}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedShifts.map((shift, slotIdx) => (
                      <tr key={slotIdx}>
                        <td className="px-3 py-2 border border-gray-100 bg-gray-50/70 text-center whitespace-nowrap">
                          <div className="font-semibold text-gray-700">
                            {shift.startTime} – {shift.endTime}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{shift.name || `Ca ${slotIdx + 1}`}</div>
                        </td>
                        {DAYS.map((_, dayIdx) => {
                          const entries = getCellEntries(dayIdx, slotIdx);
                          return (
                            <td key={dayIdx} className="p-1.5 border border-gray-100 align-top">
                              {entries.length === 0 ? (
                                <span className="text-gray-200 block text-center py-2">—</span>
                              ) : (
                                entries.map((e) => {
                                  const c = CLASS_COLORS[e.classIdx % CLASS_COLORS.length] || CLASS_COLORS[0];
                                  return (
                                    <div
                                      key={`${e.classId}_${e.shiftId}`}
                                      className="rounded-lg px-2 py-1.5 text-[10px] font-medium leading-relaxed my-0.5"
                                      style={{ background: c.bg, color: c.tc }}
                                    >
                                      <div className="font-bold text-[11px]">{e.className}</div>
                                      <div className="opacity-75">{e.roomName}</div>
                                      <div className="opacity-60 mt-0.5">★ {e.slotScore}đ</div>
                                    </div>
                                  );
                                })
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── SCORES VIEW ── */}
          {activeView === 'scores' && (
            <div className="space-y-3">
              {classResults.map((r) => {
                const c = CLASS_COLORS[r.colorIdx % CLASS_COLORS.length] || CLASS_COLORS[0];
                const maxScore = Math.max(...classResults.map((x) => x.totalScore), 1);
                const pct = Math.max(0, Math.round((r.totalScore / maxScore) * 100));
                const sortedDays = [...(r.days || [])].sort((a: number, b: number) => a - b);
                const gaps =
                  sortedDays.length > 1 ? sortedDays.slice(1).map((d: number, i: number) => d - sortedDays[i]) : [];

                return (
                  <div
                    key={r.cls._id}
                    className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.dot }} />
                      <span className="font-bold text-sm flex-1" style={{ color: c.tc }}>
                        {r.cls.name}
                      </span>
                      <span className={`text-sm font-bold ${r.totalScore > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {r.totalScore}đ
                      </span>
                    </div>

                    {r.sessions.length > 0 ? (
                      <>
                        <div className="h-2 bg-gray-100 rounded-full mb-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: c.dot }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {sortedDays.map((d: number) => DAYS_FULL[d]).join(' → ')}
                          {gaps.length > 0 && <span className="text-gray-400"> (cách: {gaps.join(', ')} ngày)</span>}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {r.sessions.map((s: any, si: number) => {
                            const shiftObj = sortedShifts[s.slot];
                            return (
                              <span
                                key={si}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-medium"
                                style={{ background: c.bg, color: c.tc }}
                              >
                                {DAYS_FULL[s.day]}{' '}
                                {shiftObj ? `${shiftObj.startTime}–${shiftObj.endTime}` : `Ca ${s.slot + 1}`} · {s.room}
                              </span>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2">
                        <AlertTriangle size={13} /> Backend không tìm được lịch phù hợp
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3.5">
        <Button variant="outline" icon={<ArrowLeft size={15} />} onClick={onBack}>
          Sửa preference
        </Button>
        <Button variant="primary" icon={<CheckCircle2 size={15} />} onClick={onReset}>
          Xác nhận & lưu lịch
        </Button>
      </div>
    </div>
  );
}

export default Page3;
