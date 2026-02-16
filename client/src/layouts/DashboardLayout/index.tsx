import type { PropsWithChildren } from "react";
import Sidebar from "../components/Sidebar";

function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="container flex">
      <div>
        {/* Sidebar */}
        <Sidebar />
      </div>
      <div className=" flex-1">{children}</div>
    </div>
  );
}

export default DashboardLayout;
