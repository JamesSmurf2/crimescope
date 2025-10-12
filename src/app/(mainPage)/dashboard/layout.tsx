import React from "react";
import Sidebar from "./Sidebar";
import "leaflet/dist/leaflet.css";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-[100vh] overflow-x-hidden">
      <Sidebar />
      <main className='w-[100%]'>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
