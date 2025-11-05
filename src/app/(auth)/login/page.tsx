'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, User, ArrowLeft, Eye, EyeOff, Mail } from 'lucide-react';

import useAuthStore from '@/utils/zustand/useAuthStore';

const Page = () => {
    const { getAuthUserFunction, authUser } = useAuthStore();

    const router = useRouter();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // 2FA State
    const [show2FA, setShow2FA] = useState(false);
    const [twoFACode, setTwoFACode] = useState('');
    const [userId, setUserId] = useState('');

    // For auth
    const [authLoading, setAuthLoading] = useState(true);
    useEffect(() => {
        const checkAuth = async () => {
            await getAuthUserFunction();
            setAuthLoading(false);
        };
        checkAuth();
    }, [getAuthUserFunction]);

    useEffect(() => {
        if (!authLoading && authUser) {
            router.push('/dashboard/page1');
        }
    }, [authUser, authLoading, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: formData.username, password: formData.password }),
            });

            const data = await response.json();

            if (data?.error) {
                setError(data.error);
                setIsLoading(false);
                return;
            }

            // Check if 2FA is required
            if (data.step === '2fa') {
                setUserId(data.userId);
                setShow2FA(true);
                setIsLoading(false);
                return;
            }

            // Head-admin success without 2FA
            if (data.success) {
                await getAuthUserFunction();
                router.push('/dashboard/page1');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    const handleVerify2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/verify-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, code: twoFACode }),
            });

            const data = await response.json();

            if (data?.error) {
                setError(data.error);
                setIsLoading(false);
                return;
            }

            // 2FA verification successful - cookie is already set by backend
            if (data.success) {
                await getAuthUserFunction();
                router.push('/dashboard/page1');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    const handleBack2FA = () => {
        setShow2FA(false);
        setIsLoading(false);
        setTwoFACode('');
        setUserId('');
        setError('');
        window.location.reload();
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
                <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse"></div>
            </div>

            {/* Back to Home Button */}
            <Link
                href="/"
                className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group z-10"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm">Back to Home</span>
            </Link>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 sm:p-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                            {show2FA ? <Mail className="w-8 h-8 text-white" /> : <Shield className="w-8 h-8 text-white" />}
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2">
                            {show2FA ? 'Verify Code' : 'Login'}
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {show2FA ? 'Enter the 6-digit code sent to your email' : 'Access your crime analytics dashboard'}
                        </p>
                    </div>

                    {/* Login Form */}
                    {!show2FA ? (
                        <form onSubmit={handleLogin} className="space-y-5">
                            {/* Username Field */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-300">
                                    Username
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                        <User className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        placeholder="Enter your username"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-300">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                        <Lock className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                        placeholder="Enter your password"
                                        required
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-300 transition-colors"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 animate-shake">
                                    <p className="text-red-400 text-sm text-center font-medium">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Logging in...
                                    </span>
                                ) : (
                                    'Login'
                                )}
                            </button>
                        </form>
                    ) : (
                        /* 2FA Form */
                        <form onSubmit={handleVerify2FA} className="space-y-5">
                            {/* 2FA Code Field */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-300">
                                    Verification Code
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                        <Mail className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        value={twoFACode}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                                            setTwoFACode(value);
                                            if (error) setError('');
                                        }}
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-center text-2xl tracking-widest"
                                        placeholder="000000"
                                        maxLength={6}
                                        required
                                        disabled={isLoading}
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    Code expires in 5 minutes
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 animate-shake">
                                    <p className="text-red-400 text-sm text-center font-medium">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || twoFACode.length !== 6}
                                className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifying...
                                    </span>
                                ) : (
                                    'Verify Code'
                                )}
                            </button>

                            {/* Back Button */}
                            <button
                                type="button"
                                onClick={() => {
                                    console.log("I got clicked")
                                    handleBack2FA()
                                }}
                                disabled={isLoading}
                                className="w-full bg-white/5 border border-white/10 text-gray-300 font-semibold py-3 rounded-xl hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Back to Login
                            </button>
                        </form>
                    )}

                    {/* Footer Links */}
                    {!show2FA && (
                        <div className="mt-8 text-center">
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                                <span>Not an admin?</span>
                                <Link href="/" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                    Go to Home
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Security Badge */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <Lock className="w-4 h-4" />
                    <span>Secured with {show2FA ? 'two-factor authentication' : 'end-to-end encryption'}</span>
                </div>
            </div>

            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-8px); }
                    75% { transform: translateX(8px); }
                }
                .animate-shake {
                    animation: shake 0.4s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default Page;