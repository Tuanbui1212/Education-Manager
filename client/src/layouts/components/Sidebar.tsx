import {
  PanelLeftClose,
  PanelRightClose,
  LayoutDashboard,
  Settings,
  Users,
  BookOpen,
  Wallet,
  ChevronDown,
  ChevronRight,
  UserCog, // Import thêm icon này cho phần Quản lý tài khoản
} from 'lucide-react';
import { useState, memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SidebarItem from '../../components/SidebarItem';
import { PATHS } from '../../utils/constants';

function Sidebar() {
  const [expanded, setExpanded] = useState(true);

  // State quản lý việc mở/đóng của các menu cấp 1
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    accounts: false, // <-- Thêm state cho Quản lý tài khoản
    training: false,
    users: false,
    finance: false,
    settings: false,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const toggleMenu = (menuKey: string) => {
    if (!expanded) {
      setExpanded(true);
      setOpenMenus((prev) => ({ ...prev, [menuKey]: true }));
      return;
    }
    setOpenMenus((prev) => ({ ...prev, [menuKey]: !prev[menuKey] }));
  };

  // CẤU HÌNH MENU
  const menuConfig = [
    {
      key: 'accounts',
      label: 'Quản lý tài khoản',
      icon: <UserCog size={20} />, // Icon bánh răng user
      subItems: [
        { label: 'Danh sách tài khoản', path: PATHS.USER || '/accounts/list' }, // Trỏ về trang UserList bạn vừa làm
        { label: 'Phân quyền (Roles)', path: '/accounts/roles' },
        { label: 'Lịch sử hoạt động', path: '/accounts/logs' },
      ],
    },
    {
      key: 'training',
      label: 'Quản lý đào tạo',
      icon: <BookOpen size={20} />,
      subItems: [
        { label: 'Quản lý khóa học', path: '/training/courses' },
        { label: 'Quản lý lớp học', path: '/training/classes' },
        { label: 'Xếp thời khóa biểu', path: '/training/schedule' },
        { label: 'Điểm danh', path: '/training/attendance' },
        { label: 'Kỳ thi / Bài kiểm tra', path: '/training/exams' },
        { label: 'Quản lý tài liệu', path: '/training/documents' },
        { label: 'Đánh giá & Phản hồi', path: '/training/feedback' },
      ],
    },
    {
      key: 'users',
      label: 'Hồ sơ nhân sự/Học viên', // Đổi tên một chút cho đỡ trùng lặp với Tài khoản
      icon: <Users size={20} />,
      subItems: [
        { label: 'Hồ sơ học viên', path: '/users/students' },
        { label: 'Hồ sơ giáo viên', path: '/users/teachers' },
      ],
    },
    {
      key: 'finance',
      label: 'Quản lý Tài chính',
      icon: <Wallet size={20} />,
      subItems: [
        { label: 'Học phí', path: '/finance/tuition' },
        { label: 'Thu chi', path: '/finance/transactions' },
        { label: 'Báo cáo', path: '/finance/reports' },
      ],
    },
    {
      key: 'settings',
      label: 'Cấu hình hệ thống',
      icon: <Settings size={20} />,
      subItems: [
        { label: 'Ca học', path: '/settings/shifts' },
        { label: 'Phòng học', path: '/settings/rooms' },
        { label: 'Các loại chi phí cố định', path: '/settings/fixed-costs' },
        { label: 'Mẫu thông báo', path: '/settings/notification-templates' },
      ],
    },
  ];

  return (
    <aside
      className={`h-screen bg-gray-900 text-white flex flex-col transition-all duration-300 ease-in-out top-0 sticky left-0 z-50 ${expanded ? 'w-64' : 'w-20'
        }`}
    >
      {/* Header Sidebar */}
      <div className="p-4 flex justify-between items-center border-b border-gray-700 h-16">
        <div
          className={`font-bold text-xl overflow-hidden transition-all duration-300 whitespace-nowrap ${expanded ? 'w-32 opacity-100' : 'w-0 opacity-0'
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
        {/* Item tĩnh: Dashboard */}
        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          text="Dashboard"
          active={currentPath === PATHS.DASHBOARD}
          expanded={expanded}
          onClick={() => navigate(PATHS.DASHBOARD)}
        />

        {/* Render danh sách Menu Dropdown động từ Config */}
        {menuConfig.map((menu) => {
          const isOpen = openMenus[menu.key];
          const isChildActive = menu.subItems.some((item) => currentPath === item.path);

          return (
            <div key={menu.key} className="flex flex-col space-y-1">
              {/* Nút Parent Menu */}
              <button
                onClick={() => toggleMenu(menu.key)}
                className={`flex items-center justify-between w-full p-2.5 rounded-xl transition-colors ${isChildActive ? 'bg-gray-800 text-blue-400' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isChildActive ? 'text-blue-400' : 'text-gray-400'}>{menu.icon}</span>
                  <span
                    className={`font-medium text-sm whitespace-nowrap transition-all duration-300 ${expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                      }`}
                  >
                    {menu.label}
                  </span>
                </div>

                {/* Mũi tên xổ xuống */}
                {expanded && (
                  <span className="text-gray-500">
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </span>
                )}
              </button>

              {/* Danh sách Sub-items */}
              <div
                className={`flex flex-col overflow-hidden transition-all duration-300 ${isOpen && expanded ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'
                  }`}
              >
                {menu.subItems.map((subItem) => (
                  <button
                    key={subItem.path}
                    onClick={() => navigate(subItem.path)}
                    className={`flex items-center pl-11 pr-4 py-2 text-sm rounded-lg transition-colors whitespace-nowrap ${currentPath === subItem.path
                        ? 'text-white bg-gray-800/50 font-medium'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                      }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full mr-3 ${currentPath === subItem.path ? 'bg-blue-500' : 'bg-gray-600'}`}
                    ></div>
                    {subItem.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer Sidebar: User Profile */}
      <div className="border-t border-gray-700 p-3 flex items-center">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold flex-shrink-0">
          AD
        </div>
        <div
          className={`ml-3 overflow-hidden transition-all duration-300 ${expanded ? 'w-40 opacity-100' : 'w-0 opacity-0'
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
