'use client';

import React, { useEffect } from 'react';
import Button from '@/components/reusable/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="w-[100vw] h-[100vh] bg-black">
      <div className="w-full h-full flex items-center justify-center font-bold flex-col">
        <div className="text-[52px] font-bold text-transparent bg-clip-text custom-gradient text-center">
          Barangay Crime Data Visualization
          <br></br>and Pattern Analysis</div>

        <div className="text-white"></div>

        <div className="pt-[50px] flex gap-[25px]">
          <Link href="/dashboard/page1">
            <Button text="Start Viewing" />
          </Link>
        </div>
      </div>
    </div>
  );
}
