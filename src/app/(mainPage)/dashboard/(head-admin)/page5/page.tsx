'use client'
import React, { useState, useEffect } from 'react';
import { FileText, Edit, Trash2, Eye, UserCircle, Calendar, UserPlus, Users, X } from 'lucide-react';
import useAuthStore from '@/utils/zustand/useAuthStore';
import useAdminStore from '@/utils/zustand/useAdminStore';

import { useRouter } from "next/navigation";


const AdminLogsPage = () => {
    const router = useRouter();

    const { RegisterFunction, getAuthUserFunction, authUser } = useAuthStore()
    const { getAllAdmin, deleteAdmin } = useAdminStore()
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            await getAuthUserFunction();
            setAuthLoading(false);
        };
        checkAuth();
    }, [getAuthUserFunction]);

    useEffect(() => {
        if (!authLoading && authUser === null
            // && authUser?.role !== 'head-admin'
        ) {
            router.push('/');
        }
    }, [authUser, authLoading, router]);

    const [filters, setFilters] = useState({
        search: "",
        action: "",
        admin: "",
    });

    const [adminList, setAdminList] = useState([]);

    const [newAdmin, setNewAdmin] = useState({
        username: '',
        password: ''
    });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAdminListModal, setShowAdminListModal] = useState(false);

    const mockLogs = [
        {
            id: 1,
            timestamp: '2025-10-18 14:23:45',
            admin: 'Juan Dela Cruz',
            action: 'Created Report',
            details: 'Created new crime report - Blotter No: BL-2025-001',
            reportId: 'BL-2025-001',
            offense: 'Theft',
            barangay: 'Almanza Uno'
        }
        // ,
        // {
        //     id: 2,
        //     timestamp: '2025-10-18 14:24:12',
        //     admin: 'Maria Santos',
        //     action: 'Updated Report',
        //     details: 'Updated status from Unsolved to Solved - Blotter No: BL-2025-002',
        //     reportId: 'BL-2025-002',
        //     offense: 'Robbery',
        //     barangay: 'Talon Dos'
        // },
        // {
        //     id: 3,
        //     timestamp: '2025-10-18 14:25:33',
        //     admin: 'Pedro Garcia',
        //     action: 'Deleted Report',
        //     details: 'Deleted duplicate report - Blotter No: BL-2025-003',
        //     reportId: 'BL-2025-003',
        //     offense: 'Physical Injury',
        //     barangay: 'Pamplona Uno'
        // },
        // {
        //     id: 4,
        //     timestamp: '2025-10-18 14:26:45',
        //     admin: 'Juan Dela Cruz',
        //     action: 'Created Report',
        //     details: 'Created new crime report - Blotter No: BL-2025-004',
        //     reportId: 'BL-2025-004',
        //     offense: 'Drug Offense',
        //     barangay: 'Zapote'
        // },
        // {
        //     id: 5,
        //     timestamp: '2025-10-18 14:28:11',
        //     admin: 'Anna Reyes',
        //     action: 'Viewed Report',
        //     details: 'Viewed detailed information - Blotter No: BL-2025-001',
        //     reportId: 'BL-2025-001',
        //     offense: 'Theft',
        //     barangay: 'Almanza Uno'
        // },
        // {
        //     id: 6,
        //     timestamp: '2025-10-18 14:29:22',
        //     admin: 'Maria Santos',
        //     action: 'Updated Report',
        //     details: 'Updated victim information - Blotter No: BL-2025-005',
        //     reportId: 'BL-2025-005',
        //     offense: 'Carnapping',
        //     barangay: 'Pilar'
        // },
        // {
        //     id: 7,
        //     timestamp: '2025-10-18 14:31:45',
        //     admin: 'Juan Dela Cruz',
        //     action: 'Created Report',
        //     details: 'Created new crime report - Blotter No: BL-2025-006',
        //     reportId: 'BL-2025-006',
        //     offense: 'Reckless Driving',
        //     barangay: 'Manuyo Dos'
        // },
        // {
        //     id: 8,
        //     timestamp: '2025-10-18 14:33:18',
        //     admin: 'Pedro Garcia',
        //     action: 'Updated Report',
        //     details: 'Updated suspect status to Arrested - Blotter No: BL-2025-004',
        //     reportId: 'BL-2025-004',
        //     offense: 'Drug Offense',
        //     barangay: 'Zapote'
        // },
        // {
        //     id: 9,
        //     timestamp: '2025-10-18 14:35:27',
        //     admin: 'Anna Reyes',
        //     action: 'Viewed Report',
        //     details: 'Viewed detailed information - Blotter No: BL-2025-006',
        //     reportId: 'BL-2025-006',
        //     offense: 'Reckless Driving',
        //     barangay: 'Manuyo Dos'
        // },
        // {
        //     id: 10,
        //     timestamp: '2025-10-18 14:37:41',
        //     admin: 'Maria Santos',
        //     action: 'Created Report',
        //     details: 'Created new crime report - Blotter No: BL-2025-007',
        //     reportId: 'BL-2025-007',
        //     offense: 'Public Disturbance',
        //     barangay: 'Talon Tres'
        // },
        // {
        //     id: 11,
        //     timestamp: '2025-10-18 14:39:15',
        //     admin: 'Juan Dela Cruz',
        //     action: 'Updated Report',
        //     details: 'Updated narrative section - Blotter No: BL-2025-001',
        //     reportId: 'BL-2025-001',
        //     offense: 'Theft',
        //     barangay: 'Almanza Uno'
        // },
        // {
        //     id: 12,
        //     timestamp: '2025-10-18 14:41:33',
        //     admin: 'Pedro Garcia',
        //     action: 'Viewed Report',
        //     details: 'Viewed detailed information - Blotter No: BL-2025-007',
        //     reportId: 'BL-2025-007',
        //     offense: 'Public Disturbance',
        //     barangay: 'Talon Tres'
        // },
        // {
        //     id: 13,
        //     timestamp: '2025-10-18 14:43:52',
        //     admin: 'Anna Reyes',
        //     action: 'Updated Report',
        //     details: 'Updated status from Unsolved to Cleared - Blotter No: BL-2025-005',
        //     reportId: 'BL-2025-005',
        //     offense: 'Carnapping',
        //     barangay: 'Pilar'
        // },
        // {
        //     id: 14,
        //     timestamp: '2025-10-18 14:45:28',
        //     admin: 'Maria Santos',
        //     action: 'Created Report',
        //     details: 'Created new crime report - Blotter No: BL-2025-008',
        //     reportId: 'BL-2025-008',
        //     offense: 'VAWC',
        //     barangay: 'Pulang Lupa Uno'
        // },
        // {
        //     id: 15,
        //     timestamp: '2025-10-18 14:47:11',
        //     admin: 'Juan Dela Cruz',
        //     action: 'Viewed Report',
        //     details: 'Viewed detailed information - Blotter No: BL-2025-008',
        //     reportId: 'BL-2025-008',
        //     offense: 'VAWC',
        //     barangay: 'Pulang Lupa Uno'
        // },
    ];

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

    const filteredLogs = mockLogs.filter(log => {
        const matchesSearch = filters.search === "" ||
            log.admin.toLowerCase().includes(filters.search.toLowerCase()) ||
            log.details.toLowerCase().includes(filters.search.toLowerCase()) ||
            log.reportId.toLowerCase().includes(filters.search.toLowerCase());

        const matchesAction = filters.action === "" || log.action === filters.action;
        const matchesAdmin = filters.admin === "" || log.admin === filters.admin;

        return matchesSearch && matchesAction && matchesAdmin;
    });

    const uniqueAdmins = [...new Set(mockLogs.map(log => log.admin))];
    const uniqueActions = [...new Set(mockLogs.map(log => log.action))];

    const totalLogs = filteredLogs.length;
    const createdCount = filteredLogs.filter(l => l.action === 'Created Report').length;
    const updatedCount = filteredLogs.filter(l => l.action === 'Updated Report').length;
    const viewedCount = filteredLogs.filter(l => l.action === 'Viewed Report').length;

    const handleFilterChange = (e: any) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => setFilters({ search: "", action: "", admin: "" });

    const handleCreateAdmin = () => {
        if (!newAdmin.password || !newAdmin.username) {
            alert('Please fill in all fields');
            return;
        }

        RegisterFunction({ username: newAdmin.username, password: newAdmin?.password, })

        setShowCreateModal(false);
        alert('Admin created successfully!');
    };

    const handleDeleteAdmin = (id: any) => {
        // if (confirm('Are you sure you want to remove this admin?')) {
        //     setAdminList(adminList.filter(admin => admin.id !== id));
        //     alert('Admin removed successfully!');
        // }

        deleteAdmin(id)
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                        Admin Activity Logs
                    </h1>
                    <div className="flex items-center justify-between">
                        <p className="text-gray-400 text-sm font-light">Monitor all admin actions and report modifications</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    const allFunctions = async () => {
                                        const admins = await getAllAdmin()
                                        setAdminList(admins)
                                    }
                                    allFunctions()
                                    setShowAdminListModal(true)
                                }
                                }

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
                    {filteredLogs.length === 0 ? (
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
                    <div className="relative bg-gradient-to-b from-slate-800/95 to-slate-900/95 border border-slate-700/50 rounded-3xl p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
                        <h3 className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-6">
                            Admin Management
                        </h3>

                        <div className="space-y-3">
                            {adminList.map((admin: any) => (
                                <div
                                    key={admin._id}
                                    className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 flex items-center justify-between hover:border-slate-600/70 transition-all"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <UserCircle className="w-5 h-5 text-cyan-400" />
                                            <h4 className="font-semibold text-gray-200">{admin?.username}</h4>
                                        </div>
                                        <p className="text-xs text-gray-500 ml-7 mt-1">
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
                                    <button
                                        onClick={() => handleDeleteAdmin(admin?._id)}
                                        className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 font-semibold text-sm transition-all flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Remove
                                    </button>
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