import { useState, useRef, useEffect } from 'react';
import { Activity, User, Shield, Filter, ChevronDown, RefreshCw, Clock, Search } from 'lucide-react';

import { formatDate } from '../../../../utils/format.util';
import { ACTION_META, ACTION_FILTER_OPTIONS, PALETTE } from '../../../../utils/activityLog.util';

import PageHeader from '../../../../components/PageHeader';
import TablePagination from '../../../../components/TablePagination';
import SearchInput from '../../../../components/SearchInput';
import StatCard from '../../../../components/StatCard';

import useDebounce from '../../../../hooks/useDebounce';

import type { IActivityLog, ActivityAction } from '../../../../types/activityLog.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getColor = (s: string) => PALETTE[(s || ' ').charCodeAt(0) % PALETTE.length];
const getInitials = (name: string) => {
  const p = (name || '').trim().split(' ').filter(Boolean);
  return p.length < 2 ? (p[0]?.[0] ?? '?').toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
};
// ─── Mock data (xóa khi có API thật) ─────────────────────────────────────────
const MOCK_LOGS: IActivityLog[] = Array.from({ length: 38 }, (_, i) => {
  const actions = Object.keys(ACTION_META) as ActivityAction[];
  const action = actions[i % actions.length];
  const actors = [
    { _id: '1', fullName: 'Nguyễn Văn Admin', email: 'admin@edu.vn' },
    { _id: '2', fullName: 'Trần Thị Manager', email: 'manager@edu.vn' },
    { _id: '3', fullName: 'Lê Hoàng Super', email: 'super@edu.vn' },
  ];
  const targets = ['Nguyễn Văn A', 'Vai trò Giáo viên', 'Trần Thị B', 'Vai trò Manager', 'Hệ thống'];
  const actor = actors[i % actors.length];

  return {
    _id: `log-${i}`,
    actorId: actor,
    action,
    targetType: action.includes('ROLE') ? 'Role' : action === 'LOGIN' || action === 'LOGOUT' ? 'System' : 'User',
    targetName: targets[i % targets.length],
    description: `${ACTION_META[action].label} — ${targets[i % targets.length]}`,
    ipAddress: `192.168.${(i % 5) + 1}.${(i % 50) + 10}`,
    createdAt: new Date(Date.now() - i * 3_600_000 * 3).toISOString(),
  };
});

