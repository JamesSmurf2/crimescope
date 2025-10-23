'use client'
import React, { useState, useEffect } from 'react';
import { FileText, Edit, Trash2, Eye, UserCircle, Calendar, UserPlus, Users, X, Mail, Shield, ShieldOff } from 'lucide-react';
import useAuthStore from '@/utils/zustand/useAuthStore';
import useAdminStore from '@/utils/zustand/useAdminStore';

import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";


const AdminLogsPage = () => {
    const router = useRouter();

    const { RegisterFunction, getAuthUserFunction, authUser } = useAuthStore()
    const { getAllAdmin, deleteAdmin, getLogsAdmin } = useAdminStore()
    const [authLoading, setAuthLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            await getAuthUserFunction();
            setAuthLoading(false);
        };
        checkAuth();
    }, [getAuthUserFunction]);

    useEffect(() => {
        if (!authLoading && authUser === null) {
            router.push('/');
        }
    }, [authUser, authLoading, router]);

    // Fetch logs on component mount
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLogsLoading(true);
                const logsData = await getLogsAdmin();
                if (logsData && !logsData.error) {
                    setLogs(logsData);
                }
            } catch (error) {
                console.error('Error fetching logs:', error);
            } finally {
                setLogsLoading(false);
            }
        };

        if (authUser) {
            fetchLogs();
        }
    }, [authUser, getLogsAdmin]);

    const [filters, setFilters] = useState({
        search: "",
        action: "",
        admin: "",
    });

    const [adminList, setAdminList] = useState([]);

    const [newAdmin, setNewAdmin] = useState({
        username: '',
        email: '',
        password: ''
    });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAdminListModal, setShowAdminListModal] = useState(false);

    const getActionIcon = (action: any) => {
        switch (action) {
            case 'Created Report':
                return <FileText className="w-5 h-5 text-emerald-400" />;
            case 'Updated Report':
                return <Edit className="w-5 h-5 text-blue-400" />;
            case 'Deleted Report':
                return <Trash2 className="w-5 h-5 text-red-400" />;
            case 'Viewed Report':
                return <Eye className="w-5 h-5 text-cyan-400" />;
            default:
                return <FileText className="w-5 h-5 text-gray-400" />;
        }
    };

    const getActionBg = (action: any) => {
        switch (action) {
            case 'Created Report':
                return 'bg-emerald-500/10 border-emerald-500/30';
            case 'Updated Report':
                return 'bg-blue-500/10 border-blue-500/30';
            case 'Deleted Report':
                return 'bg-red-500/10 border-red-500/30';
            case 'Viewed Report':
                return 'bg-cyan-500/10 border-cyan-500/30';
            default:
                return 'bg-slate-800/50 border-slate-700/50';
        }
    };

    // Transform API logs to match the display format
    const transformedLogs = logs.map((log: any) => ({
        id: log._id,
        timestamp: new Date(log.createdAt).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }),
        admin: log.adminId?.username || 'Unknown Admin',
        action: log.action,
        details: `${log.action} - Blotter No: ${log.blotterNo}`,
        reportId: log.blotterNo,
        offense: log.offense,
        barangay: log.barangay
    }));

    const filteredLogs = transformedLogs.filter(log => {
        const matchesSearch = filters.search === "" ||
            log.admin.toLowerCase().includes(filters.search.toLowerCase()) ||
            log.details.toLowerCase().includes(filters.search.toLowerCase()) ||
            log.reportId.toLowerCase().includes(filters.search.toLowerCase());

        const matchesAction = filters.action === "" || log.action === filters.action;
        const matchesAdmin = filters.admin === "" || log.admin === filters.admin;

        return matchesSearch && matchesAction && matchesAdmin;
    });

    const uniqueAdmins = [...new Set(transformedLogs.map(log => log.admin))];
    const uniqueActions = [...new Set(transformedLogs.map(log => log.action))];

    const totalLogs = filteredLogs.length;
    const createdCount = filteredLogs.filter(l => l.action === 'Created Report').length;
    const updatedCount = filteredLogs.filter(l => l.action === 'Updated Report').length;
    const viewedCount = filteredLogs.filter(l => l.action === 'Viewed Report').length;

    const handleFilterChange = (e: any) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => setFilters({ search: "", action: "", admin: "" });

    const handleCreateAdmin = async () => {
        if (!newAdmin.password || !newAdmin.username) {
            toast.error('Please fill in all fields');
            return;
        }

        await RegisterFunction({
            username: newAdmin.username,
            password: newAdmin.password,
            email: newAdmin.email || ""
        });

        setShowCreateModal(false);
        setNewAdmin({ username: '', email: '', password: '' });
        toast.success('Admin created successfully!');
    };

    const handleDeleteAdmin = async (id: any) => {
        if (confirm('Are you sure you want to delete this admin?')) {
            await deleteAdmin(id);
            // Refresh admin list
            const admins = await getAllAdmin();
            setAdminList(admins);
        }
    };

    const handleToggle2FA = async (adminId: string, currentStatus: boolean) => {
        try {
            const response = await fetch('/api/admin/changeAdminEnableTwoFa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adminId: adminId,
                    currentStatus: !currentStatus
                }),
            });

            const data = await response.json();

            if (data.success) {
                const admins = await getAllAdmin();
                setAdminList(admins);
                toast.success(`2FA ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
            } else {
                alert('Failed to toggle 2FA');
            }
        } catch (error) {
            console.error('Error toggling 2FA:', error);
            toast.error('An error occurred');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid #334155',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                        Admin Activity Logs
                    </h1>
                    <div className="flex items-center justify-between">
                        <p className="text-gray-400 text-sm font-light">Monitor all admin actions and report modifications</p>
                        <div className="flex gap-3">
                            <button
                                onClick={async () => {
                                    const admins = await getAllAdmin();
                                    setAdminList(admins);
                                    setShowAdminListModal(true);
                                }}
                                className="bg-gradient-to-r from-blue-500/30 to-blue-600/30 hover:from-blue-500/40 hover:to-blue-600/40 border border-blue-400/50 hover:border-blue-300 text-blue-300 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                            >
                                <Users className="w-4 h-4" />
                                Manage Admins
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-gradient-to-r from-emerald-500/30 to-emerald-600/30 hover:from-emerald-500/40 hover:to-emerald-600/40 border border-emerald-400/50 hover:border-emerald-300 text-emerald-300 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                            >
                                <UserPlus className="w-4 h-4" />
                                Create Admin
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Filters & Search</h2>
                    <div className="flex flex-wrap gap-3 items-center">
                        <input
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Search by admin, report ID, details..."
                            className="bg-slate-900/70 border border-slate-700/50 hover:border-slate-600/70 focus:border-cyan-400/50 focus:outline-none px-4 py-2 rounded-lg text-sm w-80 text-gray-200 placeholder-gray-500 transition-all"
                        />

                        <select
                            name="action"
                            value={filters.action}
                            onChange={handleFilterChange}
                            className="bg-slate-900/70 border border-slate-700/50 hover:border-slate-600/70 focus:border-cyan-400/50 focus:outline-none px-4 py-2 rounded-lg text-sm text-gray-200 transition-all cursor-pointer"
                        >
                            <option value="">All Actions</option>
                            {uniqueActions.map((action, i) => (
                                <option key={i} value={action} className="bg-slate-800">
                                    {action}
                                </option>
                            ))}
                        </select>

                        <select
                            name="admin"
                            value={filters.admin}
                            onChange={handleFilterChange}
                            className="bg-slate-900/70 border border-slate-700/50 hover:border-slate-600/70 focus:border-cyan-400/50 focus:outline-none px-4 py-2 rounded-lg text-sm text-gray-200 transition-all cursor-pointer"
                        >
                            <option value="">All Admins</option>
                            {uniqueAdmins.map((admin, i) => (
                                <option key={i} value={admin} className="bg-slate-800">
                                    {admin}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={resetFilters}
                            className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 px-5 py-2 rounded-lg text-sm font-medium text-white transition-all shadow-md hover:shadow-lg"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-5 space-y-2 hover:border-blue-400/60 transition-all">
                        <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Total Logs</p>
                        <p className="text-3xl font-black text-blue-300">{totalLogs}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-5 space-y-2 hover:border-emerald-400/60 transition-all">
                        <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Reports Created</p>
                        <p className="text-3xl font-black text-emerald-300">{createdCount}</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-xl p-5 space-y-2 hover:border-amber-400/60 transition-all">
                        <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Reports Updated</p>
                        <p className="text-3xl font-black text-amber-300">{updatedCount}</p>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 rounded-xl p-5 space-y-2 hover:border-cyan-400/60 transition-all">
                        <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">Reports Viewed</p>
                        <p className="text-3xl font-black text-cyan-300">{viewedCount}</p>
                    </div>
                </div>

                {/* Logs List */}
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
                    {logsLoading ? (
                        <div className="p-8 text-center text-gray-400">Loading logs...</div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">No logs found.</div>
                    ) : (
                        <div className="space-y-2 p-4">
                            {filteredLogs.map((log) => (
                                <div
                                    key={log.id}
                                    className={`border rounded-xl p-5 transition-all hover:shadow-lg ${getActionBg(log.action)}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="mt-0.5">{getActionIcon(log.action)}</div>
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {log.timestamp}
                                                </span>
                                                <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-slate-900/50 border border-slate-700/50 text-gray-300">
                                                    {log.action}
                                                </span>
                                                <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                                    <UserCircle className="w-3 h-3" />
                                                    {log.admin}
                                                </span>
                                            </div>
                                            <p className="text-gray-200 font-medium text-sm">{log.details}</p>
                                            <div className="flex gap-3 text-xs text-gray-400">
                                                <span className="font-mono bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50">
                                                    {log.reportId}
                                                </span>
                                                <span className="bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50">
                                                    {log.offense}
                                                </span>
                                                <span className="bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50">
                                                    {log.barangay}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Admin Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
                    <div className="relative bg-gradient-to-b from-slate-800/95 to-slate-900/95 border border-slate-700/50 rounded-3xl p-8 w-full max-w-md shadow-2xl">
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h3 className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 mb-6">
                            Create New Admin
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Username</label>
                                <input
                                    type="text"
                                    placeholder="juan.delacruz"
                                    value={newAdmin.username}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                                    className="w-full bg-slate-900/70 border border-slate-700/50 focus:border-cyan-400/50 focus:outline-none px-4 py-2 rounded-lg text-gray-200 placeholder-gray-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    placeholder="juan.delacruz@example.com"
                                    value={newAdmin.email}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                    className="w-full bg-slate-900/70 border border-slate-700/50 focus:border-cyan-400/50 focus:outline-none px-4 py-2 rounded-lg text-gray-200 placeholder-gray-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={newAdmin.password}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                    className="w-full bg-slate-900/70 border border-slate-700/50 focus:border-cyan-400/50 focus:outline-none px-4 py-2 rounded-lg text-gray-200 placeholder-gray-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-200 font-semibold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateAdmin}
                                className="flex-1 px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold shadow-lg transition-all"
                            >
                                Create Admin
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin List Modal */}
            {showAdminListModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
                    <div className="relative bg-gradient-to-b from-slate-800/95 to-slate-900/95 border border-slate-700/50 rounded-3xl p-8 w-full max-w-3xl max-h-[80vh] overflow-y-auto shadow-2xl">
                        <button
                            onClick={() => setShowAdminListModal(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h3 className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-6">
                            Admin Management
                        </h3>

                        <div className="space-y-3">
                            {adminList.map((admin: any) => (
                                <div
                                    key={admin._id}
                                    className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 hover:border-slate-600/70 transition-all"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <UserCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                                                <h4 className="font-semibold text-gray-200">{admin?.username}</h4>
                                                {admin?.role === 'head-admin' && (
                                                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                                                        HEAD ADMIN
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mb-2 ml-7">
                                                <Mail className="w-4 h-4 text-gray-500" />
                                                <p className="text-sm text-gray-400">{admin?.email || 'No email'}</p>
                                            </div>
                                            <p className="text-xs text-gray-500 ml-7">
                                                Created:{" "}
                                                {admin?.createdAt
                                                    ? new Date(admin.createdAt).toLocaleString("en-US", {
                                                        month: "long",
                                                        day: "numeric",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })
                                                    : "N/A"}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => handleToggle2FA(admin._id, admin.enableTwoFA)}
                                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${admin.enableTwoFA
                                                    ? 'bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-300'
                                                    : 'bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/50 text-gray-300'
                                                    }`}
                                                disabled={admin.role === 'head-admin'}
                                                title={admin.role === 'head-admin' ? 'Head admin bypasses 2FA' : ''}
                                            >
                                                {admin?.enableTwoFA ? (
                                                    <>
                                                        <Shield className="w-4 h-4" />
                                                        2FA On
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShieldOff className="w-4 h-4" />
                                                        2FA Off
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAdmin(admin?._id)}
                                                className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 font-semibold text-sm transition-all flex items-center gap-2"
                                                disabled={admin.role === 'head-admin'}
                                                title={admin.role === 'head-admin' ? 'Cannot delete head admin' : ''}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-700/50">
                            <button
                                onClick={() => setShowAdminListModal(false)}
                                className="w-full px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-200 font-semibold transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLogsPage;