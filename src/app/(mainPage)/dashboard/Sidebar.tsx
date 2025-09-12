'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const Sidebar = () => {
  const router = useRouter();


  return (
    <aside className="w-64 h-[100vh] fixed bg-[#0D0F1A] text-white flex flex-col justify-between p-4">
      <div>
        {/* Navigation */}
        <nav className="space-y-2">
          <Link className='cursor-pointer' href="/dashboard/page1"><SidebarItem label="Baranggay Maps" /></Link>
        </nav>
        <nav className="space-y-2">
          <Link className='cursor-pointer' href="/dashboard/page2"><SidebarItem label="Statistics" /></Link>
        </nav>
      </div>
    </aside>
  );
};

const SidebarItem = ({ label }: { label: string }) => (
  <button className="block w-full text-left px-3 py-2 rounded-lg hover:bg-[#2A2A40] transition text-sm">
    {label}
  </button>
);

export default Sidebar;
