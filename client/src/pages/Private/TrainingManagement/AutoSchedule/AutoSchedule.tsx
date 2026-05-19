import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import useFetch from '../../../../hooks/useFetch';
import { classService } from '../../../../services/class.service';
import { classRequestService } from '../../../../services/classRequest.service';
import type { IClass } from '../../../../types/class.type';
import type { IClassRequest } from '../../../../types/classRequest.type';

import Page1 from './Page1';
import Page2 from './Page2';
import Page3 from './Page3';
import LoadingOverlay from '../../../../components/LoadingOverlay';
import { roomService } from '../../../../services/room.service';
import { shiftService } from '../../../../services/shift.service';

interface IBackendResult {
  finalSchedule: any[];
  classResults: any[];
  totalScore: number;
}

const STEPS = ['Chọn lớp', 'Tùy chọn & xác nhận', 'Kết quả'];

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
      setLoading(false);
    }
  };

  const handleRunAlgorithm = async () => {
    setLoading(true);
    const startTime = performance.now();
    try {
      const response = await classRequestService.runGeneticAlgorithm();
      const endTime = performance.now();
      console.log(`⏱️ Thuật toán chạy thành công trong: ${((endTime - startTime) / 1000).toFixed(2)} giây`);
      if (!response.success) throw new Error('Thuật toán chạy thất bại');
      if (page === 3) await loadSavedSchedule();
      setPage(3);
      localStorage.setItem('schedule_page', '3');
    } catch (error: any) {
      console.error('Lỗi chạy GA:', error);
      alert(error?.response?.data?.message || 'Không thể chạy thuật toán xếp lịch.');
      setLoading(false);
    }
  };

  const loadSavedSchedule = async () => {
    setLoading(true);
    try {
      const res = await classRequestService.getClassRequests();
      if (!res.success || !res.data) return;
      const classesWithSchedule = res.data;
      setDraftClasses(classesWithSchedule);

      const shiftsRes = await shiftService.getShifts({ limit: 1000 });
      const sortedShiftsForMap = shiftsRes?.data
        ? [...shiftsRes.data].sort((a: any, b: any) => a.startTime.localeCompare(b.startTime))
        : [];
      setAllShifts(sortedShiftsForMap);

      const shiftIndexMap = new Map<string, number>();
      sortedShiftsForMap.forEach((s: any, i: number) => shiftIndexMap.set(s._id?.toString(), i));

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
        roomNameMap.set(id, roomRes?.success && roomRes.data?.name ? roomRes.data.name : `Phòng #${id.slice(-4)}`);
      });

      const finalSchedule: any[] = [];
      const classResults: any[] = [];
      let totalScore = 0;

      classesWithSchedule.forEach((cls: any, i: number) => {
        const clsIdStr = cls._id.toString();
        const clsName = cls.name ?? `Lớp #${clsIdStr.slice(-4)}`;
        let clsTotalScore = 0;
        const sessions: any[] = [];

        (cls.schedule || []).forEach((slot: any) => {
          const shiftIdStr = slot.shiftId?.toString();
          const roomIdStr = slot.roomId?.toString();
          const displayDay = slot.day - 1;
          const slotIdx = shiftIndexMap.get(shiftIdStr) ?? 0;
          const roomName = roomNameMap.get(roomIdStr) ?? `Phòng #${roomIdStr?.slice(-4)}`;

          finalSchedule.push({
            classId: clsIdStr,
            className: clsName,
            classIdx: i,
            day: displayDay,
            slot: slotIdx,
            shiftId: shiftIdStr,
            roomName,
            slotScore: slot.slotScore ?? 0,
          });
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

      setResult({ finalSchedule, classResults, totalScore });
    } catch (error) {
      console.error('Lỗi khi tải lịch từ DB:', error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 p-8 animate-in fade-in duration-500">
      {loading && <LoadingOverlay />}

      <div className="max-w-5xl mx-auto">
        {/* Step Indicator */}
        <div className="flex items-center mb-8">
          {STEPS.map((label, i) => {
            const step = i + 1;
            const done = page > step;
            const active = page === step;
            return (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200
                    ${
                      active
                        ? 'bg-primary text-white shadow-md shadow-primary/30'
                        : done
                          ? 'bg-primary/10 text-primary'
                          : 'bg-white border border-gray-200 text-gray-400'
                    }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0
                      ${active ? 'bg-white/25 text-white' : done ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}
                  >
                    {done ? <CheckCircle2 size={12} /> : step}
                  </span>
                  {label}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 h-px transition-colors duration-200 ${done ? 'bg-primary' : 'bg-gray-200'}`} />
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
            shifts={allShifts}
            onBack={() => setPage(2)}
            onRerun={handleRunAlgorithm}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
