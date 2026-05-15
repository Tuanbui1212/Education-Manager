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
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100" style={{ background: color.bg }}>
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color.dot }} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate" style={{ color: color.tc }}>
            {cls.name}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5 truncate">
            {typeof cls.courseId === 'object' ? (cls.courseId?.title ?? '—') : '—'}
            {' · '}
            {typeof cls.teacherId === 'object' ? (cls.teacherId?.fullName ?? '—') : '—'}
            {' · '}
            {cls.lessonsPerWeek} buổi/tuần · {cls.totalLessons} buổi · KG {formatDate(cls.startDate)}
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="px-4 py-3 space-y-3">
        {/* Ca học ưu tiên */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Ca học ưu tiên</p>
          <div className="flex flex-wrap gap-1.5">
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

        {/* Ngày ưu tiên */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Ngày ưu tiên dạy</p>
          <div className="flex flex-wrap gap-1.5">
            {DAYS.map((d, i) => (
              <Pill
                key={`pref-${d}`}
                label={d}
                active={reqs.includes(`day.${i + 1}`)}
                activeStyle={{ bg: '#D1FAE5', color: '#065F46', border: '#10B981' }}
                onClick={() => toggleDayPref(i + 1)}
              />
            ))}
          </div>
        </div>

        {/* Ngày không muốn dạy */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Ngày không muốn dạy</p>
          <div className="flex flex-wrap gap-1.5">
            {DAYS.map((d, i) => (
              <Pill
                key={`block-${d}`}
                label={d}
                active={reqs.includes(`noDay.${i + 1}`)}
                activeStyle={{ bg: '#FEE2E2', color: '#991B1B', border: '#DC2626' }}
                onClick={() => toggleDayBlock(i + 1)}
              />
            ))}
          </div>
        </div>

        {/* Tùy chọn khác */}
        <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-4">
          {SCHEDULE_OPTS.map((opt) => (
            <label
              key={opt.key}
              className="flex items-center gap-2 text-[11px] text-gray-500 cursor-pointer select-none hover:text-gray-700 transition-colors"
            >
              <input
                type="checkbox"
                checked={reqs.includes(opt.key)}
                onChange={() => toggleReq(opt.key)}
                className="w-3 h-3 rounded cursor-pointer"
                style={{ accentColor: PRIMARY }}
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
