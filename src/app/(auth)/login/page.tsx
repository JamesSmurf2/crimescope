'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import useAuthStore from '@/utils/zustand/useAuthStore';

const Page = () => {
    const { LoginFunction } = useAuthStore();

    const router = useRouter();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        setError('');
        const data = await LoginFunction({ username: formData.username, password: formData.password });

        if (data?.error) {
            setError(data.error);
            return;
        }
        router.push('/dashboard/page1');
    };

    return (
        <div className="w-[100vw] h-[100vh] bg-black flex items-center justify-center text-white">
            <div className="flex flex-col items-center w-[400px] bg-[#111] rounded-2xl shadow-lg p-[40px]">
                <h1 className="text-[36px] font-bold text-transparent bg-clip-text custom-gradient text-center">
                    Admin Login
                </h1>

                <form onSubmit={handleLogin} className="w-full flex flex-col gap-5 mt-8">
                    <div>
                        <label className="block mb-2 text-gray-300">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg bg-[#1b1b1b] text-white outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-gray-300">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg bg-[#1b1b1b] text-white outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm mt-1 w-[full] text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-center py-3 rounded-lg font-semibold hover:opacity-90 transition cursor-pointer"
                    >
                        Login
                    </button>
                </form>

                <div className="mt-6 text-gray-400 text-sm">
                    <span>Back to </span>
                    <Link href="/" className="text-blue-400 hover:underline">
                        Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Page;
