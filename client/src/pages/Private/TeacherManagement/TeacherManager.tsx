import {
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Filter,
  Calculator,
  MoreVertical,
  Users,
  BookOpen,
  ChevronDown,
  X,
  RefreshCw,
} from 'lucide-react';

import { useState, useEffect, useRef } from 'react';
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
import StatusBadge from '../../../components/StatusBadge';

import useFetch from '../../../hooks/useFetch';
import useDebounce from '../../../hooks/useDebounce';
import { userService } from '../../../services/user.service';

import { formatCurrency } from '../../../utils/format.util';
import { TEACHER_STATUS_OPTIONS, PATHS } from '../../../utils/constants';
import { STATUS_DOTS, getColor, getInitials } from '../../../utils/user.util';
import RequirePermission from '../../../components/RequirePermission';
import { PERMISSIONS } from '../../../utils/permission.constant';

// ─── Main Component ───────────────────────────────────────────────────────────
const TeacherManager = () => {
  const navigate = useNavigate();
  const filterRef = useRef<HTMLDivElement>(null);
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [openStatus, setOpenStatus] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchInput, 500);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'danger' | 'warning' | 'info',
  });

  const [confirmDelete, setConfirmDelete] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'danger' | 'warning' | 'info',
    confirmText: '',
    cancelText: '',
    onConfirm: () => {},
  });

  // ── Click-outside: filter dropdown ───────────────────────────────────────
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setOpenStatus(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Click-outside: action menu ────────────────────────────────────────────
  useEffect(() => {
    if (!openActionMenuId) return;
    const h = (e: MouseEvent) => {
      const el = menuRefs.current[openActionMenuId];
      if (el && !el.contains(e.target as Node)) setOpenActionMenuId(null);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [openActionMenuId]);

  // ── Teachers list ─────────────────────────────────────────────────────────
  const {
    data: teachers,
    loading,
    error,
    totalCount,
    allCount: countAll,
    activeCount: countActive,
    inactiveCount: countInactive,
    refetch: fetchTeachers,
  } = useFetch(
    userService.getAllTeachers,
    {
      page,
      limit,
      search: debouncedSearch,

      ...(statusFilter !== 'ALL' && { status: statusFilter }),
    },
    [page, debouncedSearch, limit, statusFilter],
  );

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteTeacher = async (id: string) => {
    try {
      const data = await userService.deleteUser(id);
      if (data.success) {
        setConfirmDelete({
          isOpen: true,
          title: 'Thành công',
          message: data.message || 'Đã xóa giáo viên!',
          type: 'success',
          confirmText: 'Xác nhận',
          cancelText: '',
          onConfirm: () => setConfirmDelete((p) => ({ ...p, isOpen: false })),
        });
        fetchTeachers();
        setPage(1);
      }
    } catch (error: any) {
      const detailError = error.response?.data?.errors ? Object.values(error.response.data.errors).flat() : null;
      setConfirmDelete({
        isOpen: true,
        title: 'Lỗi',
        message: (detailError?.[0] as string) || 'Có lỗi xảy ra!',
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
    [{ value: 'ALL', label: 'Tất cả' }, ...TEACHER_STATUS_OPTIONS].find((o) => o.value === statusFilter)?.label ??
    'Lọc';
  const fromItem = (page - 1) * limit + 1;
  const toItem = Math.min(page * limit, totalCount ?? 0);

  // ── Error state ───────────────────────────────────────────────────────────
  if (error)
    return <ErrorState msg="Đã có lỗi xảy ra khi tải danh sách giáo viên. Vui lòng thử lại." onRetry={fetchTeachers} />;

  return (
    <div className="p-6 lg:p-8 w-full space-y-6">
      <PageHeader title="Đội ngũ Giáo viên" />

      {/* ── Modals ── */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((p) => ({ ...p, isOpen: false }))}
        onConfirm={() => setConfirmConfig((p) => ({ ...p, isOpen: false }))}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText="Đóng"
        cancelText=""
      />
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

      {/* ══ Stats Bar ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          icon={<Users size={20} />}
          label="Tổng giáo viên"
          value={countAll ?? '—'}
          gradient="bg-gradient-to-br from-slate-600 to-slate-800"
          textColor="text-slate-600"
          active={statusFilter === 'ALL' && !debouncedSearch}
          onClick={handleReset}
        />
        <StatCard
          icon={<BookOpen size={20} />}
          label="Đang giảng dạy"
          value={countActive ?? '—'}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          textColor="text-emerald-600"
          active={statusFilter === 'ACTIVE'}
          onClick={() => {
            setStatusFilter('ACTIVE');
            setPage(1);
          }}
        />
        <StatCard
          icon={<Users size={20} />}
          label="Đã nghỉ"
          value={countInactive ?? '—'}
          gradient="bg-gradient-to-br from-gray-400 to-gray-600"
          textColor="text-gray-500"
          active={statusFilter === 'INACTIVE'}
          onClick={() => {
            setStatusFilter('INACTIVE');
            setPage(1);
          }}
        />
      </div>

      {/* ══ Toolbar ════════════════════════════════════════════════════════ */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex gap-3 items-center flex-1 min-w-0 max-w-2xl">
          <div className="flex-1 min-w-0">
            <SearchInput
              type="text"
              placeholder="Tìm kiếm tên, email, số điện thoại..."
              value={searchInput}
              setSearchInput={setSearchInput}
              setPage={setPage}
            />
          </div>

          {/* ── Filter dropdown ── */}
          <div className="relative shrink-0" ref={filterRef}>
            <button
              type="button"
              onClick={() => setOpenStatus((o) => !o)}
              className={`
                flex items-center gap-2 pl-4 pr-3 py-2 rounded-xl border text-sm font-medium
                transition-all whitespace-nowrap
                ${
                  statusFilter !== 'ALL'
                    ? 'bg-primary text-white border-transparent shadow-md shadow-primary/30'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOTS[statusFilter] ?? 'bg-gray-400'}`} />
              {activeLabel}
              {statusFilter !== 'ALL' ? (
                <X
                  size={13}
                  className="ml-0.5 opacity-80 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusFilter('ALL');
                    setPage(1);
                  }}
                />
              ) : (
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${openStatus ? 'rotate-180' : ''}`}
                />
              )}
            </button>

            {openStatus && (
              <div
                className="absolute top-[calc(100%+6px)] right-0 min-w-[200px] bg-white
                border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5"
              >
                {[...TEACHER_STATUS_OPTIONS].map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      setStatusFilter(opt.value);
                      setPage(1);
                      setOpenStatus(false);
                    }}
                    className={`
                      px-4 py-2.5 cursor-pointer text-sm transition-colors flex items-center gap-3
                      ${
                        statusFilter === opt.value
                          ? 'bg-blue-50 text-blue-600 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOTS[opt.value] ?? 'bg-gray-400'}`} />
                    {opt.label}
                    {statusFilter === opt.value && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <RequirePermission required={PERMISSIONS.TEACHER.CREATE}>
          <Button variant="primary" icon={<Plus size={18} />} onClick={() => navigate(PATHS.HR_TEACHERS_CREATE)}>
            Thêm Giáo viên
          </Button>
        </RequirePermission>
      </div>

      {/* ══ Table Card ═════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* ── Meta row ── */}
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
              trong <span className="font-semibold text-gray-700">{totalCount}</span> giáo viên
              {isFiltered && (
                <button onClick={handleReset} className="ml-2 text-blue-500 hover:underline">
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
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="sticky top-0 z-20">
              <tr className="bg-primary text-white text-sm">
                <th className="px-5 py-3.5 font-semibold w-12 text-center">STT</th>
                <th className="px-5 py-3.5 font-semibold">Giáo viên</th>
                <th className="px-5 py-3.5 font-semibold">Liên hệ</th>
                <th className="px-5 py-3.5 font-semibold w-56">Hồ sơ & Bằng cấp</th>
                <th className="px-5 py-3.5 font-semibold">Lương (Giờ)</th>
                <th className="px-5 py-3.5 font-semibold min-w-[160px]">Trạng thái</th>
                <RequirePermission required={[PERMISSIONS.TEACHER.EDIT, PERMISSIONS.TEACHER.DELETE]}>
                  <th className="px-5 py-3.5 font-semibold text-center">Hành động</th>
                </RequirePermission>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: limit }).map((_, i) => <SkeletonRow key={i} />)
              ) : teachers && teachers.length > 0 ? (
                teachers.map((teacher: any, index: number) => {
                  const color = getColor(teacher.fullName);
                  return (
                    <tr key={teacher._id} className="group hover:bg-blue-50/30 transition-colors">
                      {/* STT */}
                      <td className="px-5 py-4 text-gray-400 text-sm text-center font-medium">
                        {index + 1 + (page - 1) * limit}
                      </td>

                      {/* Avatar + tên + type badge */}
                      <td className="px-5 py-4">
                        <div
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => navigate(PATHS.HR_TEACHERS_ID.replace(':id', teacher._id))}
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center
                            text-sm font-bold shrink-0 ring-2 select-none
                            ${color.bg} ${color.text} ${color.ring}`}
                          >
                            {getInitials(teacher.fullName)}
                          </div>
                          <div>
                            <div
                              className="font-semibold text-gray-800
                              group-hover:text-indigo-700 transition-colors leading-snug"
                            >
                              {teacher.fullName}
                            </div>
                            {teacher.teacher_info?.type && (
                              <span
                                className="text-[10px] bg-amber-100 text-amber-700
                                px-1.5 py-0.5 rounded font-bold uppercase mt-0.5 inline-block tracking-wide"
                              >
                                {teacher.teacher_info.type === 'FULL_TIME' ? 'Full-time' : 'Part-time'}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Liên hệ */}
                      <td className="px-5 py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={13} className="text-gray-400 shrink-0" />
                            <span>{teacher.phone || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Mail size={13} className="text-gray-400 shrink-0" />
                            <span className="truncate max-w-[160px]">{teacher.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Bằng cấp */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {teacher.degrees?.length > 0 ? (
                            teacher.degrees.map((degree: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs
                                  font-medium rounded-lg border border-blue-100"
                              >
                                {degree}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400 italic">Chưa cập nhật</span>
                          )}
                        </div>
                      </td>

                      {/* Lương/giờ */}
                      <td className="px-5 py-4">
                        <span
                          className="font-semibold text-emerald-600 bg-emerald-50
                          px-2.5 py-1.5 rounded-lg border border-emerald-100 whitespace-nowrap text-sm"
                        >
                          {formatCurrency(teacher.teacher_info?.hourlyRate || 0)}/h
                        </span>
                      </td>

                      {/* Trạng thái */}
                      <td className="px-5 py-4">
                        <StatusBadge
                          status={teacher.status}
                          label={teacher.status === 'ACTIVE' ? 'Đang giảng dạy' : 'Đã nghỉ'}
                        />
                      </td>
                      {/* Action menu (giữ nguyên MoreVertical) */}
                      <RequirePermission required={[PERMISSIONS.TEACHER.EDIT, PERMISSIONS.TEACHER.DELETE]}>
                        <td className="px-5 py-4 text-center">
                          <div
                            className="relative flex justify-center"
                            ref={(el) => {
                              menuRefs.current[teacher._id] = el;
                            }}
                          >
                            <button
                              className="p-2 text-gray-400 hover:text-indigo-600
                              hover:bg-indigo-50 rounded-xl transition-colors focus:outline-none"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionMenuId(openActionMenuId === teacher._id ? null : teacher._id);
                              }}
                            >
                              <MoreVertical size={18} />
                            </button>

                            {openActionMenuId === teacher._id && (
                              <div
                                className="absolute right-0 top-[calc(100%+4px)] w-52 bg-white
                              border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden
                              py-1.5 animate-in zoom-in-95 duration-100"
                              >
                                {/* <button
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700
                                  hover:bg-amber-50 hover:text-amber-700
                                  flex items-center gap-3 transition-colors"
                                onClick={() => setOpenActionMenuId(null)}
                              >
                                <CalendarIcon size={15} /> Xếp lịch dạy
                              </button> */}

                                {/* <button
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700
                                  hover:bg-emerald-50 hover:text-emerald-700
                                  flex items-center gap-3 transition-colors"
                                onClick={() => setOpenActionMenuId(null)}
                              >
                                <Calculator size={15} /> Tính lương tháng
                              </button> */}

                                <div className="h-px bg-gray-100 my-1" />

                                <RequirePermission required={PERMISSIONS.TEACHER.EDIT}>
                                  <button
                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700
                                  hover:bg-indigo-50 hover:text-indigo-700
                                  flex items-center gap-3 transition-colors"
                                    onClick={() => {
                                      navigate(PATHS.HR_TEACHERS_EDIT.replace(':id', teacher._id));
                                      setOpenActionMenuId(null);
                                    }}
                                  >
                                    <Edit2 size={15} /> Chỉnh sửa hồ sơ
                                  </button>
                                </RequirePermission>
                                <RequirePermission required={PERMISSIONS.TEACHER.EDIT}>
                                  <button
                                    className="w-full px-4 py-2.5 text-left text-sm text-red-500
                                  hover:bg-red-50 hover:text-red-600
                                  flex items-center gap-3 transition-colors"
                                    onClick={() => {
                                      setConfirmDelete({
                                        isOpen: true,
                                        title: 'Xác nhận xóa',
                                        message: `Bạn có chắc chắn muốn xóa giáo viên "${teacher.fullName}"?`,
                                        type: 'danger',
                                        confirmText: 'Xóa',
                                        cancelText: 'Hủy',
                                        onConfirm: () => handleDeleteTeacher(teacher._id),
                                      });
                                      setOpenActionMenuId(null);
                                    }}
                                  >
                                    <Trash2 size={15} /> Xóa giáo viên
                                  </button>
                                </RequirePermission>
                              </div>
                            )}
                          </div>
                        </td>
                      </RequirePermission>
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

export default TeacherManager;
