import type { IClass } from '../../../../types/class.type';
import { formatDate } from '../../../../utils/format.util';
import { CLASS_COLORS } from '../../../../utils/constants';

const PRIMARY = '#3C3489';
function Page1({
  selectedIds,
  onToggle,
  onToggleAll,
  onNext,
  data,
  loading,
  error,
  refetch,
}: {
  selectedIds: string[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onNext: () => void;
  data: IClass[];
  loading?: boolean;
  error?: any;
  refetch?: () => void;
}) {
  if (loading)
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#888', fontSize: 13 }}>Đang tải danh sách lớp...</div>
    );

  if (error)
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <div style={{ color: '#DC2626', fontSize: 13, marginBottom: 8 }}>Có lỗi xảy ra khi tải dữ liệu.</div>
        <button
          onClick={refetch}
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            border: '0.5px solid #ccc',
            background: '#fff',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Thử lại
        </button>
      </div>
    );

  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const count = selectedIds.length;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a' }}>Xếp lịch tự động</h1>
        <p style={{ fontSize: 13, color: '#666', marginTop: 3 }}>
          Chọn các lớp chưa có lịch để đưa vào hệ thống xếp lịch.
        </p>
      </div>

      {data.length === 0 ? (
        <div
          style={{
            background: '#fff',
            border: '0.5px solid #ddd',
            borderRadius: 12,
            padding: '40px 20px',
            textAlign: 'center',
            color: '#888',
            fontSize: 13,
          }}
        >
          Không có lớp nào chưa có lịch.
        </div>
      ) : (
        <div style={{ background: '#fff', border: '0.5px solid #ddd', borderRadius: 12, overflow: 'hidden' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '36px 1fr 180px 100px 90px 90px',
              background: '#f5f5f3',
              borderBottom: '0.5px solid #e0e0dc',
              padding: '8px 14px',
              alignItems: 'center',
            }}
          >
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onToggleAll}
              style={{ accentColor: PRIMARY, width: 13, height: 13, cursor: 'pointer' }}
            />
            {['Lớp học / Khóa học', 'Giáo viên', 'Buổi/tuần', 'Tổng buổi', 'Khai giảng'].map((h, i) => (
              <span
                key={i}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#555',
                  textTransform: 'uppercase',
                  letterSpacing: '.04em',
                  textAlign: i >= 2 && i <= 3 ? 'center' : 'left',
                }}
              >
                {h}
              </span>
            ))}
          </div>
          {data.map((cls, i) => {
            const color = CLASS_COLORS[i % CLASS_COLORS.length];
            const checked = selectedIds.includes(cls._id as string);
            return (
              <div
                key={cls._id}
                onClick={() => onToggle(cls._id as string)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '36px 1fr 180px 100px 90px 90px',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderBottom: i < data.length - 1 ? '0.5px solid #f0f0ee' : 'none',
                  background: checked ? '#F5F3FF' : '#fff',
                  cursor: 'pointer',
                  transition: 'background .12s',
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {}}
                  onClick={(e) => e.stopPropagation()}
                  style={{ accentColor: PRIMARY, width: 13, height: 13, cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color.dot, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a' }}>{cls.name}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>
                      {typeof cls.courseId === 'object' ? (cls.courseId?.title ?? '—') : '—'}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#444' }}>
                  {typeof cls.teacherId === 'object' ? cls.teacherId?.fullName : cls.teacherId}
                </div>
                <div style={{ fontSize: 12, color: '#444', textAlign: 'center' }}>{cls.lessonsPerWeek}</div>
                <div style={{ fontSize: 12, color: '#444', textAlign: 'center' }}>{cls.totalLessons}</div>
                <div style={{ fontSize: 11, color: '#555' }}>{formatDate(cls.startDate)}</div>
              </div>
            );
          })}
        </div>
      )}

      <div
        style={{
          marginTop: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff',
          border: '0.5px solid #ddd',
          borderRadius: 10,
          padding: '12px 16px',
        }}
      >
        <div style={{ fontSize: 13, color: '#555' }}>
          {count === 0 ? (
            <span style={{ color: '#aaa' }}>Chưa chọn lớp nào</span>
          ) : (
            <>
              <strong style={{ color: PRIMARY }}>{count}</strong> / {data.length} lớp đã chọn
            </>
          )}
        </div>
        <button
          onClick={onNext}
          disabled={count === 0}
          style={{
            padding: '8px 20px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            border: 'none',
            background: count === 0 ? '#e0e0e0' : PRIMARY,
            color: count === 0 ? '#aaa' : '#fff',
            cursor: count === 0 ? 'not-allowed' : 'pointer',
            transition: 'all .15s',
          }}
        >
          Tiếp tục →
        </button>
      </div>
    </div>
  );
}

export default Page1;
