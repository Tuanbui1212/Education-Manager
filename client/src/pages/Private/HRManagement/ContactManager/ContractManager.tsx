import { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Plus,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  RefreshCw,
  Printer,
  Edit,
  ChevronRight,
  X,
  Banknote,
  Calendar as CalendarIcon,
  Building,
  User,
} from 'lucide-react';
import Button from '../../../../components/Button';
import PageHeader from '../../../../components/PageHeader';
import ConfirmModal from '../../../../components/ConfirmModal';
import GlobalLoading from '../../../../components/Loading';
import { formatCurrency, formatDate } from '../../../../utils/format.util';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ContractStatus = 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'TERMINATED';
export type ContractType = 'FULL_TIME' | 'PART_TIME' | 'PROBATION';

export interface IContract {
  _id: string;
  contractCode: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  department: string;
  contractType: ContractType;
  startDate: string;
  endDate: string;
  baseSalary: number;
  allowance: number;
  insuranceRate: number;
  status: ContractStatus;
  signedDate?: string;
  terminatedDate?: string;
  note?: string;
  history: { date: string; action: string }[];
  createdAt: string;
  updatedAt: string;
}

// ─── Mock data (replace with useFetch(contractService.getContracts) when ready) ─
const MOCK_CONTRACTS: IContract[] = [
  {
    _id: 'c1',
    contractCode: 'HD-2023-001',
    userId: { _id: 'u1', fullName: 'Nguyễn Thị Hoa', email: 'hoa.nt@school.edu.vn', phone: '0901234567' },
    department: 'Giáo viên',
    contractType: 'FULL_TIME',
    startDate: '2023-09-01',
    endDate: '2025-08-31',
    baseSalary: 15_000_000,
    allowance: 2_000_000,
    insuranceRate: 0.09,
    status: 'EXPIRED',
    signedDate: '2023-08-28',
    history: [
      { date: '2023-09-01', action: 'Ký hợp đồng chính thức lần đầu' },
      { date: '2023-07-01', action: 'Bắt đầu thử việc' },
    ],
    createdAt: '2023-08-25T00:00:00.000Z',
    updatedAt: '2025-08-31T00:00:00.000Z',
  },
  {
    _id: 'c2',
    contractCode: 'HD-2024-002',
    userId: { _id: 'u2', fullName: 'Trần Văn Minh', email: 'minh.tv@school.edu.vn', phone: '0912345678' },
    department: 'Hành chính',
    contractType: 'FULL_TIME',
    startDate: '2024-01-15',
    endDate: '2026-01-14',
    baseSalary: 12_000_000,
    allowance: 1_500_000,
    insuranceRate: 0.09,
    status: 'ACTIVE',
    signedDate: '2024-01-10',
    history: [
      { date: '2024-01-15', action: 'Ký hợp đồng 2 năm' },
      { date: '2023-10-15', action: 'Kết thúc thử việc' },
    ],
    createdAt: '2024-01-10T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  },
  {
    _id: 'c3',
    contractCode: 'HD-2024-003',
    userId: { _id: 'u3', fullName: 'Lê Thị Mai', email: 'mai.lt@school.edu.vn', phone: '0923456789' },
    department: 'Kế toán',
    contractType: 'FULL_TIME',
    startDate: '2024-03-01',
    endDate: '2026-02-28',
    baseSalary: 14_000_000,
    allowance: 1_800_000,
    insuranceRate: 0.09,
    status: 'ACTIVE',
    signedDate: '2024-02-26',
    history: [{ date: '2024-03-01', action: 'Ký hợp đồng chính thức' }],
    createdAt: '2024-02-26T00:00:00.000Z',
    updatedAt: '2024-03-01T00:00:00.000Z',
  },
  {
    _id: 'c4',
    contractCode: 'HD-2025-004',
    userId: { _id: 'u4', fullName: 'Phạm Quốc Hùng', email: 'hung.pq@school.edu.vn', phone: '0934567890' },
    department: 'IT',
    contractType: 'FULL_TIME',
    startDate: '2025-06-01',
    endDate: '2026-05-31',
    baseSalary: 20_000_000,
    allowance: 3_000_000,
    insuranceRate: 0.09,
    status: 'ACTIVE',
    signedDate: '2025-05-28',
    history: [{ date: '2025-06-01', action: 'Ký hợp đồng 1 năm' }],
    createdAt: '2025-05-28T00:00:00.000Z',
    updatedAt: '2025-06-01T00:00:00.000Z',
  },
  {
    _id: 'c5',
    contractCode: 'HD-2025-005',
    userId: { _id: 'u5', fullName: 'Võ Thị Lan', email: 'lan.vt@school.edu.vn', phone: '0945678901' },
    department: 'Giáo viên',
    contractType: 'PART_TIME',
    startDate: '2025-09-01',
    endDate: '2026-05-31',
    baseSalary: 8_000_000,
    allowance: 500_000,
    insuranceRate: 0.09,
    status: 'ACTIVE',
    signedDate: '2025-08-28',
    history: [{ date: '2025-09-01', action: 'Ký hợp đồng bán thời gian' }],
    createdAt: '2025-08-28T00:00:00.000Z',
    updatedAt: '2025-09-01T00:00:00.000Z',
  },
  {
    _id: 'c6',
    contractCode: 'HD-2026-006',
    userId: { _id: 'u6', fullName: 'Đặng Thanh Tùng', email: 'tung.dt@school.edu.vn', phone: '0956789012' },
    department: 'Hành chính',
    contractType: 'PROBATION',
    startDate: '2026-02-01',
    endDate: '2026-04-30',
    baseSalary: 9_000_000,
    allowance: 0,
    insuranceRate: 0.09,
    status: 'PENDING',
    history: [{ date: '2026-02-01', action: 'Bắt đầu thử việc 3 tháng' }],
    createdAt: '2026-01-28T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z',
  },
  {
    _id: 'c7',
    contractCode: 'HD-2024-007',
    userId: { _id: 'u7', fullName: 'Hoàng Minh Châu', email: 'chau.hm@school.edu.vn', phone: '0967890123' },
    department: 'Giáo viên',
    contractType: 'FULL_TIME',
    startDate: '2024-09-01',
    endDate: '2026-06-15',
    baseSalary: 16_000_000,
    allowance: 2_200_000,
    insuranceRate: 0.09,
    status: 'ACTIVE',
    signedDate: '2024-08-28',
    history: [
      { date: '2024-09-01', action: 'Gia hạn hợp đồng năm 2' },
      { date: '2023-09-01', action: 'Ký hợp đồng chính thức lần đầu' },
    ],
    createdAt: '2024-08-28T00:00:00.000Z',
    updatedAt: '2024-09-01T00:00:00.000Z',
  },
  {
    _id: 'c8',
    contractCode: 'HD-2024-008',
    userId: { _id: 'u8', fullName: 'Nguyễn Văn Đức', email: 'duc.nv@school.edu.vn', phone: '0978901234' },
    department: 'IT',
    contractType: 'FULL_TIME',
    startDate: '2024-07-01',
    endDate: '2026-06-30',
    baseSalary: 18_000_000,
    allowance: 2_500_000,
    insuranceRate: 0.09,
    status: 'ACTIVE',
    signedDate: '2024-06-28',
    history: [{ date: '2024-07-01', action: 'Ký hợp đồng 2 năm' }],
    createdAt: '2024-06-28T00:00:00.000Z',
    updatedAt: '2024-07-01T00:00:00.000Z',
  },
];

const DEPARTMENTS = ['Giáo viên', 'Hành chính', 'Kế toán', 'IT'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const daysUntilExpiry = (endDate: string): number => {
  return Math.round((new Date(endDate).getTime() - Date.now()) / 86_400_000);
};

const getStatusConfig = (status: ContractStatus) => {
  const map: Record<ContractStatus, { label: string; className: string; icon: React.ReactNode }> = {
    ACTIVE: {
      label: 'Đang hiệu lực',
      className: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
      icon: <CheckCircle2 size={12} />,
    },
    PENDING: {
      label: 'Chờ ký',
      className: 'bg-amber-50 text-amber-700 border border-amber-100',
      icon: <Clock size={12} />,
    },
    EXPIRED: {
      label: 'Hết hạn',
      className: 'bg-red-50 text-red-600 border border-red-100',
      icon: <AlertCircle size={12} />,
    },
    TERMINATED: {
      label: 'Đã chấm dứt',
      className: 'bg-slate-100 text-slate-500 border border-slate-200',
      icon: <XCircle size={12} />,
    },
  };
  return map[status];
};

const getTypeConfig = (type: ContractType) => {
  const map: Record<ContractType, { label: string; className: string }> = {
    FULL_TIME: { label: 'Toàn thời gian', className: 'bg-violet-50 text-violet-700 border border-violet-100' },
    PART_TIME: { label: 'Bán thời gian', className: 'bg-sky-50 text-sky-700 border border-sky-100' },
    PROBATION: { label: 'Thử việc', className: 'bg-yellow-50 text-yellow-700 border border-yellow-100' },
  };
  return map[type];
};

// ─── Component ────────────────────────────────────────────────────────────────
const ContractManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<ContractType | 'ALL'>('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [selectedContract, setSelectedContract] = useState<IContract | null>(null);
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as any,
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    onConfirm: () => {},
  });

  // TODO: Replace mock with real API call when contractService is ready:
  // const { data: contracts, loading, error, refetch } = useFetch(contractService.getContracts, {}, []);
  const contracts = MOCK_CONTRACTS;
  const loading = false;

  const closeConfirm = () => setConfirmConfig((p) => ({ ...p, isOpen: false }));

  const filteredData = useMemo(() => {
    return contracts.filter((c) => {
      const matchSearch =
        c.userId.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contractCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchType = typeFilter === 'ALL' || c.contractType === typeFilter;
      const matchDept = deptFilter === 'ALL' || c.department === deptFilter;
      return matchSearch && matchStatus && matchType && matchDept;
    });
  }, [contracts, searchTerm, statusFilter, typeFilter, deptFilter]);

  // Stats
  const totalContracts = filteredData.length;
  const activeCount = filteredData.filter((c) => c.status === 'ACTIVE').length;
  const expiringCount = filteredData.filter((c) => {
    const d = daysUntilExpiry(c.endDate);
    return c.status === 'ACTIVE' && d >= 0 && d <= 60;
  }).length;
  const expiredCount = filteredData.filter((c) => c.status === 'EXPIRED').length;

  const handleRenew = (contract: IContract) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Gia hạn hợp đồng',
      type: 'info',
      message: `Xác nhận gia hạn hợp đồng của ${contract.userId.fullName}?\n\nHệ thống sẽ tạo bản hợp đồng mới và yêu cầu ký lại.`,
      confirmText: 'Xác nhận gia hạn',
      cancelText: 'Hủy',
      onConfirm: () => {
        // TODO: contractService.renewContract(contract._id)
        closeConfirm();
      },
    });
  };

  const handleTerminate = (contract: IContract) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Chấm dứt hợp đồng',
      type: 'danger',
      message: `Bạn chắc chắn muốn chấm dứt hợp đồng của ${contract.userId.fullName}?\n\nThao tác này không thể hoàn tác.`,
      confirmText: 'Chấm dứt',
      cancelText: 'Hủy',
      onConfirm: () => {
        // TODO: contractService.terminateContract(contract._id)
        closeConfirm();
      },
    });
  };

  if (loading) return <GlobalLoading />;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-start justify-between mb-6">
        <div>
          <PageHeader title="Hợp đồng lao động" />
          <p className="text-sm text-gray-500 -mt-4">Quản lý & theo dõi hợp đồng toàn bộ nhân sự</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon={<Download size={16} />} onClick={() => {}}>
            Xuất Excel
          </Button>
          <Button
            variant="primary"
            className="bg-violet-600 hover:bg-violet-700 border-violet-600"
            icon={<Plus size={16} />}
            onClick={() => {
              /* navigate to create page */
            }}
          >
            Tạo hợp đồng
          </Button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Tổng hợp đồng"
          value={totalContracts}
          icon={<FileText size={18} className="text-violet-500" />}
          bg="bg-violet-50"
          textColor="text-violet-700"
        />
        <StatCard
          label="Đang hiệu lực"
          value={activeCount}
          icon={<CheckCircle2 size={18} className="text-emerald-500" />}
          bg="bg-emerald-50"
          textColor="text-emerald-700"
        />
        <StatCard
          label="Sắp hết hạn"
          value={expiringCount}
          icon={<AlertCircle size={18} className="text-amber-500" />}
          bg="bg-amber-50"
          textColor="text-amber-700"
          sub="Trong vòng 60 ngày"
        />
        <StatCard
          label="Đã hết hạn"
          value={expiredCount}
          icon={<XCircle size={18} className="text-red-500" />}
          bg="bg-red-50"
          textColor="text-red-700"
        />
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm tên nhân viên, mã HĐ..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <FilterSelect
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as ContractStatus | 'ALL')}
          options={[
            { value: 'ALL', label: 'Tất cả trạng thái' },
            { value: 'ACTIVE', label: 'Đang hiệu lực' },
            { value: 'PENDING', label: 'Chờ ký' },
            { value: 'EXPIRED', label: 'Hết hạn' },
            { value: 'TERMINATED', label: 'Đã chấm dứt' },
          ]}
        />
        <FilterSelect
          value={typeFilter}
          onChange={(v) => setTypeFilter(v as ContractType | 'ALL')}
          options={[
            { value: 'ALL', label: 'Tất cả loại HĐ' },
            { value: 'FULL_TIME', label: 'Toàn thời gian' },
            { value: 'PART_TIME', label: 'Bán thời gian' },
            { value: 'PROBATION', label: 'Thử việc' },
          ]}
        />
        <FilterSelect
          value={deptFilter}
          onChange={setDeptFilter}
          options={[{ value: 'ALL', label: 'Tất cả phòng ban' }, ...DEPARTMENTS.map((d) => ({ value: d, label: d }))]}
        />
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Nhân viên', 'Phòng ban', 'Loại hợp đồng', 'Thời hạn', 'Lương cơ bản', 'Trạng thái', ''].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredData.length > 0 ? (
              filteredData.map((contract) => (
                <ContractRow
                  key={contract._id}
                  contract={contract}
                  onView={() => setSelectedContract(contract)}
                  onRenew={() => handleRenew(contract)}
                />
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-16 text-center text-gray-400 italic">
                  Không tìm thấy hợp đồng nào khớp với bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Detail Modal ── */}
      {selectedContract && (
        <ContractDetailModal
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
          onRenew={() => {
            setSelectedContract(null);
            handleRenew(selectedContract);
          }}
          onTerminate={() => {
            setSelectedContract(null);
            handleTerminate(selectedContract);
          }}
        />
      )}

      <ConfirmModal {...confirmConfig} onClose={closeConfirm} />
    </div>
  );
};

