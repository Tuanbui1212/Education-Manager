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
import { PRIMARY, SLOTS } from '../../../../utils/constants';
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

  // Dữ liệu nháp kéo từ DB về ở Bước 2
  const [draftClasses, setDraftClasses] = useState<IClassRequest[]>([]);
  const [prefs, setPrefs] = useState<Record<string, string[]>>({});

  const [result, setResult] = useState<IBackendResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Khi ứng dụng load, nếu đang ở Bước 2, hãy kéo dữ liệu nháp về ngay
    if (page === 2) {
      loadDraftClasses();
    }
  }, [page]);

  // --- BƯỚC 1: LẤY DANH SÁCH LỚP CHƯA CÓ LỊCH TỪ BẢNG THẬT ---
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

  // --- BƯỚC 1 -> BƯỚC 2: TẠO SNAPSHOT VÀO BẢNG TẠM ---
  const handleGoToStep2 = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      // 1. Dọn dẹp các bản nháp cũ của người dùng này (nếu có) để làm mới hoàn toàn
      await classRequestService.deleteMyClassRequests();

      // 2. Tạo bản nháp mới từ danh sách ID đã chọn
      await classRequestService.createClassRequest(selectedIds);

      setPage(2); // Chuyển trang thành công
      localStorage.setItem('schedule_page', '2');
    } catch (error) {
      console.error('Lỗi khởi tạo request:', error);
      alert('Không thể khởi tạo phiên xếp lịch trên máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  // --- BƯỚC 2: LẤY DỮ LIỆU NHÁP VÀ CẬP NHẬT PREFERENCES ---
  useEffect(() => {
    if (page === 2) {
      loadDraftClasses();
    }
  }, [page]);

  const loadDraftClasses = async () => {
    setLoading(true);
    try {
      const res = await classRequestService.getClassRequests();
      if (res.success && res.data) {
        setDraftClasses(res.data);

        // Map lại các options đã lưu vào state prefs để hiển thị UI
        const mappedPrefs: Record<string, string[]> = {};
        res.data.forEach((draft: IClassRequest) => {
          mappedPrefs[draft._id as string] = draft.optionalRequirements || [];
        });
        setPrefs(mappedPrefs);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu nháp:', error);
      handleReset(); // Nếu lỗi thì cho về Bước 1
    } finally {
      setLoading(false);
    }
  };

  const updatePrefs = async (draftId: string, newReqs: string[]) => {
    // Optimistic UI: Cập nhật giao diện trước cho mượt
    setPrefs((prev) => ({ ...prev, [draftId]: newReqs }));

    // Gửi ngầm xuống Database để update (Không cần chờ)
    try {
      await classRequestService.updateClassRequest(draftId, { optionalRequirements: newReqs });
    } catch (error) {
      console.error('Lỗi đồng bộ cấu hình với DB:', error);
    }
  };

  // --- BƯỚC 2 -> BƯỚC 3: CHẠY THUẬT TOÁN  ---
  const handleRunAlgorithm = async () => {
    setLoading(true);
    try {
      const response = await classRequestService.runGeneticAlgorithm();
      if (response.success && response.data) {
        const bestChromosome: any[] = response.data;

        const finalSchedule = bestChromosome.map((gene: any, idx: number) => ({
          classId: gene.classRequestId,
          className: gene.className ?? `Lớp ${idx + 1}`,
          classIdx: gene.classIdx ?? idx,
          day: gene.day,
          slot: gene.slotIndex ?? gene.slot ?? 0,
          roomName: gene.roomName ?? gene.roomId,
          slotScore: gene.slotScore ?? 0,
        }));

        const classResults = draftClasses.map((cls, i) => {
          const sessions = bestChromosome
            .filter((g: any) => g.classRequestId?.toString() === (cls._id as string)?.toString())
            .map((g: any) => ({
              day: g.day,
              slot: g.slotIndex ?? g.slot ?? 0,
              room: g.roomName ?? g.roomId,
            }));

          const days = [...new Set(sessions.map((s: any) => s.day))];

          return {
            cls,
            days,
            sessions,
            totalScore: sessions.reduce((sum: number, s: any) => sum + (s.slotScore ?? 0), 0),
            colorIdx: i,
          };
        });

        const totalScore = classResults.reduce((sum, r) => sum + r.totalScore, 0);

        setResult({ finalSchedule, classResults, totalScore });

        setPage(3);
      }
    } catch (error: any) {
      console.error('Lỗi chạy GA:', error);
      alert(error?.response?.data?.message || 'Không thể chạy thuật toán xếp lịch.');
    } finally {
      setLoading(false);
    }
  };

  // --- DỌN DẸP & RESET ---
  const handleReset = async () => {
    setLoading(true);
    try {
      await classRequestService.deleteMyClassRequests();
      localStorage.removeItem('schedule_page');
      setPage(1);
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

  const handleBackFromStep3 = () => {
    setPage(2);
  };

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
                    style={{ width: 24, height: 1, background: done ? PRIMARY : '#ddd', transition: 'background .2s' }}
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
            onBack={handleBackFromStep3}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
