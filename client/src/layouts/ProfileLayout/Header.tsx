import { Bell, GraduationCap, LogOut } from 'lucide-react';
import { getDecodedToken } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';

const Header = () => {

    const currentUser = getDecodedToken();
    const navigate = useNavigate()
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
                        <button className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer">
                            <Bell size={24} />
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
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