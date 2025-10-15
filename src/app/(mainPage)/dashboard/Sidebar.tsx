'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, MapPin, FileText, BarChart3, Plus, LogOut, User } from 'lucide-react';
import useAuthStore from '@/utils/zustand/useAuthStore';

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { getAuthUserFunction, authUser, LogoutFunction } = useAuthStore();

  useEffect(() => {
    getAuthUserFunction();
  }, []);

  // Close drawer when pathname changes
  useEffect(() => {
    const drawerCheckbox = document.getElementById('sidebar-drawer') as HTMLInputElement;
    if (drawerCheckbox) {
      drawerCheckbox.checked = false;
    }
  }, [pathname]);

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
          className="fixed top-6 left-6 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-2xl h-14 w-14 flex items-center justify-center z-1 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm"
        >
          <Menu size={24} className="text-white" />
        </label>
      </div>

      {/* Sidebar */}
      <div className="drawer-side">
        <label htmlFor="sidebar-drawer" className="drawer-overlay" aria-label="Close sidebar" />
        <aside className="w-80 bg-gradient-to-b from-[#0D0F1A] via-[#12142A] to-[#0D0F1A] text-white h-full flex flex-col justify-between z-2 shadow-2xl border-r border-gray-800/50">

          {/* Top Section */}
          <div className="flex flex-col gap-6 overflow-y-auto">
            {/* Brand/Logo Area */}
            <div className="px-6 pt-8 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <MapPin size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Dashboard
                  </h1>
                  <p className="text-xs text-gray-500">Las Pinas Barangay Portal</p>
                </div>
              </div>
            </div>

            {/* User Info Card */}
            <div className="px-6">
              <div className="relative p-5 bg-gradient-to-br from-[#1E2133] to-[#252941] rounded-2xl shadow-xl border border-gray-800/50 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl" />
                <div className="relative flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                    <User size={22} className="text-white" />
                  </div>
                  {authUser ? (
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-lg truncate">{authUser.username}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs font-medium rounded-full capitalize border border-indigo-500/30">
                          {authUser.role}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <div className="h-5 w-32 bg-gray-700/50 rounded-lg animate-pulse" />
                      <div className="h-4 w-20 bg-gray-700/50 rounded-lg animate-pulse mt-2" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 px-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                Navigation
              </p>
              <Link href="/dashboard/page1">
                <SidebarItem
                  label="Baranggay Maps"
                  active={pathname === '/dashboard/page1'}
                  icon={<MapPin size={20} />}
                />
              </Link>
              <Link href="/dashboard/page2">
                <SidebarItem
                  label="Reports"
                  active={pathname === '/dashboard/page2'}
                  icon={<FileText size={20} />}
                />
              </Link>
              <Link href="/dashboard/page3">
                <SidebarItem
                  label="Analytics"
                  active={pathname === '/dashboard/page4'}
                  icon={<BarChart3 size={20} />}
                />
              </Link>
              {authUser?.role && (
                <Link href="/dashboard/page4">
                  <SidebarItem
                    label="Make a Report"
                    active={pathname === '/dashboard/page3'}
                    icon={<Plus size={20} />}
                  />
                </Link>
              )}
            </nav>
          </div>

          {/* Logout Button */}
          <div className="p-6 pt-4">
            <button
              onClick={handleLogout}
              className="group w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center gap-2 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

// Sidebar Item Component
const SidebarItem = ({ label, active, icon }: { label: string; active?: boolean; icon?: React.ReactNode }) => (
  <div
    className={`group w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-3 relative overflow-hidden
      ${active
        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
        : 'hover:bg-[#2A2A40] text-gray-300 hover:text-white hover:shadow-md'
      }`}
  >
    {active && (
      <div className="absolute left-0 top-0 h-full w-1 bg-white rounded-r-full" />
    )}
    <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </span>
    <span className="flex-1">{label}</span>
  </div>
);

export default Sidebar;