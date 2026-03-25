import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, MapPin, User, ChevronRight } from 'lucide-react';

import PageHeader from '../../../../components/PageHeader';
import TablePagination from '../../../../components/TablePagination';
import SearchInput from '../../../../components/SearchInput';
import TableSkeleton from '../../../../components/TableSkeleton';

import useFetch from '../../../../hooks/useFetch';
import useDebounce from '../../../../hooks/useDebounce';

import { attendanceService } from '../../../../services/attendance.service';

const AttendanceManagement = () => {
    const navigate = useNavigate();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchInput, setSearchInput] = useState('');

    const debouncedSearch = useDebounce(searchInput, 500);

    const queryParams = {
        page,
        limit,
        search: debouncedSearch,
    };

    const {
        data: classes,
        loading,
        totalCount,
    } = useFetch(
        () => attendanceService.getActiveClasses(queryParams),
        null,
        [page, debouncedSearch, limit]
    );

    const renderTableBody = () => {
        if (loading) {
            return <TableSkeleton columns={5} />;
        }

        if (!classes || classes.length === 0) {
            return (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                            <BookOpen className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-base font-medium text-gray-900 mb-1">Không có dữ liệu</p>
                            <p className="text-sm">Hiện chưa có lớp học nào đang hoạt động.</p>
                        </div>
                    </td>
                </tr>
            );
        }

        return classes.map((cls) => (
            <tr
                key={cls._id}
                className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 cursor-pointer"
                onClick={() => navigate(`/training/attendances/${cls._id}`)}
            >
                <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-primary/10 rounded-xl flex items-center justify-center">
                            <BookOpen size={20} className="text-primary" />
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{cls.name}</div>
                        </div>
                    </div>
                </td>
                <td className="px-4 md:px-6 py-4">
                    <div className="text-sm text-gray-600">{cls.courseName || '—'}</div>
                </td>
                <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600">
                        <User size={16} className="mr-2 text-gray-400" />
                        {cls.teacherName || '—'}
                    </div>
                </td>
                <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600">
                        <MapPin size={16} className="mr-2 text-gray-400" />
                        {cls.roomName || '—'}
                    </div>
                </td>
                <td className="px-4 md:px-6 py-4 text-center">
                    <div className="flex justify-center text-gray-400 group-hover:text-primary transition-colors">
                        <ChevronRight size={20} />
                    </div>
                </td>
            </tr>
        ));
    };

    return (
        <div className="p-8 w-full animate-in fade-in duration-500">
            <PageHeader
                title="Quản lý điểm danh"
            />

            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <div className="flex gap-4 items-center flex-1 max-w-3xl">
                    <div className="relative flex-1">
                        <SearchInput
                            type="text"
                            value={searchInput}
                            setSearchInput={setSearchInput}
                            setPage={setPage}
                            placeholder="Tìm kiếm theo Tên lớp học..."
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-primary text-white">
                                <th className="p-5 font-bold text-xs uppercase tracking-wider">Tên lớp học</th>
                                <th className="p-5 font-bold text-xs uppercase tracking-wider">Khóa học</th>
                                <th className="p-5 font-bold text-xs uppercase tracking-wider">Giáo viên</th>
                                <th className="p-5 font-bold text-xs uppercase tracking-wider">Phòng học</th>
                                <th className="p-5 font-bold text-xs uppercase tracking-wider text-center">Xem lịch</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {renderTableBody()}
                        </tbody>
                    </table>
                </div>
                <TablePagination
                    totalPages={Math.ceil((totalCount || 0) / limit)}
                    page={page}
                    setPage={setPage}
                    limit={limit}
                    setLimit={setLimit}
                />
            </div>

        </div>
    );
};

export default AttendanceManagement;