// ─── ContractRow ──────────────────────────────────────────────────────────────
const ContractRow = ({
  contract,
  onView,
  onRenew,
}: {
  contract: IContract;
  onView: () => void;
  onRenew: () => void;
}) => {
  const statusCfg = getStatusConfig(contract.status);
  const typeCfg = getTypeConfig(contract.contractType);
  const days = daysUntilExpiry(contract.endDate);
  const isExpiringSoon = contract.status === 'ACTIVE' && days >= 0 && days <= 60;

  return (
    <tr className="hover:bg-violet-50/40 cursor-pointer transition-colors" onClick={onView}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 font-bold text-sm flex items-center justify-center shrink-0">
            {contract.userId.fullName.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{contract.userId.fullName}</p>
            <p className="text-xs text-gray-400">{contract.contractCode}</p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 text-gray-500">{contract.department}</td>

      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg ${typeCfg.className}`}
        >
          {typeCfg.label}
        </span>
      </td>

      <td className="px-4 py-3">
        <p className="text-gray-700">
          {formatDate(contract.startDate)} → {formatDate(contract.endDate)}
        </p>
        {isExpiringSoon && (
          <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg">
            <AlertCircle size={10} /> Còn {days} ngày
          </span>
        )}
        {contract.status === 'ACTIVE' && !isExpiringSoon && days > 0 && (
          <p className="text-xs text-gray-400 mt-0.5">Còn {days} ngày</p>
        )}
      </td>

      <td className="px-4 py-3 font-semibold text-gray-800">{formatCurrency(contract.baseSalary)}</td>

      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.className}`}
        >
          {statusCfg.icon}
          {statusCfg.label}
        </span>
      </td>

      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
            title="Xem chi tiết"
          >
            <ChevronRight size={16} />
          </button>
          {(contract.status === 'EXPIRED' || (contract.status === 'ACTIVE' && isExpiringSoon)) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRenew();
              }}
              className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors"
              title="Gia hạn hợp đồng"
            >
              <RefreshCw size={14} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation(); /* navigate to edit */
            }}
            className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white rounded-lg transition-colors"
            title="Chỉnh sửa"
          >
            <Edit size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
};

