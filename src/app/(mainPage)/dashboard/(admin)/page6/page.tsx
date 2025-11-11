'use client'
import React, { useState, useEffect } from 'react';
import { UserCircle, Mail, Trash2, Shield, ShieldOff, UserPlus, Users, Brain } from 'lucide-react';
import useAuthStore from '@/utils/zustand/useAuthStore';
import useAdminStore from '@/utils/zustand/useAdminStore';
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const AdminManagementPage = () => {
    const router = useRouter();
    const { RegisterFunction, getAuthUserFunction, authUser } = useAuthStore();
    const { getAllAdmin, deleteAdmin, activateAi, getTheActivateAiValue } = useAdminStore();
    const [authLoading, setAuthLoading] = useState(true);
    const [adminList, setAdminList] = useState([]);
    const [adminsLoading, setAdminsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activatedAi, setActivatedAi] = useState(true)

    const [newAdmin, setNewAdmin] = useState({
        username: '',
        email: '',
        password: ''
    });

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

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                setAdminsLoading(true);
                const admins = await getAllAdmin();
                setAdminList(admins);

                //Get the value of activate ai
                const data = await getTheActivateAiValue()
                setActivatedAi(data)
            } catch (error) {
                console.error('Error fetching admins:', error);
            } finally {
                setAdminsLoading(false);
            }
        };

        if (authUser) {
            fetchAdmins();
        }


    }, [authUser, getAllAdmin]);

    const handleCreateAdmin = async () => {
        if (!newAdmin.password || !newAdmin.username) {
            toast.error('Please fill in username and password');
            return;
        }

        try {
            await RegisterFunction({
                username: newAdmin.username,
                password: newAdmin.password,
                email: newAdmin.email || ""
            });

            setShowCreateModal(false);
            setNewAdmin({ username: '', email: '', password: '' });
            toast.success('Official created successfully!');

            // Refresh admin list
            const admins = await getAllAdmin();
            setAdminList(admins);
        } catch (error) {
            toast.error('Failed to create Official');
        }
    };

    const handleDeleteAdmin = async (id: any) => {
        if (confirm('Are you sure you want to delete this Official?')) {
            try {
                await deleteAdmin(id);
                toast.success('Official deleted successfully');
                // Refresh admin list
                const admins = await getAllAdmin();
                setAdminList(admins);
            } catch (error) {
                toast.error('Failed to delete admin');
            }
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
                toast.error('Failed to toggle 2FA');
            }
        } catch (error) {
            console.error('Error toggling 2FA:', error);
            toast.error('An error occurred');
        }
    };

    const handleActivateAi = () => {

        activateAi();
        setActivatedAi(!activatedAi);
        if (!activatedAi) {
            toast.success('AI Analyzer Activated!');
        } else {
            toast.error('AI Analyzer Deactivated!');
        }

    }

    const activeAdminsCount = adminList.filter((admin: any) => admin.role !== 'head-admin').length;
    const headAdminsCount = adminList.filter((admin: any) => admin.role === 'head-admin').length;
    const twoFAEnabledCount = adminList.filter((admin: any) => admin.enableTwoFA).length;

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
                        Officials Management
                    </h1>
                    <div className="flex items-center justify-between">
                        <p className="text-gray-400 text-sm font-light">Manage officials and their permissions</p>
                        <div className='flex gap-[15px]'>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="cursor-pointer bg-gradient-to-r from-emerald-500/30 to-emerald-600/30 hover:from-emerald-500/40 hover:to-emerald-600/40 border border-emerald-400/50 hover:border-emerald-300 text-emerald-300 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-lg"
                            >
                                <UserPlus className="w-4 h-4" />
                                Create Official
                            </button>
                            <div>
                                <button
                                    onClick={() => handleActivateAi()}
                                    className={`cursor-pointer px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-lg${activatedAi
                                        ? 'bg-gradient-to-r from-blue-500/30 to-blue-600/30 hover:from-blue-500/40 hover:to-blue-600/40 border border-blue-400/50 text-blue-300 hover:border-blue-300'
                                        : 'bg-gradient-to-r from-red-500/30 to-red-600/30 hover:from-red-500/40 hover:to-red-600/40 border border-red-400/50 text-red-300 hover:border-red-300'
                                        }`}
                                >
                                    <Brain className="w-4 h-4" />
                                    {activatedAi ? 'Activate AI Analyzer' : 'Deactivate AI Analyzer'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-5 space-y-2 hover:border-blue-400/60 transition-all">
                        <div className="flex items-center gap-3">
                            <Users className="w-8 h-8 text-blue-300" />
                            <div>
                                <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Total officials</p>
                                <p className="text-3xl font-black text-blue-300">{adminList.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-5 space-y-2 hover:border-purple-400/60 transition-all">
                        <div className="flex items-center gap-3">
                            <Shield className="w-8 h-8 text-purple-300" />
                            <div>
                                <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Head Admins</p>
                                {/* <p className="text-3xl font-black text-purple-300">{headAdminsCount}</p> */}
                                <p className="text-3xl font-black text-purple-300">1</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-5 space-y-2 hover:border-emerald-400/60 transition-all">
                        <div className="flex items-center gap-3">
                            <Shield className="w-8 h-8 text-emerald-300" />
                            <div>
                                <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">2FA Enabled</p>
                                <p className="text-3xl font-black text-emerald-300">{twoFAEnabledCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Admin List */}
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-slate-700/50">
                        <h2 className="text-xl font-bold text-gray-200 flex items-center gap-2">
                            <Users className="w-5 h-5 text-cyan-400" />
                            Officials List
                        </h2>
                    </div>
                    {adminsLoading ? (
                        <div className="p-8 text-center text-gray-400">Loading officials...</div>
                    ) : adminList.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">No officials found.</div>
                    ) : (
                        <div className="p-4 space-y-3">
                            {adminList.map((admin: any) => (
                                <div
                                    key={admin._id}
                                    className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/70 hover:bg-slate-900/70 transition-all"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <UserCircle className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                                                <h4 className="font-semibold text-lg text-gray-200">{admin?.username}</h4>
                                                {admin?.role === 'head-admin' && (
                                                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full border border-purple-500/30 font-semibold">
                                                        HEAD ADMIN
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mb-2 ml-8">
                                                <Mail className="w-4 h-4 text-gray-500" />
                                                <p className="text-sm text-gray-400">{admin?.email || 'No email provided'}</p>
                                            </div>
                                            <p className="text-xs text-gray-500 ml-8">
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
                                                    } ${admin.role === 'head-admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                                                className={`px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 font-semibold text-sm transition-all flex items-center gap-2 ${admin.role === 'head-admin' ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
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
                    )}
                </div>
            </div>

            {/* Create Officials Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
                    <div className="relative bg-gradient-to-b from-slate-800/95 to-slate-900/95 border border-slate-700/50 rounded-3xl p-8 w-full max-w-md shadow-2xl">
                        <h3 className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 mb-6">
                            Create New Official
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Username <span className="text-red-400">*</span></label>
                                <input
                                    type="text"
                                    placeholder="juan.delacruz"
                                    value={newAdmin.username}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                                    className="w-full bg-slate-900/70 border border-slate-700/50 focus:border-cyan-400/50 focus:outline-none px-4 py-2.5 rounded-lg text-gray-200 placeholder-gray-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Email <span className="text-gray-500">(Optional)</span></label>
                                <input
                                    type="email"
                                    placeholder="juan.delacruz@example.com"
                                    value={newAdmin.email}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                    className="w-full bg-slate-900/70 border border-slate-700/50 focus:border-cyan-400/50 focus:outline-none px-4 py-2.5 rounded-lg text-gray-200 placeholder-gray-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Password <span className="text-red-400">*</span></label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={newAdmin.password}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                    className="w-full bg-slate-900/70 border border-slate-700/50 focus:border-cyan-400/50 focus:outline-none px-4 py-2.5 rounded-lg text-gray-200 placeholder-gray-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewAdmin({ username: '', email: '', password: '' });
                                }}
                                className="flex-1 px-6 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-200 font-semibold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateAdmin}
                                className="flex-1 px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold shadow-lg transition-all"
                            >
                                Create Admin
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManagementPage; 