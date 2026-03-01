import { Plus, Filter, Edit2, Trash2 } from 'lucide-react';
import { getRoomStatusStyles } from '../../../utils/format.util';

import Button from '../../../components/Button';
import PageHeader from '../../../components/PageHeader';
import TablePagination from '../../../components/TablePagination';
import SearchInput from '../../../components/SearchInput';
import ConfirmModal from '../../../components/ConfirmModal';

import RoomModal from './RoomModal';

import useFetch from '../../../hooks/useFetch';
import useDebounce from '../../../hooks/useDebounce';

import { roomService } from '../../../services/room.service';

import { useState } from 'react';
import type { GetRoomsParams, IRoom, RoomStatus } from '../../../types/room.type';

const ListRoom = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [searchInput, setSearchInput] = useState('');
    const [status, setStatus] = useState<RoomStatus>();
    const [open, setOpen] = useState(false);

    const [showModalAdd, setShowModalAdd] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);

    const debouncedSearch = useDebounce(searchInput, 500);

    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success' as 'success' | 'danger' | 'warning' | 'info',
        onConfirm: () => { },
    });

    const queryParams: GetRoomsParams = {
        page,
        limit,
        search: debouncedSearch,
        status: status || undefined,
    };

    const {
        data: rooms,
        loading,
        error,
        totalCount,
        refetch: fetchRooms,
    } = useFetch(roomService.getRooms, queryParams, [page, debouncedSearch, status, limit]);

    const handleCreateRoom = async (formData: Partial<IRoom>) => {
        try {
            const data = await roomService.createRoom(formData);
            if (data.success) {
                setConfirmConfig({
                    isOpen: true,
                    title: 'Thông báo',
                    message: data.message,
                    type: 'success',
                    onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
                });
                fetchRooms();
                setShowModalAdd(false);
                setPage(1);
            }
        } catch (error: any) {
            const detailError = error.response?.data?.message || 'Có lỗi xảy ra khi thêm mới!';
            setConfirmConfig({
                isOpen: true,
                title: 'Lỗi',
                message: detailError,
                type: 'danger',
                onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
            });
        }
    };

    const handleUpdateRoom = async (formData: Partial<IRoom>) => {
        if (!selectedRoom?._id) return;

        try {
            const data = await roomService.updateRoom(selectedRoom._id, formData);
            if (data.success) {
                setConfirmConfig({
                    isOpen: true,
                    title: 'Thông báo',
                    message: data.message,
                    type: 'success',
                    onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
                });

                fetchRooms();
                setShowModalAdd(false);
                setSelectedRoom(null);
            }
        } catch (error: any) {
            const detailError = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật!';
            setConfirmConfig({
                isOpen: true,
                title: 'Lỗi',
                message: detailError,
                type: 'danger',
                onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
            });
        }
    };

    const handleDeleteRoom = async (id: string) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Xác nhận xóa',
            message: 'Bạn có chắc chắn muốn xóa phòng này?',
            type: 'warning',
            onConfirm: async () => {
                try {
                    const data = await roomService.deleteRoom(id);
                    if (data.success) {
                        setConfirmConfig({
                            isOpen: true,
                            title: 'Thông báo',
                            message: data.message,
                            type: 'success',
                            onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
                        });
                        fetchRooms();
                    }
                } catch (error: any) {
                    const detailError = error.response?.data?.message || 'Có lỗi xảy ra khi xóa!';
                    setConfirmConfig({
                        isOpen: true,
                        title: 'Lỗi',
                        message: detailError,
                        type: 'danger',
                        onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
                    });
                }
            },
        });
    };

    const openEditModal = async (room: IRoom) => {
        setSelectedRoom(room);
        setShowModalAdd(true);
    };

    const totalPages = Math.ceil((totalCount || 0) / limit);

    if (error) return <div className="p-8 text-red-500 text-center">Lỗi: {error}</div>;

    return (
        <div className="p-8 w-full ">
            <RoomModal
                isOpen={showModalAdd}
                onClose={() => {
                    setShowModalAdd(false);
                    setSelectedRoom(null);
                }}
                onSubmit={selectedRoom?._id ? handleUpdateRoom : handleCreateRoom}
                initialData={selectedRoom || undefined}
            />
            <PageHeader title="Quản lý phòng học" />
            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
                confirmText="Xác nhận"
                cancelText={confirmConfig.type === 'warning' ? 'Hủy' : ''}
            />
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div className="flex gap-4 items-center flex-1 max-w-2xl">
                    <SearchInput
                        type="text"
                        placeholder="Tìm kiếm tên phòng..."
                        value={searchInput}
                        setSearchInput={setSearchInput}
                        setPage={setPage}
                    />

                    <div className="relative inline-block">
                        <Button variant="outline" icon={<Filter size={18} />} onClick={() => setOpen(!open)}>
                            Lọc
                        </Button>

                        {open && (
                            <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                {[
                                    { label: 'Tất cả trạng thái', value: '' },
                                    { label: 'Hoạt động', value: 'ACTIVE' },
                                    { label: 'Bảo trì', value: 'MAINTENANCE' },
                                    { label: 'Ngừng hoạt động', value: 'INACTIVE' },
                                ].map((item) => (
                                    <div
                                        key={item.value}
                                        onClick={() => {
                                            setStatus(item.value as RoomStatus);
                                            setPage(1);
                                            setOpen(false);
                                        }}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                    >
                                        {item.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <Button variant="primary" icon={<Plus size={18} />} onClick={() => setShowModalAdd(true)}>
                    Thêm phòng
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-primary text-white text-sm sticky top-0 z-10 ">
                            <th className="p-4 font-semibold w-16 text-center rounded-tl-xl">No.</th>
                            <th className="p-4 font-semibold">Tên phòng</th>
                            <th className="p-4 font-semibold">Sức chứa</th>
                            <th className="p-4 font-semibold">Trạng thái</th>
                            <th className="p-4 font-semibold text-center rounded-tr-xl">hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rooms && rooms.length > 0 ? (
                            rooms.map((room, index) => (
                                <tr key={room._id} className="hover:bg-blue-50/50 transition-colors group">
                                    <td className="p-4 text-text-secondary font-medium text-center">{index + 1 + (page - 1) * limit}</td>
                                    <td className="p-4 font-semibold text-blue-600">
                                        {room.name}
                                    </td>
                                    <td className="p-4 text-text-main">{room.capacity} học sinh</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getRoomStatusStyles(room.status)}`}>
                                            {room.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => openEditModal(room)}
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95"
                                                title="Sửa"
                                            >
                                                <Edit2 size={18} />
                                            </button>

                                            <button
                                                onClick={() => room._id && handleDeleteRoom(room._id)}
                                                className="p-2 text-red-500 hover:bg-red-100 rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-12 active:scale-95"
                                                title="Xóa"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : !loading ? (
                            <tr>
                                <td colSpan={5} className="p-10 text-center text-gray-500">
                                    Không tìm thấy dữ liệu nào.
                                </td>
                            </tr>
                        ) : (
                            Array.from({ length: limit }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={5} className="p-8 bg-gray-50/50"></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <TablePagination totalPages={totalPages} page={page} setPage={setPage} limit={limit} setLimit={setLimit} />
            </div>
        </div>
    );
};

export default ListRoom;