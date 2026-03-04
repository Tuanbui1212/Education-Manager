import {
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  BookOpen,
  BadgeDollarSign,
  PanelLeftClose,
  PanelRightClose,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useState, memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SidebarItem from '../../components/SidebarItem';
import { PATHS } from '../../utils/constants';

function Sidebar() {
  const [expanded, setExpanded] = useState(true);

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    accounts: false,
    hr: false,
    students: false,
    training: false,
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

  const menuConfig = [
    {
      key: 'accounts',
      label: 'Quản lý tài khoản',
      icon: <ShieldCheck size={20} />,
      subItems: [
        { label: 'Danh sách tài khoản', path: PATHS.USER || '/accounts/list' },
        { label: 'Phân quyền (Roles)', path: '/accounts/roles' },
        { label: 'Lịch sử hoạt động', path: '/accounts/logs' },
      ],
    },
    {
      key: 'hr',
      label: 'Quản lý Nhân sự (HR)',
      icon: <Briefcase size={20} />,
      subItems: [
        { label: 'Đội ngũ giáo viên', path: '/hr/teachers' },
        { label: 'Đội ngũ trợ giảng', path: '/hr/tutors' },
        { label: 'Nhân viên văn phòng', path: '/hr/staffs' },
        { label: 'Hợp đồng & Lương', path: '/hr/contracts' },
      ],
    },
    {
      key: 'students',
      label: 'Học viên & Tuyển sinh',
      icon: <GraduationCap size={20} />,
      subItems: [
        { label: 'Data khách hàng', path: '/students/leads' },
        { label: 'Danh sách học viên', path: '/students/list' },
        { label: 'Kết quả học tập', path: '/students/results' },
        { label: 'Bảo lưu / Nghỉ học', path: '/students/status' },
      ],
    },
    {
      key: 'training',
      label: 'Quản lý đào tạo',
      icon: <BookOpen size={20} />,
      subItems: [
        { label: 'Quản lý khóa học', path: PATHS.TRAINING_COURSES },
        { label: 'Quản lý lớp học', path: '/training/classes' },
        { label: 'Xếp thời khóa biểu', path: '/training/schedule' },
        { label: 'Điểm danh', path: '/training/attendance' },
        { label: 'Kỳ thi / Bài kiểm tra', path: '/training/exams' },
        { label: 'Quản lý tài liệu', path: '/training/documents' },
        { label: 'Đánh giá & Phản hồi', path: '/training/feedback' },
      ],
    },
    {
      key: 'finance',
      label: 'Quản lý Tài chính',
      icon: <BadgeDollarSign size={20} />,
      subItems: [
        { label: 'Học phí học viên', path: '/finance/tuition' },
        { label: 'Chi trả lương/thù lao', path: '/finance/payroll' },
        { label: 'Thu chi tổng quát', path: '/finance/transactions' },
        { label: 'Báo cáo tài chính', path: '/finance/reports' },
      ],
    },
    {
      key: 'settings',
      label: 'Cấu hình hệ thống',
      icon: <Settings size={20} />,
      subItems: [
        { label: 'Ca học', path: PATHS.SETTINGS_SHIFTS },
        { label: 'Phòng học', path: PATHS.SETTINGS_ROOMS },
        { label: 'Các loại chi phí cố định', path: PATHS.SETTINGS_EXPENDITURES },
        { label: 'Mẫu thông báo', path: PATHS.SETTINGS_NOTIFICATION_TEMPLATES },
      ],
    },
  ];

  return (
    <aside
      className={`h-screen bg-gray-900 text-white flex flex-col transition-all duration-300 ease-in-out top-0 sticky left-0 z-50 ${expanded ? 'w-64' : 'w-20'
        }`}
    >
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

      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto custom-scrollbar">
        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          text="Dashboard"
          active={currentPath === PATHS.DASHBOARD}
          expanded={expanded}
          onClick={() => navigate(PATHS.DASHBOARD)}
        />

        {menuConfig.map((menu) => {
          const isOpen = openMenus[menu.key];
          const isChildActive = menu.subItems.some((item) => currentPath === item.path);

          return (
            <div key={menu.key} className="flex flex-col space-y-1">
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

                {expanded && (
                  <span className="text-gray-500">
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </span>
                )}
              </button>

              <div
                className={`flex flex-col overflow-hidden transition-all duration-300 ${isOpen && expanded ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'
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
                    {subItem.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

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
