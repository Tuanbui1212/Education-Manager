import { useState } from 'react';
import type { IClass } from '../../../../types/class.type';
import { CLASS_COLORS, DAYS, DAYS_FULL, GREEN, MORNING_SLOTS, PRIMARY, SLOTS } from '../../../../utils/constants';
import useFetch from '../../../../hooks/useFetch';
import { shiftService } from '../../../../services/shift.service';
import { roomService } from '../../../../services/room.service';

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
  onReset,
}: {
  result: IBackendResult;
  selectedClasses: IClass[];
  shifts: any[];
  onBack: () => void;
  onReset: () => void;
}) {
  const { finalSchedule, classResults, totalScore } = result;
  const [activeView, setActiveView] = useState<'timetable' | 'scores'>('timetable');

  function getCellEntries(dayIdx: number, slotIdx: number) {
    return finalSchedule.filter((e) => e.day === dayIdx && e.slot === slotIdx);
  }

  const unscheduled = classResults.filter((r) => r.sessions.length === 0);

  const sortedShifts = shifts ? [...shifts].sort((a, b) => a.startTime.localeCompare(b.startTime)) : [];

  return (
    <div>
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <button
          onClick={onBack}
          style={{
            padding: '7px 12px',
            borderRadius: 8,
            border: '0.5px solid #ccc',
            background: '#fff',
            fontSize: 13,
            cursor: 'pointer',
            color: '#555',
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          ← Quay lại
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a' }}>Kết quả xếp lịch</h1>
          <p style={{ fontSize: 13, color: '#666', marginTop: 3 }}>
            API Result · {selectedClasses.length} lớp · Tổng điểm:{' '}
            <strong style={{ color: PRIMARY }}>{totalScore}</strong>
          </p>
        </div>
        <button
          onClick={onReset}
          style={{
            padding: '7px 14px',
            borderRadius: 8,
            border: '0.5px solid #ccc',
            background: '#fff',
            fontSize: 12,
            cursor: 'pointer',
            color: '#555',
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          ↺ Xếp lại
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { val: selectedClasses.length, lbl: 'Lớp đưa vào' },
          { val: classResults.filter((r) => r.sessions.length > 0).length, lbl: 'Lớp đã xếp được' },
          { val: totalScore, lbl: 'Tổng điểm' },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              background: '#fff',
              border: '0.5px solid #ddd',
              borderRadius: 10,
              padding: '12px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 600, color: i === 2 ? GREEN : PRIMARY }}>{s.val}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {unscheduled.length > 0 && (
        <div
          style={{
            background: '#FEF3C7',
            border: '0.5px solid #FDE68A',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 12,
            color: '#92400E',
            marginBottom: 12,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <span>⚠</span>
          <span>
            <strong>{unscheduled.length} lớp không xếp được</strong>: {unscheduled.map((r) => r.cls.name).join(', ')} —
            có thể do xung đột phòng/GV hoặc ràng buộc quá khắt khe.
          </span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1.5px solid #e0e0dc', marginBottom: 16 }}>
        {(['timetable', 'scores'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setActiveView(key)}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 500,
              color: activeView === key ? PRIMARY : '#888',
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              borderBottom: activeView === key ? `2.5px solid ${PRIMARY}` : '2.5px solid transparent',
              marginBottom: -1.5,
              transition: 'all .15s',
            }}
          >
            {key === 'timetable' ? '📅 Thời khoá biểu' : '★ Phân tích điểm'}
          </button>
        ))}
      </div>

      {/* Timetable View */}
      {activeView === 'timetable' && (
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {classResults
              .filter((r) => r.sessions.length > 0)
              .map((r) => {
                // Fix 5: Fallback về CLASS_COLORS[0] thay vì cả mảng
                const c = CLASS_COLORS[r.colorIdx % CLASS_COLORS.length] || CLASS_COLORS[0];
                return (
                  <div
                    key={r.cls._id}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#555' }}
                  >
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: c.dot, flexShrink: 0 }} />
                    {r.cls.name}
                  </div>
                );
              })}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr>
                  <th
                    style={{
                      background: '#f0f0ee',
                      padding: '7px 10px',
                      border: '0.5px solid #ddd',
                      fontWeight: 500,
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Ca
                  </th>
                  {DAYS_FULL.map((d) => (
                    <th
                      key={d}
                      style={{
                        background: '#f0f0ee',
                        padding: '7px 10px',
                        border: '0.5px solid #ddd',
                        fontWeight: 500,
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        minWidth: 90,
                      }}
                    >
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedShifts?.map((slotLabel, slotIdx) => (
                  <tr key={slotIdx}>
                    <td
                      style={{
                        padding: '4px 8px',
                        border: '0.5px solid #eee',
                        fontWeight: 500,
                        background: '#f5f5f3',
                        fontSize: 11,
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {slotLabel.startTime} - {slotLabel.endTime}
                      <br />
                      <span style={{ fontSize: 9, color: '#999' }}>{slotLabel.name || `Ca ${slotIdx + 1}`}</span>
                    </td>
                    {DAYS.map((_, dayIdx) => {
                      const entries = getCellEntries(dayIdx, slotIdx);
                      return (
                        <td
                          key={dayIdx}
                          style={{ padding: '4px 6px', border: '0.5px solid #eee', verticalAlign: 'top' }}
                        >
                          {entries.length === 0 ? (
                            <span style={{ color: '#ddd' }}>—</span>
                          ) : (
                            entries.map((e) => {
                              const c = CLASS_COLORS[e.classIdx % CLASS_COLORS.length] || CLASS_COLORS[0];
                              return (
                                <div
                                  key={`${e.classId}_${e.shiftId}`}
                                  style={{
                                    background: c.bg,
                                    color: c.tc,
                                    borderRadius: 6,
                                    padding: '4px 6px',
                                    fontSize: 10,
                                    fontWeight: 500,
                                    lineHeight: 1.5,
                                    margin: '2px 0',
                                  }}
                                >
                                  <div style={{ fontSize: 11, fontWeight: 700 }}>{e.className}</div>
                                  <div style={{ opacity: 0.8 }}>{e.roomName} </div>
                                  <div style={{ fontSize: 9, opacity: 0.7, marginTop: 1 }}>★ {e.slotScore}đ</div>
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

      {/* Scores View */}
      {activeView === 'scores' && (
        <div>
          {classResults.map((r) => {
            // Fix 5: Fallback về CLASS_COLORS[0] thay vì cả mảng
            const c = CLASS_COLORS[r.colorIdx % CLASS_COLORS.length] || CLASS_COLORS[0];
            const maxScore = Math.max(...classResults.map((x) => x.totalScore), 1);
            const pct = Math.max(0, Math.round((r.totalScore / maxScore) * 100));
            const sortedDays = [...(r.days || [])].sort((a: number, b: number) => a - b);
            const gaps =
              sortedDays.length > 1 ? sortedDays.slice(1).map((d: number, i: number) => d - sortedDays[i]) : [];

            return (
              <div
                key={r.cls._id}
                style={{
                  background: '#fff',
                  border: '0.5px solid #ddd',
                  borderRadius: 10,
                  padding: '12px 14px',
                  marginBottom: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
                  <div style={{ fontWeight: 600, fontSize: 13, color: c.tc, flex: 1 }}>{r.cls.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: r.totalScore > 0 ? GREEN : '#DC2626' }}>
                    {r.totalScore}đ
                  </div>
                </div>
                {r.sessions.length > 0 ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ flex: 1, background: '#eee', borderRadius: 20, height: 8 }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: 8,
                            borderRadius: 20,
                            background: c.dot,
                            transition: 'width .5s',
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#666', marginBottom: 6 }}>
                      {sortedDays.map((d: number) => DAYS_FULL[d]).join(' → ')}
                      {gaps.length > 0 && <span style={{ color: '#888' }}> (gap: {gaps.join(', ')} ngày)</span>}
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {r.sessions.map((s: any, si: number) => {
                        const shiftObj = sortedShifts[s.slot];

                        return (
                          <div
                            key={si}
                            style={{
                              background: c.bg,
                              color: c.tc,
                              borderRadius: 6,
                              padding: '3px 8px',
                              fontSize: 11,
                              fontWeight: 500,
                            }}
                          >
                            {DAYS_FULL[s.day]}{' '}
                            {shiftObj ? `${shiftObj.startTime}–${shiftObj.endTime}` : `Ca ${s.slot + 1}`} · {s.room}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      fontSize: 12,
                      color: '#DC2626',
                      background: '#FEE2E2',
                      padding: '6px 10px',
                      borderRadius: 6,
                    }}
                  >
                    ⚠ Backend không tìm được lịch phù hợp
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div
        style={{
          marginTop: 20,
          display: 'flex',
          justifyContent: 'space-between',
          background: '#fff',
          border: '0.5px solid #ddd',
          borderRadius: 10,
          padding: '12px 16px',
        }}
      >
        <button
          onClick={onBack}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            border: '0.5px solid #ccc',
            background: '#fff',
            cursor: 'pointer',
            color: '#444',
          }}
        >
          ← Sửa preference
        </button>
        <button
          onClick={onReset}
          style={{
            padding: '8px 20px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            border: 'none',
            background: PRIMARY,
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          ✓ Xác nhận & lưu lịch
        </button>
      </div>
    </div>
  );
}

export default Page3;