// ─── ActionBadge ──────────────────────────────────────────────────────────────
const ActionBadge = ({ action }: { action: ActivityAction }) => {
  const meta = ACTION_META[action];
  if (!meta) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.bg} ${meta.color}`}
    >
      {meta.icon}
      {meta.label}
    </span>
  );
};

// ─── Dropdown Filter ──────────────────────────────────────────────────────────
interface DropdownFilterProps {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}
const DropdownFilter = ({ value, onChange, options, placeholder = 'Lọc...' }: DropdownFilterProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm
          text-gray-700 hover:border-gray-400 transition-colors min-w-[180px] justify-between"
      >
        <span className="flex items-center gap-1.5">
          <Filter size={14} className="text-gray-400" />
          {selected?.label || placeholder}
        </span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden min-w-[200px]">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                ${o.value === value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ActivityLog = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const debouncedSearch = useDebounce(searchInput, 400);

  // ── Filtering (mock, thay bằng useFetch khi có API) ──────────────────────
  const filtered = MOCK_LOGS.filter((log) => {
    const matchSearch =
      !debouncedSearch ||
      log.actorId.fullName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      log.actorId.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      log.description.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchAction = !actionFilter || log.action === actionFilter;

    const logDate = new Date(log.createdAt);
    const matchFrom = !dateFrom || logDate >= new Date(dateFrom);
    const matchTo = !dateTo || logDate <= new Date(dateTo + 'T23:59:59');

    return matchSearch && matchAction && matchFrom && matchTo;
  });

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const isFiltered = !!debouncedSearch || !!actionFilter || !!dateFrom || !!dateTo;
  const fromItem = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const toItem = Math.min(page * limit, totalCount);

  const handleReset = () => {
    setSearchInput('');
    setActionFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  // Stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = MOCK_LOGS.filter((l) => l.createdAt.startsWith(todayStr)).length;
  const userActions = MOCK_LOGS.filter((l) => l.targetType === 'User').length;
  const roleActions = MOCK_LOGS.filter((l) => l.targetType === 'Role').length;

  return (
    <div className="p-6 lg:p-8 w-full space-y-6">
      <PageHeader title="Lịch sử Hoạt động Hệ thống" />

      {/* ══ Stats ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tổng log */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Activity size={22} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{MOCK_LOGS.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Tổng hoạt động</p>
          </div>
        </div>

        {/* Hôm nay */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Clock size={22} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{todayCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Hôm nay</p>
          </div>
        </div>

        {/* Quản lý tài khoản */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
            <User size={22} className="text-violet-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{userActions}</p>
            <p className="text-xs text-gray-500 mt-0.5">Thao tác trên User</p>
          </div>
        </div>
      </div>

      {/* ══ Filters ════════════════════════════════════════════════════════ */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="flex-1 min-w-[220px] max-w-sm">
          <SearchInput
            type="text"
            placeholder="Tìm theo người thực hiện, mô tả..."
            value={searchInput}
            setSearchInput={setSearchInput}
            setPage={setPage}
          />
        </div>

        {/* Action filter */}
        <DropdownFilter
          value={actionFilter}
          onChange={(v) => {
            setActionFilter(v);
            setPage(1);
          }}
          options={ACTION_FILTER_OPTIONS}
          placeholder="Loại hành động"
        />

        {/* Date from */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap">Từ ngày</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700
              bg-white hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Date to */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap">Đến ngày</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700
              bg-white hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Reset */}
        {isFiltered && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500
              hover:text-gray-700 border border-gray-200 rounded-xl hover:border-gray-400
              bg-white transition-colors"
          >
            <RefreshCw size={14} />
            Xóa lọc
          </button>
        )}
      </div>

      {/* ══ Table ══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Meta row */}
        {totalCount > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/60 flex-wrap gap-2">
            <p className="text-xs text-gray-500">
              Hiển thị{' '}
              <span className="font-semibold text-gray-700">
                {fromItem}–{toItem}
              </span>{' '}
              trong <span className="font-semibold text-gray-700">{totalCount}</span> bản ghi
              {isFiltered && (
                <button onClick={handleReset} className="ml-2 text-blue-500 hover:underline">
                  xóa bộ lọc
                </button>
              )}
            </p>
            {actionFilter && (
              <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-600 font-medium rounded-full flex items-center gap-1">
                <Filter size={11} />
                {ACTION_FILTER_OPTIONS.find((o) => o.value === actionFilter)?.label}
              </span>
            )}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="sticky top-0 z-20">
              <tr className="bg-primary text-white text-sm">
                <th className="px-4 py-3.5 font-semibold w-12 text-center">STT</th>
                <th className="px-4 py-3.5 font-semibold">Người thực hiện</th>
                <th className="px-4 py-3.5 font-semibold">Hành động</th>
                <th className="px-4 py-3.5 font-semibold">Đối tượng</th>
                <th className="px-4 py-3.5 font-semibold">Mô tả chi tiết</th>
                <th className="px-4 py-3.5 font-semibold">IP</th>
                <th className="px-4 py-3.5 font-semibold whitespace-nowrap">Thời gian</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {paginated.length > 0 ? (
                paginated.map((log, index) => {
                  const color = getColor(log.actorId.fullName);
                  return (
                    <tr key={log._id} className="group hover:bg-blue-50/40 transition-colors">
                      {/* STT */}
                      <td className="px-4 py-3.5 text-gray-400 text-sm text-center font-medium">
                        {index + 1 + (page - 1) * limit}
                      </td>

                      {/* Actor */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs
                              font-bold shrink-0 ring-2 select-none ${color.bg} ${color.text} ${color.ring}`}
                          >
                            {getInitials(log.actorId.fullName)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{log.actorId.fullName}</p>
                            <p className="text-xs text-gray-400">{log.actorId.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Action badge */}
                      <td className="px-4 py-3.5">
                        <ActionBadge action={log.action} />
                      </td>

                      {/* Target */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          {log.targetType === 'Role' ? (
                            <Shield size={13} className="text-violet-400 shrink-0" />
                          ) : log.targetType === 'User' ? (
                            <User size={13} className="text-blue-400 shrink-0" />
                          ) : (
                            <Activity size={13} className="text-gray-400 shrink-0" />
                          )}
                          <span className="font-medium">{log.targetName || '—'}</span>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3.5 text-sm text-gray-500 max-w-[220px]">
                        <span className="line-clamp-2">{log.description}</span>
                      </td>

                      {/* IP */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                          {log.ipAddress || '—'}
                        </span>
                      </td>

                      {/* Time */}
                      <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span>{formatDate(log.createdAt)}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(log.createdAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
                        <Search size={24} className="text-gray-300" />
                      </div>
                      <p className="text-sm font-medium text-gray-400">Không tìm thấy bản ghi nào</p>
                      {isFiltered && (
                        <button onClick={handleReset} className="text-xs text-blue-500 hover:underline">
                          Xóa bộ lọc
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TablePagination totalPages={totalPages} page={page} setPage={setPage} limit={limit} setLimit={setLimit} />
      </div>
    </div>
  );
};

export default ActivityLog;
