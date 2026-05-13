import useFetch from '../../../../hooks/useFetch';
import { roomService } from '../../../../services/room.service';

const SchedulePreview = ({ data, onBack }: { data: any[]; onBack: () => void }) => {
  const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

  const { data: rooms } = useFetch(roomService.getRooms, { limit: 1000 });
  console.log('Rooms from API:', rooms);

  return (
    <div>
      <div className="table-responsive">
        <table className="table-calendar">
          <thead>
            <tr>
              <th>Lớp</th>
              <th>Thứ</th>
              <th>Ca học (Shift)</th>
              <th>Phòng</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>
                  <strong>{item.className}</strong>
                </td>
                <td>{days[item.day]}</td>
                <td>{item.shiftId}</td>
                <td>
                  <span className="badge-room">{rooms?.find((r) => r._id === item.roomId)?.name || item.roomId}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="actions">
        <button onClick={onBack}>Quay lại sửa yêu cầu</button>
        <button className="btn-confirm">Xác nhận & Lưu lịch chính thức</button>
      </div>
    </div>
  );
};

export default SchedulePreview;
