import type { IClass } from '../../../../types/class.type';
import ClassPrefsCard from './ClassPrefsCard';
import { CLASS_COLORS, GREEN } from '../../../../utils/constants';

function Page2({
  selectedClasses,
  prefs,
  onChangePrefs,
  onBack,
  onRun,
}: {
  selectedClasses: IClass[];
  prefs: Record<string, string[]>;
  onChangePrefs: (id: string, newReqs: string[]) => void;
  onBack: () => void;
  onRun: () => void;
}) {
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
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a' }}>Xác nhận & tùy chọn xếp lịch</h1>
          <p style={{ fontSize: 13, color: '#666', marginTop: 3 }}>
            Các tùy chọn này sẽ được gửi xuống Backend dưới dạng mảng <code>optionalRequirements</code>
          </p>
        </div>
      </div>

      {selectedClasses.map((cls, i) => {
        const reqs = prefs[cls._id as string] || (cls as any).optionalRequirements || [];
        return (
          <ClassPrefsCard
            key={cls._id}
            cls={cls}
            color={CLASS_COLORS[i % CLASS_COLORS.length]}
            reqs={reqs}
            onChange={(newReqs) => onChangePrefs(cls._id as string, newReqs)}
          />
        );
      })}

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
          marginTop: 8,
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
          ← Quay lại
        </button>
        <button
          onClick={onRun}
          style={{
            padding: '8px 20px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            border: 'none',
            background: GREEN,
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ▶ Chạy xếp lịch
        </button>
      </div>
    </div>
  );
}

export default Page2;
