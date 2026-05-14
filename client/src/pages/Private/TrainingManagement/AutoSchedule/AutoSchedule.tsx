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

  const [allShifts, setAllShifts] = useState<any[]>([]);

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
    if (page === 3) loadSavedSchedule();
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

  // ── BƯỚC 2 → 3: Chạy GA ──────────────────────────────────────────
  const handleRunAlgorithm = async () => {
    setLoading(true);
    const startTime = performance.now();
    try {
      const response = await classRequestService.runGeneticAlgorithm();

      const endTime = performance.now();
      const executionTimeSeconds = ((endTime - startTime) / 1000).toFixed(2);
      console.log(`⏱️ Thuật toán chạy thành công trong: ${executionTimeSeconds} giây`);

      if (!response.success) throw new Error('Thuật toán chạy thất bại');

      setPage(3);
      localStorage.setItem('schedule_page', '3');
    } catch (error: any) {
      console.error('Lỗi chạy GA:', error);
      alert(error?.response?.data?.message || 'Không thể chạy thuật toán xếp lịch.');
      setLoading(false);
    }
  };

  // ── BƯỚC 3: Fetch lịch đã lưu từ DB và map dữ liệu cho Page 3 ────
  const loadSavedSchedule = async () => {
    setLoading(true);
    try {
      // 1. Fetch ClassRequests (lúc này đã có data trong mảng schedule)
      const res = await classRequestService.getClassRequests();
      if (!res.success || !res.data) return;

      const classesWithSchedule = res.data;
      setDraftClasses(classesWithSchedule); // Cập nhật state lớp học

      // 2. Fetch Shifts (Ca học) để hiển thị tên ca
      const shiftsRes = await shiftService.getShifts({ limit: 1000 });
      const sortedShiftsForMap = shiftsRes?.data
        ? [...shiftsRes.data].sort((a: any, b: any) => a.startTime.localeCompare(b.startTime))
        : [];
      setAllShifts(sortedShiftsForMap);

      const shiftIndexMap = new Map<string, number>();
      sortedShiftsForMap.forEach((s: any, i: number) => {
        shiftIndexMap.set(s._id?.toString(), i);
      });

      // 3. Resolve tên phòng học từ tất cả các slot đã được xếp
      const allRoomIds = new Set<string>();
      classesWithSchedule.forEach((cls: any) => {
        cls.schedule?.forEach((slot: any) => {
          if (slot.roomId) allRoomIds.add(slot.roomId.toString());
        });
      });

      const uniqueRoomIds = [...allRoomIds];
      const roomResults = await Promise.all(uniqueRoomIds.map((id) => roomService.getRoomById(id).catch(() => null)));
      const roomNameMap = new Map<string, string>();
      uniqueRoomIds.forEach((id, i) => {
        const roomRes = roomResults[i];
        if (roomRes?.success && roomRes.data?.name) roomNameMap.set(id, roomRes.data.name);
        else roomNameMap.set(id, `Phòng #${id.slice(-4)}`);
      });

      // 4. Build finalSchedule & classResults từ dữ liệu DB
      const finalSchedule: any[] = [];
      const classResults: any[] = [];
      let totalScore = 0;

      classesWithSchedule.forEach((cls: any, i: number) => {
        const clsIdStr = cls._id.toString();
        const clsName = cls.name ?? `Lớp #${clsIdStr.slice(-4)}`;
        let clsTotalScore = 0;
        const sessions: any[] = [];

        (cls.schedule || []).forEach((slot: any) => {
          // Xử lý ObjectId an toàn
          const shiftIdStr = slot.shiftId?.toString();
          const roomIdStr = slot.roomId?.toString();

          // Chuyển đổi Day: Backend 1-7 (T2-CN) -> Frontend 0-6 (T2-CN)
          const displayDay = slot.day - 1;
          const slotIdx = shiftIndexMap.get(shiftIdStr) ?? 0;
          const roomName = roomNameMap.get(roomIdStr) ?? `Phòng #${roomIdStr?.slice(-4)}`;

          // Đẩy vào bảng tổng
          finalSchedule.push({
            classId: clsIdStr,
            className: clsName,
            classIdx: i, // dùng index để lấy màu sắc
            day: displayDay,
            slot: slotIdx,
            shiftId: shiftIdStr,
            roomName: roomName,
            slotScore: slot.slotScore ?? 0,
          });

          // Đẩy vào bảng chi tiết từng lớp
          sessions.push({
            day: displayDay,
            slot: slotIdx,
            shiftId: shiftIdStr,
            room: roomName,
            slotScore: slot.slotScore ?? 0,
          });

          clsTotalScore += slot.slotScore ?? 0;
        });

        totalScore += clsTotalScore;

        classResults.push({
          cls,
          days: [...new Set(sessions.map((s: any) => s.day))],
          sessions,
          totalScore: clsTotalScore,
          colorIdx: i,
        });
      });

      // Cập nhật state cuối cùng cho Page3
      setResult({ finalSchedule, classResults, totalScore });
    } catch (error) {
      console.error('Lỗi khi tải lịch từ DB:', error);
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
