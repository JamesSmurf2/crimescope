import React from "react";
import Sidebar from "./Sidebar";
import "leaflet/dist/leaflet.css";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-[#0F1120] text-white ml-64">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