// ─── ContractDetailModal ──────────────────────────────────────────────────────
const ContractDetailModal = ({
  contract,
  onClose,
  onRenew,
  onTerminate,
}: {
  contract: IContract;
  onClose: () => void;
  onRenew: () => void;
  onTerminate: () => void;
}) => {
  const statusCfg = getStatusConfig(contract.status);
  const typeCfg = getTypeConfig(contract.contractType);
  const insurance = Math.round(contract.baseSalary * contract.insuranceRate);
  const netSalary = contract.baseSalary + contract.allowance - insurance;
  const days = daysUntilExpiry(contract.endDate);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Chi tiết hợp đồng</h2>
            <p className="text-sm text-gray-400 mt-0.5">Mã HĐ: {contract.contractCode}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Banner */}
        <div className="mx-6 mt-6 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold text-white shrink-0">
            {contract.userId.fullName.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-white">{contract.userId.fullName}</p>
            <p className="text-violet-200 text-sm mt-0.5">
              {contract.department} · {typeCfg.label}
            </p>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full bg-white/20 text-white border border-white/30`}
          >
            {statusCfg.label}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Thông tin hợp đồng */}
          <section>
            <SectionTitle icon={<FileText size={15} className="text-violet-500" />} title="Thông tin hợp đồng" />
            <div className="grid grid-cols-2 gap-3">
              <InfoItem label="Ngày bắt đầu" value={formatDate(contract.startDate)} icon={<CalendarIcon size={14} />} />
              <InfoItem label="Ngày kết thúc" value={formatDate(contract.endDate)} icon={<CalendarIcon size={14} />} />
              <InfoItem label="Phòng ban" value={contract.department} icon={<Building size={14} />} />
              <InfoItem
                label="Thời hạn còn lại"
                value={contract.status === 'ACTIVE' ? (days > 0 ? `${days} ngày` : 'Đã hết hạn') : '—'}
                icon={<Clock size={14} />}
                highlight={days <= 60 && days >= 0 && contract.status === 'ACTIVE'}
              />
              <InfoItem label="Liên hệ" value={contract.userId.phone} icon={<User size={14} />} />
              <InfoItem label="Email" value={contract.userId.email} icon={<User size={14} />} />
            </div>
          </section>

          {/* Cấu trúc lương */}
          <section>
            <SectionTitle icon={<Banknote size={15} className="text-violet-500" />} title="Cấu trúc lương" />
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
              <SalaryRow label="Lương cơ bản" value={formatCurrency(contract.baseSalary)} />
              {contract.allowance > 0 && (
                <SalaryRow
                  label="Phụ cấp"
                  value={`+${formatCurrency(contract.allowance)}`}
                  valueClass="text-emerald-600"
                />
              )}
              <SalaryRow
                label={`Bảo hiểm (${contract.insuranceRate * 100}%)`}
                value={`-${formatCurrency(insurance)}`}
                valueClass="text-red-500"
              />
              <div className="border-t border-gray-200 pt-2 mt-2">
                <SalaryRow
                  label="Thực nhận"
                  value={formatCurrency(netSalary)}
                  labelClass="font-bold text-gray-800"
                  valueClass="text-violet-600 font-bold text-base"
                />
              </div>
            </div>
          </section>

          {/* Lịch sử */}
          {contract.history.length > 0 && (
            <section>
              <SectionTitle icon={<Clock size={15} className="text-violet-500" />} title="Lịch sử hợp đồng" />
              <div className="relative pl-5">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-200" />
                {contract.history.map((h, i) => (
                  <div key={i} className="relative mb-4 last:mb-0">
                    <div
                      className={`absolute -left-3 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${i === 0 ? 'bg-violet-500' : 'bg-gray-300'}`}
                    />
                    <p className="text-xs text-gray-400">{formatDate(h.date)}</p>
                    <p className="text-sm text-gray-700 mt-0.5">{h.action}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3 justify-end border-t border-gray-100 pt-4">
          <Button variant="outline" icon={<Printer size={15} />} onClick={() => {}}>
            In hợp đồng
          </Button>
          {contract.status !== 'TERMINATED' && (
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
              icon={<XCircle size={15} />}
              onClick={onTerminate}
            >
              Chấm dứt
            </Button>
          )}
          {(contract.status === 'EXPIRED' || contract.status === 'ACTIVE') && (
            <Button
              variant="primary"
              className="bg-violet-600 hover:bg-violet-700 border-violet-600"
              icon={<RefreshCw size={15} />}
              onClick={onRenew}
            >
              Gia hạn hợp đồng
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  icon,
  bg,
  textColor,
  sub,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  bg: string;
  textColor: string;
  sub?: string;
}) => (
  <div className={`${bg} rounded-2xl p-4`}>
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
    <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

const FilterSelect = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="text-sm bg-white border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-violet-300 shadow-sm"
  >
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

const SectionTitle = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
    {icon}
    <span className="text-sm font-bold text-gray-700">{title}</span>
  </div>
);

const InfoItem = ({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) => (
  <div className={`rounded-xl p-3 ${highlight ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50'}`}>
    <div className={`flex items-center gap-1.5 text-xs mb-1 ${highlight ? 'text-amber-600' : 'text-gray-400'}`}>
      {icon}
      <span>{label}</span>
    </div>
    <p className={`text-sm font-semibold ${highlight ? 'text-amber-700' : 'text-gray-800'}`}>{value}</p>
  </div>
);

const SalaryRow = ({
  label,
  value,
  labelClass = 'text-gray-500',
  valueClass = 'text-gray-800',
}: {
  label: string;
  value: string;
  labelClass?: string;
  valueClass?: string;
}) => (
  <div className="flex justify-between items-center text-sm py-1">
    <span className={labelClass}>{label}</span>
    <span className={`font-semibold ${valueClass}`}>{value}</span>
  </div>
);

export default ContractManager;
