'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/reusable/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import useAuthStore from '@/utils/zustand/useAuthStore';

export default function Home() {
  const router = useRouter();

  const { getAuthUserFunction, authUser } = useAuthStore()
  //For auth
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


  return (
    <div className="w-[100vw] h-[100vh] bg-black">
      <div className="w-full h-full flex items-center justify-center font-bold flex-col">
        <div className="text-[52px] font-bold text-transparent bg-clip-text custom-gradient text-center">
          Barangay Crime Data Visualization
          <br></br>and Pattern Analysis</div>

        <div className="text-white"></div>

        <div className="pt-[50px] flex gap-[25px]">
          <Link href="/login">
            <Button text="Admin Login" />
          </Link>
        </div>
      </div>
    </div>
  );
}
