'use client'
import React, { useEffect, useState } from "react";
import useReportStore from "@/utils/zustand/ReportStore";
import useAuthStore from "@/utils/zustand/useAuthStore";
import { useRouter } from "next/navigation";

type Barangay = {
    name: string;
    img: string;
    style: string;
    offense: string;
};

const barangays: Barangay[] = [
    {
        name: "Manuyo Uno",
        img: "/maps/Manuyo uno.png",
        style: "absolute left-[400px]",
        offense: "Reported theft and minor robbery cases in 2024.",
    },
    {
        name: "Aldana",
        img: "/maps/Aldana.png",
        style: "absolute top-[45px] left-[365px]",
        offense: "Low crime rate. Mostly traffic-related violations.",
    },
    {
        name: "Manuyo Dos",
        img: "/maps/Manuyo dos.png",
        style: "absolute top-[40px] left-[440px]",
        offense: "Frequent cases of physical altercations reported.",
    },
    {
        name: "Pulang Lupa Dos",
        img: "/maps/Pulang lupa dos.png",
        style: "absolute top-[105px] left-[399px]",
        offense: "Noted for burglary and illegal parking issues.",
    },
    {
        name: "B.F. CAA International Village",
        img: "/maps/CAA BF INT.png",
        style: "absolute top-[180px] left-[500px]",
        offense: "High cases of drug-related incidents in 2023–2024.",
    },
    {
        name: "Talon Tres",
        img: "/maps/Talon tres.png",
        style: "absolute top-[272px] left-[527px]",
        offense: "Petty theft and domestic disturbance are common.",
    },
    {
        name: "Almanza Uno",
        img: "/maps/Almanza Uno.png",
        style: "absolute top-[330px] left-[595px]",
        offense: "Traffic congestion and pickpocketing issues.",
    },
    {
        name: "Talon Uno",
        img: "/maps/Talon uno.png",
        style: "absolute top-[248px] left-[500px]",
        offense: "Moderate crime, mostly physical assault cases.",
    },
    {
        name: "Pilar",
        img: "/maps/Pillar.png",
        style: "absolute top-[381px] left-[540px]",
        offense: "Frequent cases of illegal gambling reported.",
    },
    {
        name: "Talon Cinco",
        img: "/maps/Talon sinko.png",
        style: "absolute top-[360px] left-[455px]",
        offense: "Street-level offense and illegal vendors.",
    },
    {
        name: "Talon Kwatro",
        img: "/maps/Talon kwatro.png",
        style: "absolute top-[335px] left-[500px]",
        offense: "High vehicular accidents and traffic problems.",
    },
    {
        name: "Pamplona Dos",
        img: "/maps/Pamplona dos.png",
        style: "absolute top-[240px] left-[340px]",
        offense: "Pickpocketing incidents near marketplaces.",
    },
    {
        name: "Pamplona Uno",
        img: "/maps/Pamplona uno.png",
        style: "absolute top-[170px] left-[325px]",
        offense: "Low crime rate, mainly curfew violations.",
    },
    {
        name: "Pamplona Tres",
        img: "/maps/Pamplona tres.png",
        style: "absolute top-[170px] left-[375px]",
        offense: "Frequent cases of petty theft in public areas.",
    },
    {
        name: "Pulang Lupa Uno",
        img: "/maps/Pulang lupa uno.png",
        style: "absolute top-[78px] left-[333px]",
        offense: "Cases of illegal street racing reported.",
    },
    {
        name: "Zapote",
        img: "/maps/Zapote.png",
        style: "absolute top-[133px] left-[320px]",
        offense: "Drug-related cases and property theft.",
    },
    {
        name: "Talon Dos",
        img: "/maps/Talon dos.png",
        style: "absolute top-[275px] left-[355px]",
        offense: "Street brawls and noise complaints.",
    },
    {
        name: "Almanza Dos",
        img: "/maps/Almanza dos.png",
        style: "absolute top-[435px] left-[510px]",
        offense: "Moderate crime, mostly petty theft and robbery.",
    },
];

