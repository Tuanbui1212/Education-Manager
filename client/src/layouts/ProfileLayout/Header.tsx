import { useState, useEffect, useRef } from 'react';
import { Bell, GraduationCap, LogOut, CheckCircle2, Trash2 } from 'lucide-react';
import { getDecodedToken } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { attendanceNotificationService } from '../../services/attendanceNotification.service';
import { API_ROOT } from '../../utils/constants';
import { toast } from 'react-toastify';

const Header = () => {
    const currentUser = getDecodedToken();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (currentUser?.id) {
            attendanceNotificationService.getNotifications({ page: 1, limit: 10 })
                .then(res => {
                    if (res.success) {
                        setNotifications(res.data);
                        setUnreadCount(res.unreadCount);
                    }
                })
                .catch(err => console.error(err));

            const socketUrl = API_ROOT ? API_ROOT.replace('/api', '') : 'http://localhost:5000';
            const socket = io(socketUrl, {
                withCredentials: true,
            });

            socket.on('connect', () => {
                socket.emit('join', currentUser.id);
            });

            socket.on('new_notification', (data) => {
                setNotifications(prev => [data, ...prev]);
                setUnreadCount(prev => prev + 1);
                toast.info(`Thông báo mới: ${data.title}`);
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [currentUser?.id]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (notif: any) => {
        if (!notif.isRead) {
            try {
                await attendanceNotificationService.markAsRead(notif._id);
                setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (err) {
                console.error(err);
            }
        }
        setIsDropdownOpen(false);
    };

    const handleMarkAllAsRead = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await attendanceNotificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteAllRead = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await attendanceNotificationService.deleteAllRead();
            setNotifications(prev => prev.filter(n => !n.isRead));
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };
    return (
        <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-600/20">
                            <GraduationCap size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 tracking-tight">EduCenter</h1>
                            <p className="text-[10px] uppercase tracking-widest text-blue-600 font-bold">Parent Portal</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* User Profile */}
                        <div className="relative flex items-center gap-2 cursor-pointer hover:bg-blue-50 p-3 rounded-full transition-colors">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                {currentUser?.name?.charAt(0).toUpperCase() ?? 'N/A'}
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className="text-sm font-semibold text-gray-800">Hồ sơ: {currentUser?.name ?? 'N/A'}</p>
                            </div>
                        </div>

                        {/* Notification & Logout */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                            >
                                <Bell size={24} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold text-white flex items-center justify-center bg-red-500 rounded-full border-2 border-white">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-[-10px] top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                                    <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                                        <h3 className="font-semibold text-gray-800 text-sm">Thông báo</h3>
                                        <div className="flex gap-3">
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={handleMarkAllAsRead}
                                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                                >
                                                    <CheckCircle2 size={12} /> Đánh dấu đã đọc
                                                </button>
                                            )}
                                            {notifications.some(n => n.isRead) && (
                                                <button
                                                    onClick={handleDeleteAllRead}
                                                    className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                                                >
                                                    <Trash2 size={12} /> Xóa đã đọc
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="max-h-[320px] overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-6 text-center text-sm text-gray-500">
                                                Không có thông báo nào.
                                            </div>
                                        ) : (
                                            <div className="flex flex-col border-t border-gray-100">
                                                {notifications.map((notif: any) => (
                                                    <div
                                                        key={notif._id}
                                                        onClick={() => handleNotificationClick(notif)}
                                                        className={`p-3 border-b border-gray-50 flex gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-blue-50/20' : ''}`}
                                                    >
                                                        <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!notif.isRead ? 'bg-blue-600' : 'bg-transparent'}`} />
                                                        <div className="flex-1">
                                                            <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{notif.title}</p>
                                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.content}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
                        <button
                            onClick={handleLogout}
                            className="hidden sm:flex items-center cursor-pointer gap-2 text-gray-500 hover:text-red-600 font-medium transition-colors"
                        >
                            <LogOut size={18} /> Đăng xuất
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header