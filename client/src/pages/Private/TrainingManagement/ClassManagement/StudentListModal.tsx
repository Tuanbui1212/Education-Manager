import React, { useState, useEffect } from 'react';
import { X, GraduationCap } from 'lucide-react';
import SearchInput from '../../../../components/SearchInput';
import TablePagination from '../../../../components/TablePagination';
import TableSkeleton from '../../../../components/TableSkeleton';
import useFetch from '../../../../hooks/useFetch';
import useDebounce from '../../../../hooks/useDebounce';
import { classService } from '../../../../services/class.service';

interface StudentListModalProps {
    isOpen: boolean;
    onClose: () => void;
    classId: string;
    className: string;
}

const StudentListModal: React.FC<StudentListModalProps> = ({ isOpen, onClose, classId, className }) => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebounce(searchInput, 500);

    const queryParams = {
        page,
        limit,
        search: debouncedSearch,
    };

    const {
        data: students,
        loading,
        totalCount,
    } = useFetch(
        async () => {
            if (!isOpen) return { success: true, data: [], message: '', totalCount: 0 };
            return classService.getStudentsByClass(classId, queryParams);
        },
        null,
        [isOpen, page, limit, debouncedSearch, classId]
    );

    useEffect(() => {
        if (isOpen) {
            setPage(1);
            setSearchInput('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const totalPages = Math.ceil((totalCount || 0) / limit);

    return (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-primary p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <GraduationCap size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Danh sách học viên</h3>
                            <p className="text-sm opacity-80 text-white/90">Lớp: {className}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <SearchInput
                                type="text"
                                placeholder="Tìm kiếm tên học viên..."
                                value={searchInput}
                                setSearchInput={setSearchInput}
                                setPage={setPage}
                            />
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden shadow-inner min-h-[300px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-200/50 text-gray-700 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-bold w-16 text-center">STT</th>
                                    <th className="p-4 font-bold text-center">Tên học viên</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {loading ? (
                                    <TableSkeleton columns={2} rows={limit} />
                                ) : students && students.length > 0 ? (
                                    students.map((student: any, index: number) => (
                                        <tr key={student._id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="p-4 text-center text-gray-500 font-medium">
                                                {index + 1 + (page - 1) * limit}
                                            </td>
                                            <td className="p-4 font-semibold text-gray-800 text-center">
                                                {student.fullName}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={2} className="p-10 text-center text-gray-400 italic">
                                            Không có học viên nào trong lớp này
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <TablePagination
                        totalPages={totalPages}
                        page={page}
                        setPage={setPage}
                        limit={limit}
                        setLimit={setLimit}
                    />
                </div>

                <div className="bg-gray-50 p-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentListModal;
