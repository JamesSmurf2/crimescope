'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import useAuthStore from '@/utils/zustand/useAuthStore';

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { getAuthUserFunction, authUser, LogoutFunction } = useAuthStore();

  useEffect(() => {
    getAuthUserFunction();
  }, []);

  const handleLogout = () => {
    LogoutFunction();
    router.push('/');
  };

  return (
    <div className="drawer">
      <input id="sidebar-drawer" type="checkbox" className="drawer-toggle" />

      {/* Drawer content toggle button */}
      <div className="drawer-content">
        <label
          htmlFor="sidebar-drawer"
          className="fixed top-6 left-6 bg-neutral-600/40 hover:bg-neutral-600/70 rounded-xl h-12 w-12 flex items-center justify-center z-1 cursor-pointer transition"
        >
          <Menu size={24} />
        </label>
      </div>

      {/* Sidebar */}
      <div className="drawer-side">
        <label htmlFor="sidebar-drawer" className="drawer-overlay" aria-label="Close sidebar" />
        <aside className="w-72 bg-[#0D0F1A] text-white h-full flex flex-col justify-between z-2">

          {/* Top Section */}
          <div className="p-6 flex flex-col gap-6 overflow-y-auto">
            {/* User Info */}
            <div className="p-4 bg-[#1E2133] rounded-xl shadow-sm">
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
            <nav className="flex flex-col gap-2">
              <Link href="/dashboard/page1">
                <SidebarItem label="Baranggay Maps" active={pathname === '/dashboard/page1'} />
              </Link>
              <Link href="/dashboard/page2">
                <SidebarItem label="Reports" active={pathname === '/dashboard/page2'} />
              </Link>
              <Link href="/dashboard/page3">
                <SidebarItem label="Analytics" active={pathname === '/dashboard/page4'} />
              </Link>
              {authUser?.role && (
                <Link href="/dashboard/page4">
                  <SidebarItem label="Make a Report" active={pathname === '/dashboard/page3'} />
                </Link>
              )}
            </nav>
          </div>

          {/* Logout Button */}
          <div className="p-6">
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 transition text-white font-semibold py-2 rounded-xl shadow-md cursor-pointer"
            >
              Logout
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

// Sidebar Item Component
const SidebarItem = ({ label, active }: { label: string; active?: boolean }) => (
  <div
    className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition
      ${active ? 'bg-[#2A2A40] text-white shadow-inner' : 'hover:bg-[#2A2A40]/70'}`}
  >
    {label}
  </div>
);

export default Sidebar;
