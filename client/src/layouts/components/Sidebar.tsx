import {
  PanelLeftClose,
  PanelRightClose,
  LayoutDashboard,
  Settings,
  User,
} from "lucide-react";
import { useState } from "react";
import SidebarItem from "../../components/SidebarItem";

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);

  return (
    <aside
      className={`h-screen bg-gray-900 text-white flex flex-col transition-all duration-300 ease-in-out ${
        expanded ? "w-64" : "w-20"
      }`}
    >
      <div className="p-4 flex justify-between items-center border-b border-gray-700 h-16">
        <div
          className={`font-bold text-xl overflow-hidden transition-all duration-300 whitespace-nowrap ${
            expanded ? "w-32 opacity-100" : "w-0 opacity-0"
          }`}
        >
          Admin
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          {expanded ? (
            <PanelLeftClose size={24} />
          ) : (
            <PanelRightClose size={24} />
          )}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-2">
        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          text="Dashboard"
          active
          expanded={expanded}
        />
        <SidebarItem
          icon={<User size={20} />}
          text="Users"
          expanded={expanded}
        />
        <SidebarItem
          icon={<Settings size={20} />}
          text="Settings"
          expanded={expanded}
        />
      </nav>

      <div className="border-t border-gray-700 p-3 flex items-center">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
          AD
        </div>
        <div
          className={`ml-3 overflow-hidden transition-all duration-300 ${
            expanded ? "w-40 opacity-100" : "w-0 opacity-0"
          }`}
        >
          <p className="text-sm font-medium">Admin User</p>
          <p className="text-xs text-gray-400">admin@test.com</p>
        </div>
      </div>
    </aside>
  );
}
