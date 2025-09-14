'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-[100vh] fixed bg-[#0D0F1A] text-white flex flex-col justify-between p-4">
      <div>
        {/* Navigation */}
        <nav className="space-y-2">
          <Link href="/dashboard/page1">
            <SidebarItem label="Baranggay Maps" active={pathname === '/dashboard/page1'} />
          </Link>
          <Link href="/dashboard/page2">
            <SidebarItem label="Reports" active={pathname === '/dashboard/page2'} />
          </Link>
          <Link href="/dashboard/page3">
            <SidebarItem label="Make a report" active={pathname === '/dashboard/page3'} />
          </Link>
        </nav>
      </div>
    </aside>
  );
};

const SidebarItem = ({ label, active }: { label: string; active?: boolean }) => (
  <button
    className={`block w-full text-left px-3 py-2 rounded-lg transition text-sm cursor-pointer ${active ? 'bg-[#2A2A40]' : 'hover:bg-[#2A2A40]'
      }`}
  >
    {label}
  </button>
);

export default Sidebar;
