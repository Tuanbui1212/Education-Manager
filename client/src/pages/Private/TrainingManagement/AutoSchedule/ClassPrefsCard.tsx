import type { IClass } from '../../../../types/class.type';
import { DAYS, SCHEDULE_OPTS, SESSIONS, PRIMARY } from '../../../../utils/constants';
import { formatDate } from '../../../../utils/format.util';
import Pill from './Pill';

function ClassPrefsCard({
  cls,
  color,
  reqs,
  onChange,
}: {
  cls: IClass;
  color: any;
  reqs: string[];
  onChange: (newReqs: string[]) => void;
}) {
  const toggleReq = (req: string) => {
    if (reqs.includes(req)) {
      onChange(reqs.filter((r) => r !== req));
    } else {
      onChange([...reqs, req]);
    }
  };

  const toggleDayPref = (i: number) => {
    const dayReq = `day.${i}`;
    const blockReq = `noDay.${i}`;
    let newReqs = [...reqs];

    if (newReqs.includes(dayReq)) {
      newReqs = newReqs.filter((r) => r !== dayReq);
    } else {
      newReqs.push(dayReq);
      newReqs = newReqs.filter((r) => r !== blockReq);
    }
    onChange(newReqs);
  };

  const toggleDayBlock = (i: number) => {
    const dayReq = `day.${i}`;
    const blockReq = `noDay.${i}`;
    let newReqs = [...reqs];

    if (newReqs.includes(blockReq)) {
      newReqs = newReqs.filter((r) => r !== blockReq);
    } else {
      newReqs.push(blockReq);
      newReqs = newReqs.filter((r) => r !== dayReq);
    }
    onChange(newReqs);
  };

  return (
    <div
      style={{ background: '#fff', border: '0.5px solid #ddd', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}
    >
      <div
        style={{
          background: color.bg,
          borderBottom: '0.5px solid #e0e0dc',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color.dot, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: color.tc }}>{cls.name}</div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 1 }}>
            {typeof cls.courseId === 'object' ? (cls.courseId?.title ?? '—') : '—'} ·{' '}
            {typeof cls.teacherId === 'object' ? (cls.teacherId?.fullName ?? '—') : '—'} · {cls.lessonsPerWeek}{' '}
            buổi/tuần · {cls.totalLessons} buổi · KG {formatDate(cls.startDate)}
          </div>
        </div>
      </div>
      <div style={{ padding: '12px 14px', display: 'grid', gap: 10 }}>
        {/* Chọn Ca */}
        <div>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 5, fontWeight: 500 }}>Ca học ưu tiên</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {SESSIONS.map((s) => (
              <Pill
                key={s.value}
                label={s.label}
                active={reqs.includes(s.value)}
                activeStyle={{ bg: PRIMARY, color: '#fff', border: PRIMARY }}
                onClick={() => toggleReq(s.value)}
              />
            ))}
          </div>
        </div>

        {/* Chọn Ngày ưu tiên */}
        <div>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 5, fontWeight: 500 }}>Ngày ưu tiên dạy</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {DAYS.map((d, i) => (
              <Pill
                key={`pref-${d}`}
                label={d}
                active={reqs.includes(`day.${i}`)}
                activeStyle={{ bg: '#D1FAE5', color: '#065F46', border: '#10B981' }}
                onClick={() => toggleDayPref(i)}
              />
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 5, fontWeight: 500 }}>Ngày không muốn dạy</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {DAYS.map((d, i) => (
              <Pill
                key={`block-${d}`}
                label={d}
                active={reqs.includes(`noDay.${i}`)}
                activeStyle={{ bg: '#FEE2E2', color: '#991B1B', border: '#DC2626' }}
                onClick={() => toggleDayBlock(i)}
              />
            ))}
          </div>
        </div>

        {/* Các Tùy chọn khác */}
        <div style={{ borderTop: '0.5px solid #f0f0ee', paddingTop: 8, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {SCHEDULE_OPTS.map((opt) => (
            <label
              key={opt.key}
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#555', cursor: 'pointer' }}
            >
              <input
                type="checkbox"
                checked={reqs.includes(opt.key)}
                onChange={() => toggleReq(opt.key)}
                style={{ accentColor: PRIMARY, width: 12, height: 12 }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ClassPrefsCard;
