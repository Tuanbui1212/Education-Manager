import {
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Briefcase,
  BookOpen,
  BadgeDollarSign,
  PanelLeftClose,
  PanelRightClose,
  ChevronDown,
  ChevronRight,
  LogOut,
  User,
  KeyRound,
} from 'lucide-react';
import { useState, memo, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SidebarItem from '../../components/SidebarItem';
import RequirePermission from '../../components/RequirePermission';
import { PATHS } from '../../utils/constants';
import { PERMISSIONS } from '../../utils/permission.constant';
import { getDecodedToken } from '../../utils/auth';

const menuConfig = [
  {
    key: 'accounts',
    label: 'Quản lý tài khoản',
    icon: <ShieldCheck size={20} />,
    permission: PERMISSIONS.USER.VIEW,
    subItems: [
      { label: 'Danh sách tài khoản', path: PATHS.USER, permission: PERMISSIONS.USER.VIEW },
      { label: 'Phân quyền (Roles)', path: PATHS.SETTINGS_ROLES, permission: PERMISSIONS.ROLE.VIEW },
      //{ label: 'Lịch sử hoạt động', path: PATHS.ACCOUNT_LOGS, permission: PERMISSIONS.USER.VIEW },
    ],
  },
  {
    key: 'hr',
    label: 'Quản lý Nhân sự (HR)',
    icon: <Briefcase size={20} />,
    permission: PERMISSIONS.USER.VIEW,
    subItems: [
      { label: 'Đội ngũ giáo viên', path: PATHS.HR_TEACHERS, permission: PERMISSIONS.USER.VIEW },
      { label: 'Nhân viên văn phòng', path: PATHS.HR_STAFFS, permission: PERMISSIONS.USER.VIEW },
      // {
      //   label: 'Hợp đồng & Lương',
      //   path: PATHS.HR_CONTRACTS,
      //   permission: PERMISSIONS.SALARY?.VIEW || PERMISSIONS.USER.VIEW,
      // },
      {
        label: 'Bảng lương',
        path: PATHS.HR_PAYROLL,
        permission: PERMISSIONS.SALARY?.VIEW || PERMISSIONS.USER.VIEW,
      },
    ],
  },
  {
    key: 'training',
    label: 'Quản lý đào tạo',
    icon: <BookOpen size={20} />,
    permission: PERMISSIONS.CLASS.VIEW,
    subItems: [
      { label: 'Quản lý học viên', path: PATHS.TRAINING_STUDENT, permission: PERMISSIONS.USER.VIEW },
      {
        label: 'Quản lý khóa học',
        path: PATHS.TRAINING_COURSES,
        permission: PERMISSIONS.COURSE.VIEW || PERMISSIONS.CLASS.VIEW,
      },
      { label: 'Quản lý lớp học', path: PATHS.TRAINING_CLASSES, permission: PERMISSIONS.CLASS.VIEW },
      {
        label: 'Quản lý thời khóa biểu',
        path: PATHS.TRAINING_SCHEDULES,
        permission: PERMISSIONS.SHIFT.VIEW || PERMISSIONS.CLASS.VIEW,
      },
      { label: 'Xếp lịch tự động', path: PATHS.TRAINING_AUTO_SCHEDULES, permission: PERMISSIONS.CLASS.VIEW },
    ],
  },
  {
    key: 'finance',
    label: 'Quản lý Tài chính',
    icon: <BadgeDollarSign size={20} />,
    permission: PERMISSIONS.EXPENDITURE.VIEW,
    subItems: [
      {
        label: 'Học phí học viên',
        path: PATHS.FINANCE_INVOICES,
        permission: PERMISSIONS.INVOICE?.VIEW || PERMISSIONS.EXPENDITURE.VIEW,
      },
      { label: 'Thu chi tổng quát', path: PATHS.FINANCE_TRANSACTIONS, permission: PERMISSIONS.EXPENDITURE.VIEW },
      { label: 'Báo cáo tài chính', path: '/finance/reports', permission: PERMISSIONS.EXPENDITURE.VIEW },
    ],
  },
  {
    key: 'settings',
    label: 'Cấu hình hệ thống',
    icon: <Settings size={20} />,
    permission: PERMISSIONS.ROOM.VIEW,
    subItems: [
      { label: 'Ca học', path: PATHS.SETTINGS_SHIFTS, permission: PERMISSIONS.SHIFT?.VIEW || PERMISSIONS.ROOM.VIEW },
      { label: 'Phòng học', path: PATHS.SETTINGS_ROOMS, permission: PERMISSIONS.ROOM.VIEW },
      {
        label: 'Các loại chi phí cố định',
        path: PATHS.SETTINGS_FIXED_COSTS,
        permission: PERMISSIONS.FIXED_COST.VIEW,
      },
      {
        label: 'Mẫu thông báo',
        path: PATHS.SETTINGS_NOTIFICATION_TEMPLATES,
        permission: PERMISSIONS.NOTIFICATION_TEMPLATE.VIEW,
      },
    ],
  },
];

function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    accounts: false,
    hr: false,
    students: false,
    training: false,
    finance: false,
    settings: false,
  });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  // TỐI ƯU 2: Thêm Ref cho toàn bộ Sidebar
  const sidebarRef = useRef<HTMLElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = getDecodedToken();
  const userName = currentUser?.name;
  const userEmail = currentUser?.email;
  const currentPath = location.pathname;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Đóng Profile Menu nếu click ra ngoài
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }

      // TỐI ƯU 3: Đóng Sidebar nếu click ra ngoài vùng Sidebar
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setExpanded(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = (menuKey: string) => {
    if (!expanded) {
      setExpanded(true);
      setOpenMenus((prev) =>
        Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: key === menuKey }), {} as Record<string, boolean>),
      );
      return;
    }
    setOpenMenus((prev) =>
      Object.keys(prev).reduce(
        (acc, key) => ({ ...acc, [key]: key === menuKey ? !prev[menuKey] : false }),
        {} as Record<string, boolean>,
      ),
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside
      ref={sidebarRef} // Gắn Ref vào đây
      className={`h-screen bg-gray-900 text-white flex flex-col transition-all duration-300 ease-in-out top-0 sticky left-0 z-50 ${
        expanded ? 'w-64' : 'w-20'
      }`}
    >
      <div className="p-4 flex justify-between items-center border-b border-gray-700 h-16">
        <div
          className={`font-bold text-xl overflow-hidden transition-all duration-300 whitespace-nowrap ${
            expanded ? 'w-32 opacity-100' : 'w-0 opacity-0'
          }`}
        ></div>

        <button
          // Click vào nút này cũng toggle được trạng thái
          onClick={(e) => {
            e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài gây đóng/mở loạn
            setExpanded(!expanded);
          }}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          {expanded ? <PanelLeftClose size={24} /> : <PanelRightClose size={24} />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          text="Dashboard"
          active={currentPath === PATHS.DASHBOARD}
          expanded={expanded}
          onClick={() => {
            navigate(PATHS.DASHBOARD);
            setExpanded(false); // Tuỳ chọn: Click menu con xong tự đóng
          }}
        />

        {menuConfig.map((menu) => {
          const isOpen = openMenus[menu.key];
          const isChildActive = menu.subItems.some((item) => currentPath === item.path);

          return (
            <RequirePermission key={menu.key} required={menu.permission}>
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => toggleMenu(menu.key)}
                  className={`flex items-center justify-between w-full p-2.5 rounded-xl transition-colors ${
                    isChildActive ? 'bg-gray-800 text-blue-400' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isChildActive ? 'text-blue-400' : 'text-gray-400'}>{menu.icon}</span>
                    <span
                      className={`font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                        expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
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
                  className={`flex flex-col overflow-hidden transition-all duration-300 ${
                    isOpen && expanded ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'
                  }`}
                >
                  {menu.subItems.map((subItem) => (
                    <RequirePermission key={subItem.path} required={subItem.permission}>
                      <button
                        onClick={() => {
                          navigate(subItem.path);
                          setExpanded(false); // Tuỳ chọn: Click chuyển trang xong thì tự đóng Sidebar cho gọn
                        }}
                        className={`flex items-center pl-11 pr-4 py-2 text-sm rounded-lg transition-colors whitespace-nowrap ${
                          currentPath === subItem.path
                            ? 'text-white bg-gray-800/50 font-medium'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                        }`}
                      >
                        {subItem.label}
                      </button>
                    </RequirePermission>
                  ))}
                </div>
              </div>
            </RequirePermission>
          );
        })}
      </nav>

      <div className="border-t border-gray-700 p-3 relative" ref={profileMenuRef}>
        <button
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-800 transition-colors ${
            expanded ? 'justify-start' : 'justify-center'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center font-bold text-white flex-shrink-0 shadow-md">
            {userName ? userName.charAt(0).toUpperCase() : 'AD'}
          </div>

          <div
            className={`flex flex-col items-start overflow-hidden transition-all duration-300 ${
              expanded ? 'w-full opacity-100' : 'w-0 opacity-0'
            }`}
          >
            <p className="text-sm font-semibold text-gray-200 whitespace-nowrap truncate w-full">
              {userName || 'Admin'}
            </p>
            <p className="text-xs text-gray-500 whitespace-nowrap truncate w-full">{userEmail || 'Chưa cập nhật'}</p>
          </div>
        </button>

        {isProfileMenuOpen && (
          <div
            className={`absolute bottom-[calc(100%+10px)] left-3 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl py-2 flex flex-col min-w-[200px] z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
              !expanded && 'left-14'
            }`}
          >
            {!expanded && (
              <div className="px-4 py-2 border-b border-gray-700 mb-2">
                <p className="text-sm font-semibold text-white truncate">{userName}</p>
                <p className="text-xs text-gray-400 truncate">{userEmail}</p>
              </div>
            )}

            <button
              onClick={() => {
                navigate('/profile');
                setIsProfileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors w-full text-left"
            >
              <User size={18} />
              Thông tin cá nhân
            </button>

            <div className="h-px bg-gray-700 my-1 mx-2"></div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full text-left"
            >
              <LogOut size={18} />
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export default memo(Sidebar);
