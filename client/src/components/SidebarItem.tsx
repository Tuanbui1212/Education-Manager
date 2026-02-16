import { type ReactNode } from "react";

interface SidebarItemProps {
  icon: ReactNode;
  text: string;
  active?: boolean;
  expanded: boolean;
  onClick?: () => void;
}

export default function SidebarItem({
  icon,
  text,
  active = false,
  expanded,
  onClick,
}: SidebarItemProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative flex items-center py-3 px-3 my-1
        font-medium rounded-md cursor-pointer
        transition-colors group
        ${
          active
            ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
            : "hover:bg-indigo-50 text-gray-600"
        }
    `}
    >
      {icon}

      <span
        className={`overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap ${
          expanded ? "w-52 ml-3 opacity-100" : "w-0 ml-0 opacity-0"
        }`}
      >
        {text}
      </span>

      {!expanded && (
        <div
          className={`
            absolute left-full rounded-md px-2 py-1 ml-6
            bg-indigo-100 text-indigo-800 text-sm
            invisible opacity-20 -translate-x-3 transition-all
            group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
            z-50 whitespace-nowrap
          `}
        >
          {text}
        </div>
      )}
    </div>
  );
}
