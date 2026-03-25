import type { PropsWithChildren } from 'react';
import Sidebar from '../components/Sidebar';

function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden w-full">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col overflow-y-auto bg-gray-50">{children}</div>
    </div>
  );
}

export default DashboardLayout;