const Page = () => {
    const router = useRouter()
    const { getAuthUserFunction, authUser } = useAuthStore()

    const { getReports, reports } = useReportStore();
    const [hovered, setHovered] = useState<Barangay | null>(null);

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
        if (!authLoading && authUser === null) {
            router.push('/');
        }
    }, [authUser, authLoading, router]);


    useEffect(() => {
        getReports();
    }, [getReports]);

    const getCrimeCount = (barangayName: string) => {
        const reportList = reports || [];
        return reportList.filter((r: any) => r.barangay === barangayName).length;
    };

    const getCommonoffense = (barangayName: string) => {
        const reportList = reports || [];
        const offenseList = reportList.filter((r: any) => r.barangay === barangayName);

        if (offenseList.length === 0) return "No reported offense";

        const offenseCount: Record<string, number> = {};
        offenseList.forEach((r: any) => {
            offenseCount[r.offense] = (offenseCount[r.offense] || 0) + 1;
        });

        const sorted = Object.entries(offenseCount).sort((a, b) => b[1] - a[1]);
        return sorted[0][0];
    };

    // ✅ NEW: Count status types (Cleared / Solved / Unsolved)
    const getStatusCount = (barangayName: string) => {
        const reportList = reports || [];
        const filtered = reportList.filter((r: any) => r.barangay === barangayName);

        const counts = { Cleared: 0, Solved: 0, Unsolved: 0 };

        filtered.forEach((r: any) => {
            const status = r.status?.toLowerCase();
            if (status === "cleared") counts.Cleared++;
            else if (status === "solved") counts.Solved++;
            else if (status === "unsolved") counts.Unsolved++;
        });

        return counts;
    };

    return (
        <div className="overflow-x-hidden w-[100vw] bg-[#0F1120] ">
            {/* Header */}
            <header className="w-full py-8 text-center border-b border-white/10 mb-6">
                <h1 className="text-4xl font-bold tracking-wide text-red-400 drop-shadow-lg">
                    Las Piñas Crime Map
                </h1>
                <p className="mt-2 text-gray-400 text-lg">
                    Hover over a barangay to view crime statistics and details
                </p>
            </header>

            {/* Map Container */}
            <div className='w-[100%] h-[100%] flex items-center justify-center'>
                <div className="relative w-[1000px] h-[105vh] bg-[#0F1120] rounded-xl shadow-xl  border border-white/10 ">
                    {barangays.map((b, i) => (
                        <div
                            key={i}
                            className={b.style}
                            onMouseEnter={() => setHovered(b)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            <img
                                src={b.img}
                                alt={b.name}
                                className="cursor-pointer scale-[0.9] hover:scale-95 transition-transform duration-300"
                            />

                            {hovered?.name === b.name && (
                                <div className="absolute left-full top-0 ml-5 w-80 p-6 rounded-2xl shadow-2xl
                bg-gradient-to-br from-[#1E2130]/95 to-[#2A2E42]/95 backdrop-blur-xl 
                border border-white/10 z-50 animate-fadeIn">

                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-xl text-white tracking-wide">
                                            {b.name}
                                        </h3>
                                    </div>

                                    <p className="text-base text-gray-300 mt-3 leading-relaxed">
                                        {b.offense}
                                    </p>

                                    <div className="mt-5 space-y-3 text-base">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400">📊 Reported offense</span>
                                            <span className="text-white font-semibold">
                                                {getCrimeCount(b.name)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400">🔎 Common Crime</span>
                                            <span className="text-white font-semibold">
                                                {getCommonoffense(b.name)}
                                            </span>
                                        </div>

                                        {/* ✅ NEW: Status Count Section */}
                                        <div className="border-t border-white/10 pt-3 mt-4">
                                            <h4 className="text-gray-400 mb-2">📍 Status Count</h4>
                                            {(() => {
                                                const status = getStatusCount(b.name);
                                                return (
                                                    <ul className="text-sm text-gray-300 space-y-1">
                                                        <li>🟩 Cleared: <span className="text-white font-semibold">{status.Cleared}</span></li>
                                                        <li>🟦 Solved: <span className="text-white font-semibold">{status.Solved}</span></li>
                                                        <li>🟥 Unsolved: <span className="text-white font-semibold">{status.Unsolved}</span></li>
                                                    </ul>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Page;
