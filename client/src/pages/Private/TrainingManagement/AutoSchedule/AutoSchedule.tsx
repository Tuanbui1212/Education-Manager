import { useEffect, useState } from 'react';
import useFetch from '../../../../hooks/useFetch';
import { classService } from '../../../../services/class.service';
import { classRequestService } from '../../../../services/classRequest.service';
import type { IClass } from '../../../../types/class.type';
import type { IClassRequest } from '../../../../types/classRequest.type';

import Page1 from './Page1';
import Page2 from './Page2';
import Page3 from './Page3';
import LoadingOverlay from '../../../../components/LoadingOverlay';
import { PRIMARY } from '../../../../utils/constants';
import { roomService } from '../../../../services/room.service';
import { shiftService } from '../../../../services/shift.service';

interface IBackendResult {
  finalSchedule: any[];
  classResults: any[];
  totalScore: number;
}

export default function SchedulingUI() {
  const [page, setPage] = useState<number>(() => {
    const savedPage = localStorage.getItem('schedule_page');
    return savedPage ? parseInt(savedPage, 10) : 1;
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [draftClasses, setDraftClasses] = useState<IClassRequest[]>([]);
  const [prefs, setPrefs] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<IBackendResult | null>(null);
  const [loading, setLoading] = useState(false);

  // State lưu trữ ca học để truyền xuống Page3 tránh bất đồng bộ
  const [allShifts, setAllShifts] = useState<any[]>([]);

  // ── BƯỚC 1: Lấy danh sách lớp chưa có lịch ──────────────────────
  const {
    data: ClassNoSchedule,
    loading: ClassNoScheduleLoading,
    error: ClassNoScheduleError,
    refetch: ClassNoScheduleRefetch,
  } = useFetch(classService.getClasses, { schedule: false });

  const apiData: IClass[] = ClassNoSchedule || [];

  const toggleClass = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleAll = () =>
    setSelectedIds((prev) => (prev.length === apiData.length ? [] : apiData.map((c) => c._id as string)));

  // ── BƯỚC 1 → 2: Tạo snapshot vào bảng tạm ──────────────────────
  const handleGoToStep2 = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      await classRequestService.deleteMyClassRequests();
      await classRequestService.createClassRequest(selectedIds);
      setPage(2);
      localStorage.setItem('schedule_page', '2');
    } catch (error) {
      console.error('Lỗi khởi tạo request:', error);
      alert('Không thể khởi tạo phiên xếp lịch trên máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  // ── BƯỚC 2: Load dữ liệu nháp ───────────────────────────────────
  useEffect(() => {
    if (page === 2) loadDraftClasses();
  }, [page]);

  const loadDraftClasses = async () => {
    setLoading(true);
    try {
      const res = await classRequestService.getClassRequests();
      if (res.success && res.data) {
        setDraftClasses(res.data);
        const mappedPrefs: Record<string, string[]> = {};
        res.data.forEach((draft: IClassRequest) => {
          mappedPrefs[draft._id as string] = draft.optionalRequirements || [];
        });
        setPrefs(mappedPrefs);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu nháp:', error);
      handleReset();
    } finally {
      setLoading(false);
    }
  };

  const updatePrefs = async (draftId: string, newReqs: string[]) => {
    setPrefs((prev) => ({ ...prev, [draftId]: newReqs }));
    try {
      await classRequestService.updateClassRequest(draftId, { optionalRequirements: newReqs });
    } catch (error) {
      console.error('Lỗi đồng bộ cấu hình với DB:', error);
    }
  };

  // ── BƯỚC 2 → 3: Chạy GA và xử lý dữ liệu hiển thị ────────────────
  const handleRunAlgorithm = async () => {
    setLoading(true);
    try {
      const response = await classRequestService.runGeneticAlgorithm();
      if (!response.success || !response.data) throw new Error('Không có dữ liệu từ GA');

      const raw = response.data;
      const bestChromosome: any[] = Array.isArray(raw) ? raw : raw;

      // 1. Lấy dữ liệu Ca học và lưu vào state để Page3 dùng ngay
      const shiftsRes = await shiftService.getShifts({ limit: 1000 });

      const sortedShiftsForMap: any[] =
        shiftsRes && shiftsRes.success && shiftsRes.data
          ? [...shiftsRes.data].sort((a: any, b: any) => a.startTime.localeCompare(b.startTime))
          : [];
      setAllShifts(sortedShiftsForMap);

      const shiftIndexMap = new Map<string, number>();
      sortedShiftsForMap.forEach((s: any, i: number) => {
        shiftIndexMap.set(s._id?.toString(), i);
      });

      // 2. Map Tên lớp từ draftClasses
      const classNameMap = new Map<string, string>();
      draftClasses.forEach((cls: any) => {
        classNameMap.set((cls._id as string).toString(), cls.name ?? `Lớp #${(cls._id as string).slice(-4)}`);
      });

      // 3. Resolve tên phòng học
      const uniqueRoomIds = [...new Set(bestChromosome.map((g: any) => g.roomId?.toString()))];
      const roomResults = await Promise.all(uniqueRoomIds.map((id) => roomService.getRoomById(id).catch(() => null)));
      const roomNameMap = new Map<string, string>();
      uniqueRoomIds.forEach((id, i) => {
        const res = roomResults[i];
        if (res?.success && res.data?.name) roomNameMap.set(id, res.data.name);
        else roomNameMap.set(id, `Phòng #${id.slice(-4)}`);
      });

      // 4. Build finalSchedule (Xử lý mapping DAY Index)
      const finalSchedule = bestChromosome.map((gene: any, idx: number) => {
        const classIdStr = gene.classRequestId?.toString();
        const roomIdStr = gene.roomId?.toString();
        const shiftIdStr = gene.shiftId?.toString();

        // Chuyển đổi Day: Backend 0 (CN) -> Frontend 6. Backend 1 (T2) -> Frontend 0.
        const displayDay = gene.day === 0 ? 6 : gene.day - 1;

        return {
          classId: classIdStr,
          className: classNameMap.get(classIdStr) ?? `Lớp ${idx + 1}`,
          classIdx: gene.classIdx ?? idx,
          day: displayDay,
          slot: shiftIndexMap.get(shiftIdStr) ?? 0,
          shiftId: shiftIdStr,
          roomName: roomNameMap.get(roomIdStr) ?? `Phòng #${roomIdStr?.slice(-4)}`,
          slotScore: gene.slotScore ?? 0,
        };
      });

      // 5. Build classResults cho View Phân tích điểm
      const classResults = draftClasses.map((cls, i) => {
        const clsIdStr = (cls._id as string)?.toString();
        const sessions = bestChromosome
          .filter((g: any) => g.classRequestId?.toString() === clsIdStr)
          .map((g: any) => ({
            day: g.day === 0 ? 6 : g.day - 1,
            slot: shiftIndexMap.get(g.shiftId?.toString()) ?? 0,
            shiftId: g.shiftId?.toString(),
            room: roomNameMap.get(g.roomId?.toString()) ?? `Phòng #${g.roomId?.toString()?.slice(-4)}`,
            slotScore: g.slotScore ?? 0,
          }));

        return {
          cls,
          days: [...new Set(sessions.map((s: any) => s.day))],
          sessions,
          totalScore: sessions.reduce((sum: number, s: any) => sum + (s.slotScore ?? 0), 0),
          colorIdx: i,
        };
      });

      const totalScore = classResults.reduce((sum, r) => sum + r.totalScore, 0);

      setResult({ finalSchedule, classResults, totalScore });
      setPage(3);
    } catch (error: any) {
      console.error('Lỗi chạy GA:', error);
      alert(error?.response?.data?.message || 'Không thể chạy thuật toán xếp lịch.');
    } finally {
      setLoading(false);
    }
  };

  // ── Reset ────────────────────────────────────────────────────────
  const handleReset = async () => {
    setLoading(true);
    try {
      await classRequestService.deleteMyClassRequests();
      localStorage.removeItem('schedule_page');
    } catch (e) {
      console.error('Lỗi khi dọn dẹp DB', e);
    } finally {
      setPage(1);
      setSelectedIds([]);
      setPrefs({});
      setDraftClasses([]);
      setResult(null);
      setLoading(false);
    }
  };

  const handleBackFromStep3 = () => setPage(2);

  const steps = ['Chọn lớp', 'Tùy chọn & xác nhận', 'Kết quả'];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f5f3',
        fontFamily: 'system-ui, sans-serif',
        color: '#1a1a1a',
        fontSize: 14,
      }}
    >
      {loading && <LoadingOverlay />}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px' }}>
        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24, fontSize: 12 }}>
          {steps.map((label, i) => {
            const step = i + 1;
            const done = page > step;
            const active = page === step;
            return (
              <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 12px',
                    borderRadius: 20,
                    background: active ? PRIMARY : done ? '#E9E8FC' : '#e8e8e4',
                    color: active ? '#fff' : done ? PRIMARY : '#999',
                    fontWeight: active ? 600 : 400,
                    fontSize: 12,
                    transition: 'all .2s',
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: active ? 'rgba(255,255,255,.25)' : done ? PRIMARY : '#ccc',
                      color: active ? '#fff' : done ? '#fff' : '#888',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {done ? '✓' : step}
                  </span>
                  {label}
                </div>
                {i < 2 && (
                  <div
                    style={{
                      width: 24,
                      height: 1,
                      background: done ? PRIMARY : '#ddd',
                      transition: 'background .2s',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {page === 1 && (
          <Page1
            selectedIds={selectedIds}
            onToggle={toggleClass}
            onToggleAll={toggleAll}
            onNext={handleGoToStep2}
            data={apiData}
            loading={ClassNoScheduleLoading}
            error={ClassNoScheduleError}
            refetch={ClassNoScheduleRefetch}
          />
        )}
        {page === 2 && (
          <Page2
            selectedClasses={draftClasses as any}
            prefs={prefs}
            onChangePrefs={updatePrefs}
            onBack={handleReset}
            onRun={handleRunAlgorithm}
          />
        )}
        {page === 3 && result && (
          <Page3
            result={result}
            selectedClasses={draftClasses as any}
            shifts={allShifts} // Truyền dữ liệu shifts đã load ở bước xử lý thuật toán
            onBack={handleBackFromStep3}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
