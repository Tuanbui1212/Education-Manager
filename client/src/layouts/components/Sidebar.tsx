import {
  PanelLeftClose,
  PanelRightClose,
  LayoutDashboard,
  Settings,
  Users,
  BookOpen,
  CalendarDays,
  Wallet,
  BarChart3,
} from 'lucide-react';
import { useState, memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SidebarItem from '../../components/SidebarItem';
import { PATHS } from '../../utils/constants';

function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside
      className={`h-screen bg-gray-900 text-white flex flex-col transition-all duration-300 ease-in-out top-0 sticky left-0 z-50 ${
        expanded ? 'w-64' : 'w-20'
      }`}
    >
      {/* Header Sidebar */}
      <div className="p-4 flex justify-between items-center border-b border-gray-700 h-16">
        <div
          className={`font-bold text-xl overflow-hidden transition-all duration-300 whitespace-nowrap ${
            expanded ? 'w-32 opacity-100' : 'w-0 opacity-0'
          }`}
        >
          Admin Portal
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          {expanded ? <PanelLeftClose size={24} /> : <PanelRightClose size={24} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto custom-scrollbar">
        {/* 1. Tổng quan */}
        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          text="Dashboard"
          active={currentPath === PATHS.DASHBOARD}
          expanded={expanded}
          onClick={() => navigate(PATHS.DASHBOARD)}
        />

        {/* 2. Nhánh: Quản lý đào tạo (Khóa học, Lớp học, Điểm danh...) */}
        <SidebarItem
          icon={<BookOpen size={20} />}
          text="Đào tạo"
          // Tạm thời để string, bạn thêm PATHS.TRAINING vào file constants sau nhé
          active={currentPath === (PATHS.TRAINING || '/training')}
          expanded={expanded}
          onClick={() => navigate(PATHS.TRAINING || '/training')}
        />

        {/* Tách riêng Thời khóa biểu vì đây là tính năng dùng rất thường xuyên */}
        <SidebarItem
          icon={<CalendarDays size={20} />}
          text="Thời khóa biểu"
          active={currentPath === (PATHS.SCHEDULE || '/schedule')}
          expanded={expanded}
          onClick={() => navigate(PATHS.SCHEDULE || '/schedule')}
        />

        {/* 3. Nhánh: Quản lý người dùng (Học viên, Giáo viên, Sale...) */}
        <SidebarItem
          icon={<Users size={20} />}
          text="Người dùng"
          active={currentPath === PATHS.USER}
          expanded={expanded}
          onClick={() => navigate(PATHS.USER)}
        />

        {/* 4. Nhánh: Quản lý Tài chính (Học phí, Thu chi, Lương...) */}
        <SidebarItem
          icon={<Wallet size={20} />}
          text="Tài chính"
          active={currentPath === (PATHS.FINANCE || '/finance')}
          expanded={expanded}
          onClick={() => navigate(PATHS.FINANCE || '/finance')}
        />

        {/* Tách riêng Báo cáo tài chính/doanh thu ra cho sếp dễ nhìn */}
        <SidebarItem
          icon={<BarChart3 size={20} />}
          text="Báo cáo"
          active={currentPath === (PATHS.REPORTS || '/reports')}
          expanded={expanded}
          onClick={() => navigate(PATHS.REPORTS || '/reports')}
        />

        <hr className="border-gray-700 my-4" />

        {/* 5. Nhánh: Cấu hình hệ thống */}
        <SidebarItem
          icon={<Settings size={20} />}
          text="Cấu hình"
          active={currentPath === PATHS.SETTINGS}
          onClick={() => navigate(PATHS.SETTINGS)}
          expanded={expanded}
        />
      </nav>

      {/* Footer Sidebar: User Profile */}
      <div className="border-t border-gray-700 p-3 flex items-center">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold flex-shrink-0">
          AD
        </div>
        <div
          className={`ml-3 overflow-hidden transition-all duration-300 ${
            expanded ? 'w-40 opacity-100' : 'w-0 opacity-0'
          }`}
        >
          <p className="text-sm font-medium whitespace-nowrap">Admin User</p>
          <p className="text-xs text-gray-400 whitespace-nowrap">admin@edu.vn</p>
        </div>
      </div>
    </aside>
  );
}

export default memo(Sidebar);
