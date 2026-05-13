import {
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  User as UserIcon,
  Headset,
  GraduationCap,
  BookOpen,
  UserCheck,
  Users,
  RefreshCw,
  X,
  ChevronDown,
} from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../../../components/Button';
import PageHeader from '../../../components/PageHeader';
import TablePagination from '../../../components/TablePagination';
import SearchInput from '../../../components/SearchInput';
import ConfirmModal from '../../../components/ConfirmModal';
import StatCard from '../../../components/StatCard';
import SkeletonRow from '../../../components/SkeletonRow';
import EmptyState from '../../../components/EmptyState';
import ErrorState from '../../../components/ErrorState';

import useFetch from '../../../hooks/useFetch';
import useDebounce from '../../../hooks/useDebounce';

import { userService } from '../../../services/user.service';
import { roleService } from '../../../services/role.service';

import type { IUser } from '../../../types/user.type';

import { formatDate, getStatusUserStyles } from '../../../utils/format.util';
import { STATUS_OPTIONS, PATHS } from '../../../utils/constants';
import { getColor, getInitials, STATUS_DOTS } from '../../../utils/user.util';

// ─── Main Component ───────────────────────────────────────────────────────────
const StudentManager = () => {
  const navigate = useNavigate();
  const filterRef = useRef<HTMLDivElement>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [openStatus, setOpenStatus] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger' as 'success' | 'danger' | 'warning' | 'info',
    confirmText: '',
    cancelText: '',
    onConfirm: () => { },
  });

  const debouncedSearch = useDebounce(searchInput, 500);

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setOpenStatus(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const {
    data: students,
    loading,
    error,
    totalCount,
    refetch: fetchStudents,
    summary,
  } = useFetch(
    userService.getAllStudents,
    {
      page,
      limit,
      search: debouncedSearch,

      ...(statusFilter !== 'ALL' && { status: statusFilter }),
    },
    [page, debouncedSearch, limit, statusFilter],
  );

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteStudent = async (id: string) => {
    try {
      const res = await userService.deleteUser(id);
      if (res.success) {
        setConfirmDelete({
          isOpen: true,
          title: 'Thành công',
          message: res.message || 'Đã xóa học viên!',
          type: 'success',
          confirmText: 'Xác nhận',
          cancelText: '',
          onConfirm: () => setConfirmDelete((p) => ({ ...p, isOpen: false })),
        });
        fetchStudents();
        setPage(1);
      }
    } catch (err: any) {
      setConfirmDelete({
        isOpen: true,
        title: 'Lỗi',
        message: err.response?.data?.message || 'Có lỗi xảy ra khi xóa!',
        type: 'danger',
        confirmText: 'Đóng',
        cancelText: '',
        onConfirm: () => setConfirmDelete((p) => ({ ...p, isOpen: false })),
      });
    }
  };

  const totalPages = Math.ceil((totalCount || 0) / limit);
  const isFiltered = !!debouncedSearch || statusFilter !== 'ALL';
  const handleReset = () => {
    setSearchInput('');
    setStatusFilter('ALL');
    setPage(1);
  };
  const activeLabel =
    [{ value: 'ALL', label: 'Tất cả' }, ...STATUS_OPTIONS].find((o) => o.value === statusFilter)?.label ??
    'Lọc trạng thái';

  if (error) return <ErrorState msg={String(error)} onRetry={fetchStudents} />;

  const fromItem = (page - 1) * limit + 1;
  const toItem = Math.min(page * limit, totalCount ?? 0);

  return (
    <div className="p-6 lg:p-8 w-full space-y-6">
      <PageHeader title="Quản lý Học viên" />

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete((p) => ({ ...p, isOpen: false }))}
        onConfirm={confirmDelete.onConfirm}
        title={confirmDelete.title}
        message={confirmDelete.message}
        type={confirmDelete.type}
        confirmText={confirmDelete.confirmText}
        cancelText={confirmDelete.cancelText}
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          label="Tổng học viên"
          icon={<Users size={20} />}
          value={summary?.total ?? '—'}
          gradient="bg-gradient-to-br from-slate-600 to-slate-800"
          textColor="text-slate-600"
          active={statusFilter === 'ALL' && !debouncedSearch}
          onClick={handleReset}
        />
        <StatCard
          icon={<BookOpen size={20} />}
          label="Đang học"
          value={summary?.active ?? '—'}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          textColor="text-emerald-600"
          active={statusFilter === 'ACTIVE'}
          onClick={() => {
            setStatusFilter('ACTIVE');
            setPage(1);
          }}
        />
        <StatCard
          icon={<UserCheck size={20} />}
          label="Tiềm năng"
          value={summary?.potential ?? '—'}
          gradient="bg-gradient-to-br from-amber-400 to-orange-500"
          textColor="text-amber-600"
          active={statusFilter === 'POTENTIAL'}
          onClick={() => {
            setStatusFilter('POTENTIAL');
            setPage(1);
          }}
        />
        <StatCard
          icon={<GraduationCap size={20} />}
          label="Bảo lưu"
          value={summary?.reserved ?? '—'}
          gradient="bg-gradient-to-br from-sky-400 to-blue-600"
          textColor="text-sky-600"
          active={statusFilter === 'RESERVED'}
          onClick={() => {
            setStatusFilter('RESERVED');
            setPage(1);
          }}
        />
        <StatCard
          icon={<GraduationCap size={20} />}
          label="Đã nghỉ"
          value={summary?.inactive ?? '—'}
          gradient="bg-gradient-to-br from-rose-400 to-red-500"
          textColor="text-rose-600"
          active={statusFilter === 'INACTIVE'}
          onClick={() => {
            setStatusFilter('INACTIVE');
            setPage(1);
          }}
        />
      </div>

      <div className="flex flex-wrap justify-between items-center gap-3">
        {/* Search + Filter */}
        <div className="flex gap-3 items-center flex-1 min-w-0 max-w-2xl">
          <div className="flex-1 min-w-0">
            <SearchInput
              type="text"
              placeholder="Tìm tên, email, số điện thoại..."
              value={searchInput}
              setSearchInput={setSearchInput}
              setPage={setPage}
            />
          </div>

          {/* Filter dropdown */}
          <div className="relative shrink-0" ref={filterRef}>
            <button
              type="button"
              onClick={() => setOpenStatus((o) => !o)}
              className={`
                flex items-center gap-2 pl-4 pr-3 py-2 rounded-xl border text-sm font-medium
                transition-all whitespace-nowrap
                ${statusFilter !== 'ALL'
                  ? 'bg-primary text-white border-transparent shadow-md shadow-primary/30'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOTS[statusFilter]}`} />
              {activeLabel}
              {statusFilter !== 'ALL' ? (
                <X
                  size={13}
                  className="ml-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusFilter('ALL');
                    setPage(1);
                  }}
                />
              ) : (
                <ChevronDown size={14} className={`transition-transform ${openStatus ? 'rotate-180' : ''}`} />
              )}
            </button>

            {openStatus && (
              <div
                className="absolute top-[calc(100%+6px)] right-0 min-w-[200px] bg-white
                border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5"
              >
                {[...STATUS_OPTIONS].map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      setStatusFilter(opt.value);
                      setPage(1);
                      setOpenStatus(false);
                    }}
                    className={`
                      px-4 py-2.5 cursor-pointer text-sm transition-colors flex items-center gap-3
                      ${statusFilter === opt.value
                        ? 'bg-blue-50 text-blue-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOTS[opt.value]}`} />
                    {opt.label}
                    {statusFilter === opt.value && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button variant="primary" icon={<Plus size={18} />} onClick={() => navigate(PATHS.TRAINING_STUDENT_CREATE)}>
          Thêm Học viên
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table meta row */}
        {!loading && (totalCount ?? 0) > 0 && (
          <div
            className="flex items-center justify-between px-5 py-3
            border-b border-gray-100 bg-gray-50/60"
          >
            <p className="text-xs text-gray-500">
              Hiển thị{' '}
              <span className="font-semibold text-gray-700">
                {fromItem}–{toItem}
              </span>{' '}
              trong <span className="font-semibold text-gray-700">{totalCount}</span> học viên
              {isFiltered && (
                <button
                  onClick={handleReset}
                  className="ml-2 text-blue-500 hover:text-blue-700 underline underline-offset-2"
                >
                  xóa bộ lọc
                </button>
              )}
            </p>
            {isFiltered && (
              <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-600 font-medium rounded-full">
                Đang lọc: {activeLabel}
              </span>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-primary text-white text-sm">
                <th className="px-5 py-3.5 font-semibold w-12 text-center">STT</th>
                <th className="px-5 py-3.5 font-semibold">Học viên</th>
                <th className="px-5 py-3.5 font-semibold">Liên hệ & Chăm sóc</th>
                <th className="px-5 py-3.5 font-semibold">Ngày sinh</th>
                <th className="px-5 py-3.5 font-semibold">Trạng thái</th>
                <th className="px-5 py-3.5 font-semibold text-center">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: limit }).map((_, i) => <SkeletonRow key={i} />)
              ) : students && (students as IUser[]).length > 0 ? (
                (students as IUser[]).map((student: any, index: number) => {
                  const color = getColor(student.fullName);
                  const consultant = student.student_info?.consultantId?.fullName;

                  return (
                    <tr key={student._id} className="group hover:bg-slate-50/80 transition-colors">
                      {/* STT */}
                      <td className="px-5 py-4 text-gray-400 text-sm text-center font-medium">
                        {index + 1 + (page - 1) * limit}
                      </td>

                      {/* Avatar + tên + email */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center
                              text-sm font-bold shrink-0 ring-2 select-none
                              ${color.bg} ${color.text} ${color.ring}`}
                          >
                            {getInitials(student.fullName)}
                          </div>
                          <div className="min-w-0">
                            <div
                              className="font-semibold text-gray-800 cursor-pointer
                                hover:text-blue-600 transition-colors truncate max-w-[160px]"
                              onClick={() => navigate(PATHS.TRAINING_STUDENT_ID.replace(':id', student._id || ''))}
                            >
                              {student.fullName}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                              <Mail size={11} className="shrink-0" />
                              <span className="truncate max-w-[150px]">{student.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Phone + PH + Sale */}
                      <td className="px-5 py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={13} className="text-gray-400 shrink-0" />
                            <span>{student.phone || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <UserIcon size={13} className="text-gray-400 shrink-0" />
                            <span>
                              PH:{' '}
                              <span className="font-medium text-gray-700">
                                {student.student_info?.parentsName || 'N/A'}
                              </span>
                            </span>
                          </div>
                          {/* Sale badge */}
                          <div
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-medium
                            ${consultant ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}
                          >
                            <Headset size={11} className="shrink-0" />
                            {consultant ?? 'Chưa phân công'}
                          </div>
                        </div>
                      </td>

                      {/* Ngày sinh */}
                      <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(student.date as string)}
                      </td>

                      {/* Trạng thái */}
                      <td className="px-5 py-4">
                        <span className={getStatusUserStyles(student.status as string)}>
                          {STATUS_OPTIONS.find((o) => o.value === student.status)?.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => navigate(PATHS.TRAINING_STUDENT_EDIT.replace(':id', student._id || ''))}
                            title="Chỉnh sửa"
                            className="p-2 rounded-xl text-blue-500
                              hover:bg-blue-50 hover:text-blue-700
                              transition-all hover:scale-110 active:scale-95"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() =>
                              setConfirmDelete({
                                isOpen: true,
                                title: 'Xác nhận xóa',
                                message: `Bạn có chắc muốn xóa học viên "${student.fullName}"?`,
                                type: 'danger',
                                confirmText: 'Xóa',
                                cancelText: 'Hủy',
                                onConfirm: () => handleDeleteStudent(student._id),
                              })
                            }
                            title="Xóa"
                            className="p-2 rounded-xl text-red-400
                              hover:bg-red-50 hover:text-red-600
                              transition-all hover:scale-110 active:scale-95"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <EmptyState isFiltered={isFiltered} onReset={handleReset} />
              )}
            </tbody>
          </table>
        </div>

        <TablePagination totalPages={totalPages} page={page} setPage={setPage} limit={limit} setLimit={setLimit} />
      </div>
    </div>
  );
};

export default StudentManager;
