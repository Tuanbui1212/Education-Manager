import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  DoorOpen,
  Users,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  User as UserIcon,
} from 'lucide-react';
import { startOfWeek, addDays, subWeeks, addWeeks, format, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';

import useFetch from '../../../../hooks/useFetch';
import { roomService } from '../../../../services/room.service';
import { shiftService } from '../../../../services/shift.service';
import { scheduleService } from '../../../../services/schedule.service';

import { getRoomStatusStyles } from '../../../../utils/format.util';
import { PATHS } from '../../../../utils/constants';

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 })); // Bắt đầu từ Thứ 2

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const {
    data: roomData,
    loading: roomLoading,
    error: roomError,
  } = useFetch(roomService.getRoomById, id as string, [id]);

  const { data: shiftsData } = useFetch(shiftService.getShifts, { limit: 100 }, []);
  const shiftsList = useMemo(() => {
    const list = Array.isArray(shiftsData) ? shiftsData : (shiftsData as any)?.data || [];
    return list.sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
  }, [shiftsData]);

  const { data: schedulesResponse, loading: scheduleLoading } = useFetch(
    scheduleService.getSchedules,
    { roomId: id, limit: 1000 },
    [id, currentWeekStart],
  );

  const schedulesList = Array.isArray(schedulesResponse) ? schedulesResponse : (schedulesResponse as any)?.data || [];

  const getScheduleForCell = (date: Date, shiftId: string) => {
    return schedulesList.find((schedule: any) => {
      const scheduleDate = new Date(schedule.date);
      const isSameDate = isSameDay(scheduleDate, date);
      const isSameShift =
        typeof schedule.shiftId === 'object' ? schedule.shiftId._id === shiftId : schedule.shiftId === shiftId;
      return isSameDate && isSameShift;
    });
  };

  const handlePrevWeek = () => setCurrentWeekStart((prev) => subWeeks(prev, 1));
  const handleNextWeek = () => setCurrentWeekStart((prev) => addWeeks(prev, 1));
  const handleCurrentWeek = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  if (roomLoading)
    return <div className="p-8 text-center text-gray-500 animate-pulse">Đang tải thông tin phòng...</div>;
  if (roomError || !roomData)
    return <div className="p-8 text-center text-red-500">Không tìm thấy thông tin phòng.</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-start mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <DoorOpen className="text-violet-600" size={28} />
              {roomData.name}
            </h1>
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="flex items-center gap-1.5 text-gray-600 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm">
                <Users size={14} className="text-blue-500" />
                Sức chứa: <strong className="text-gray-800">{roomData.capacity} học viên</strong>
              </span>
              <span className={`px-3 py-1 rounded-full font-bold shadow-sm ${getRoomStatusStyles(roomData.status)}`}>
                {roomData.status === 'ACTIVE'
                  ? 'Đang hoạt động'
                  : roomData.status === 'MAINTENANCE'
                    ? 'Bảo trì'
                    : 'Đóng cửa'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BẢNG ĐIỀU KHIỂN TUẦN */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 flex flex-wrap justify-between items-center gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Lịch sử dụng phòng</h3>
            <p className="text-xs text-gray-500">Quản lý các lớp học đang chiếm dụng phòng này</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 shadow-inner">
          <button
            onClick={handlePrevWeek}
            className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-violet-600 hover:shadow-sm"
            title="Tuần trước"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={handleCurrentWeek}
            className="px-4 py-2 font-bold text-sm bg-white text-violet-700 rounded-lg shadow-sm border border-violet-100"
          >
            {format(weekDays[0], 'dd/MM/yyyy')} - {format(weekDays[6], 'dd/MM/yyyy')}
          </button>

          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-violet-600 hover:shadow-sm"
            title="Tuần sau"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* MA TRẬN LỊCH HỌC */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr>
                <th className="p-4 border-b border-r border-gray-200 bg-gray-50 w-[100px] text-center font-bold text-gray-600">
                  <Clock size={18} className="mx-auto text-gray-400" />
                </th>
                {weekDays.map((day, index) => (
                  <th
                    key={index}
                    className="p-3 border-b border-r border-gray-200 bg-primary text-white text-center w-[12.8%]"
                  >
                    <div className="text-sm font-bold uppercase tracking-wider">
                      {format(day, 'EEEE', { locale: vi })}
                    </div>
                    <div className="text-xs text-violet-200 mt-1">{format(day, 'dd/MM/yyyy')}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scheduleLoading ? (
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <tr key={rIdx}>
                    <td className="p-4 border-b border-r border-gray-200 bg-gray-50/50">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                    </td>
                    {Array.from({ length: 7 }).map((_, cIdx) => (
                      <td key={cIdx} className="p-2 border-b border-r border-gray-100">
                        <div className="h-24 bg-gray-50 rounded-xl animate-pulse border border-gray-100"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : shiftsList.length > 0 ? (
                shiftsList.map((shift: any) => (
                  <tr key={shift._id} className="group/row">
                    <td className="p-3 border-b border-r border-gray-200 bg-gray-50 text-center align-middle group-hover/row:bg-gray-100 transition-colors">
                      <div className="font-bold text-gray-700 text-sm">{shift.name}</div>
                      <div className="text-[11px] text-gray-500 font-medium mt-1 bg-white px-2 py-0.5 rounded-md border border-gray-200 inline-block shadow-sm">
                        {shift.startTime} - {shift.endTime}
                      </div>
                    </td>

                    {weekDays.map((day, index) => {
                      const cellSchedule = getScheduleForCell(day, shift._id);

                      return (
                        <td key={index} className="p-2 border-b border-r border-gray-100 bg-white align-top relative">
                          {cellSchedule ? (
                            // CÓ LỚP HỌC
                            <div
                              onClick={() =>
                                navigate(PATHS.TRAINING_CLASSES_ID.replace(':id', cellSchedule.classId?._id || ''))
                              }
                              className="h-full bg-violet-50 border border-violet-200 rounded-xl p-3 cursor-pointer hover:bg-violet-100 hover:shadow-md transition-all group/card flex flex-col gap-2"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <h4 className="font-bold text-sm text-violet-800 line-clamp-2 group-hover/card:text-violet-900">
                                  {cellSchedule.classId?.name || 'N/A'}
                                </h4>
                              </div>

                              <div className="mt-auto space-y-1.5 pt-2 border-t border-violet-200/60">
                                <div className="flex items-center gap-1.5 text-xs text-violet-700 font-medium">
                                  <UserIcon size={12} className="text-violet-500" />
                                  <span className="truncate">
                                    {cellSchedule.teacherId?.fullName || 'Chưa phân công'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                  <BookOpen size={12} className="text-gray-400" />
                                  <span className="truncate uppercase font-bold">{shift.name}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // TRỐNG LỊCH
                            <div className="h-full min-h-[100px] rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 hover:bg-gray-50 transition-all border border-dashed border-transparent hover:border-gray-300">
                              <span className="text-xs text-gray-400 font-medium italic">Trống</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-gray-500">
                    Không có dữ liệu ca học. Vui lòng cấu hình ca học trước.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
