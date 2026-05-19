import { CheckCircle2, ArrowLeft } from 'lucide-react';
import useFetch from '../../../../hooks/useFetch';
import { roomService } from '../../../../services/room.service';
import Button from '../../../../components/Button';

const DAY_LABELS = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

const SchedulePreview = ({ data, onBack }: { data: any[]; onBack: () => void }) => {
  const { data: rooms } = useFetch(roomService.getRooms, { limit: 1000 });
  console.log('Rooms from API:', rooms);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" icon={<ArrowLeft size={15} />} onClick={onBack} className="flex-shrink-0 px-3 py-2">
          Quay lại sửa yêu cầu
        </Button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Xem trước lịch học</h2>
          <p className="text-sm text-gray-500 mt-0.5">{data.length} buổi được xếp lịch</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-primary text-white text-xs">
                <th className="px-4 py-3 font-semibold text-left rounded-tl-2xl">Lớp học</th>
                <th className="px-4 py-3 font-semibold text-left">Thứ</th>
                <th className="px-4 py-3 font-semibold text-left">Ca học (Shift)</th>
                <th className="px-4 py-3 font-semibold text-left rounded-tr-2xl">Phòng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((item, index) => (
                <tr key={index} className="hover:bg-blue-50/40 transition-colors group">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-800 text-sm">{item.className}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{DAY_LABELS[item.day] ?? `Ngày ${item.day}`}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm font-mono">{item.shiftId}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {rooms?.find((r: any) => r._id === item.roomId)?.name || item.roomId}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3.5">
        <Button variant="outline" icon={<ArrowLeft size={15} />} onClick={onBack}>
          Quay lại sửa yêu cầu
        </Button>
        <Button variant="primary" icon={<CheckCircle2 size={15} />} onClick={() => {}}>
          Xác nhận & Lưu lịch chính thức
        </Button>
      </div>
    </div>
  );
};

export default SchedulePreview;
