import { Plus, Filter, Edit2, Trash2 } from 'lucide-react';
import { getNotificationTypeStyles } from '../../../utils/format.util';

import Button from '../../../components/Button';
import PageHeader from '../../../components/PageHeader';
import TablePagination from '../../../components/TablePagination';
import SearchInput from '../../../components/SearchInput';
import ConfirmModal from '../../../components/ConfirmModal';

import NotificationTemplateModal from './NotificationTemplateModal';

import useFetch from '../../../hooks/useFetch';
import useDebounce from '../../../hooks/useDebounce';

import { notificationTemplateService } from '../../../services/notificationTemplate.service';

import { useState } from 'react';
import type { INotificationTemplate, NotificationType } from '../../../types/notificationTemplate.type';

const ListNotificationTemplate = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [searchInput, setSearchInput] = useState('');
    const [type, setType] = useState('');
    const [open, setOpen] = useState(false);

    const [showModalAdd, setShowModalAdd] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<INotificationTemplate | null>(null);

    const debouncedSearch = useDebounce(searchInput, 500);

    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success' as 'success' | 'danger' | 'warning' | 'info',
        onConfirm: () => { },
    });

    const queryParams = {
        page,
        limit,
        search: debouncedSearch,
        type: (type as NotificationType) || undefined,
    };

    const {
        data: templates,
        loading,
        error,
        totalCount,
        refetch: fetchTemplates,
    } = useFetch(notificationTemplateService.getTemplates, queryParams, [page, debouncedSearch, type, limit]);

    const handleCreateTemplate = async (formData: Partial<INotificationTemplate>) => {
        try {
            const data = await notificationTemplateService.createTemplate(formData);
            if (data.success) {
                setConfirmConfig({
                    isOpen: true,
                    title: 'Thông báo',
                    message: data.message,
                    type: 'success',
                    onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
                });
                fetchTemplates();
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

    const handleUpdateTemplate = async (formData: Partial<INotificationTemplate>) => {
        if (!selectedTemplate?._id) return;

        try {
            const data = await notificationTemplateService.updateTemplate(selectedTemplate._id, formData);
            if (data.success) {
                setConfirmConfig({
                    isOpen: true,
                    title: 'Thông báo',
                    message: data.message,
                    type: 'success',
                    onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
                });

                fetchTemplates();
                setShowModalAdd(false);
                setSelectedTemplate(null);
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

    const handleDeleteTemplate = async (id: string) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Xác nhận xóa',
            message: 'Bạn có chắc chắn muốn xóa mẫu thông báo này?',
            type: 'warning',
            onConfirm: async () => {
                try {
                    const data = await notificationTemplateService.deleteTemplate(id);
                    if (data.success) {
                        setConfirmConfig({
                            isOpen: true,
                            title: 'Thông báo',
                            message: data.message,
                            type: 'success',
                            onConfirm: () => setConfirmConfig({ ...confirmConfig, isOpen: false }),
                        });
                        fetchTemplates();
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

    const openEditModal = (template: INotificationTemplate) => {
        setSelectedTemplate(template);
        setShowModalAdd(true);
    };

    const totalPages = Math.ceil((totalCount || 0) / limit);

    if (error) return <div className="p-8 text-red-500 text-center">Lỗi: {error}</div>;

    return (
        <div className="p-8 w-full ">
            <NotificationTemplateModal
                isOpen={showModalAdd}
                onClose={() => {
                    setShowModalAdd(false);
                    setSelectedTemplate(null);
                }}
                onSubmit={selectedTemplate?._id ? handleUpdateTemplate : handleCreateTemplate}
                initialData={selectedTemplate || undefined}
            />
            <PageHeader title="Quản lý mẫu thông báo" />
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
                        placeholder="Tìm kiếm mẫu thông báo..."
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
                                    { label: 'Tất cả loại', value: '' },
                                    { label: 'Email', value: 'EMAIL' },
                                    { label: 'SMS', value: 'SMS' },
                                ].map((item) => (
                                    <div
                                        key={item.value}
                                        onClick={() => {
                                            setType(item.value);
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
                    Thêm mẫu
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-primary text-white text-sm sticky top-0 z-10 ">
                            <th className="p-4 font-semibold w-16 text-center rounded-tl-xl">No.</th>
                            <th className="p-4 font-semibold">Tiêu đề mẫu</th>
                            <th className="p-4 font-semibold">Loại</th>
                            <th className="p-4 font-semibold">Nội dung (Rút gọn)</th>
                            <th className="p-4 font-semibold text-center rounded-tr-xl">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {templates && templates.length > 0 ? (
                            templates.map((template, index) => (
                                <tr key={template._id} className="hover:bg-blue-50/50 transition-colors group">
                                    <td className="p-4 text-text-secondary font-medium text-center">{index + 1 + (page - 1) * limit}</td>
                                    <td className="p-4 font-semibold text-blue-600">
                                        {template.title}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getNotificationTypeStyles(template.type)}`}>
                                            {template.type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-text-main max-w-xs truncate">
                                        {template.content}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => openEditModal(template)}
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95"
                                                title="Sửa"
                                            >
                                                <Edit2 size={18} />
                                            </button>

                                            <button
                                                onClick={() => template._id && handleDeleteTemplate(template._id)}
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

export default ListNotificationTemplate;
