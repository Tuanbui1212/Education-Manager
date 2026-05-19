import { ArrowLeft, Play } from 'lucide-react';
import type { IClass } from '../../../../types/class.type';
import ClassPrefsCard from './ClassPrefsCard';
import { CLASS_COLORS } from '../../../../utils/constants';
import Button from '../../../../components/Button';

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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="outline"
          icon={<ArrowLeft size={15} />}
          onClick={onBack}
          className="flex-shrink-0 mt-0.5 px-3 py-2"
        >
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Xác nhận & tùy chọn xếp lịch</h1>
          <p className="text-sm text-gray-500 mt-1">
            Các tùy chọn sẽ được gửi xuống Backend dưới dạng mảng{' '}
            <code className="bg-gray-100 text-primary px-1.5 py-0.5 rounded text-xs font-mono">
              optionalRequirements
            </code>
          </p>
        </div>
      </div>

      {/* Class Prefs Cards */}
      <div className="space-y-3">
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
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3.5">
        <Button variant="outline" icon={<ArrowLeft size={15} />} onClick={onBack}>
          Quay lại
        </Button>
        <Button
          variant="primary"
          icon={<Play size={14} fill="currentColor" />}
          onClick={onRun}
          className="bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
        >
          Chạy xếp lịch
        </Button>
      </div>
    </div>
  );
}

export default Page2;
