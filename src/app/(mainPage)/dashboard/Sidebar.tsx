'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAuthStore from '@/utils/zustand/useAuthStore';

const Sidebar = () => {
  const { getAuthUserFunction, authUser, LogoutFunction } = useAuthStore();

  const pathname = usePathname();

  useEffect(() => {
    getAuthUserFunction();
  }, []);

  return (
    <aside className="w-64 h-[100vh] fixed bg-[#0D0F1A] text-white flex flex-col justify-between p-4">
      <div className="space-y-4">
        {/* User Info Placeholder */}
        <div className="p-3 bg-[#1E2133] rounded-lg">
          {authUser ? (
            <>
              <p className="font-semibold text-lg">{authUser.username}</p>
              <p className="text-sm text-gray-400 capitalize">{authUser.role}</p>
            </>
          ) : (
            <p className="text-gray-500 italic">Loading user info...</p>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <Link href="/dashboard/page1">
            <SidebarItem label="Baranggay Maps" active={pathname === '/dashboard/page1'} />
          </Link>
          <Link href="/dashboard/page2">
            <SidebarItem label="Reports" active={pathname === '/dashboard/page2'} />
          </Link>
          <Link href="/dashboard/page4">
            <SidebarItem label="Analytics" active={pathname === '/dashboard/page4'} />
          </Link>
          {
            authUser?.role &&
            <Link href="/dashboard/page3">
              <SidebarItem label="Make a report" active={pathname === '/dashboard/page3'} />
            </Link>
          }
        </nav>
      </div>

      {/* Logout Button fixed at bottom */}
      <div>
        <button
          onClick={() => LogoutFunction()}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition"
        >
          Logout
        </button>
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
