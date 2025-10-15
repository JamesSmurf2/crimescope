'use client'
import React, { useEffect, useState, useCallback } from "react";
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

    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };
    const router = useRouter();
    const { getAuthUserFunction, authUser } = useAuthStore();
    const { getReports, reports } = useReportStore();
    const [hovered, setHovered] = useState<Barangay | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
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

    const getCrimeCount = useCallback((barangayName: string) => {
        return (reports || []).filter((r: any) => r.barangay === barangayName).length;
    }, [reports]);

    const getCommonoffense = useCallback((barangayName: string) => {
        const offenseList = (reports || []).filter((r: any) => r.barangay === barangayName);

        if (offenseList.length === 0) return "No reported offense";

        const offenseCount: Record<string, number> = {};
        offenseList.forEach((r: any) => {
            offenseCount[r.offense] = (offenseCount[r.offense] || 0) + 1;
        });

        const sorted = Object.entries(offenseCount).sort((a, b) => b[1] - a[1]);
        return sorted[0][0];
    }, [reports]);

    const getStatusCount = useCallback((barangayName: string) => {
        const filtered = (reports || []).filter((r: any) => r.barangay === barangayName);
        const counts = { Cleared: 0, Solved: 0, Unsolved: 0 };

        filtered.forEach((r: any) => {
            const status = r.status?.toLowerCase();
            if (status === "cleared") counts.Cleared++;
            else if (status === "solved") counts.Solved++;
            else if (status === "unsolved") counts.Unsolved++;
        });

        return counts;
    }, [reports]);

    const getCrimeLevel = useCallback((count: number) => {
        if (count === 0) return { level: "Low", color: "emerald" };
        if (count <= 5) return { level: "Moderate", color: "amber" };
        if (count <= 10) return { level: "High", color: "orange" };
        return { level: "Critical", color: "red" };
    }, []);

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-x-hidden">
            {/* Header */}
            <header className="w-full pt-12 pb-8 px-4 text-center border-b border-red-500/20 bg-gradient-to-b from-red-500/10 to-transparent backdrop-blur-sm">
                <div className="max-w-5xl mx-auto space-y-3">
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-red-600">
                        Las Piñas Crime Map
                    </h1>
                    <p className="text-gray-300 text-sm md:text-base font-light tracking-wide">
                        Interactive crime statistics dashboard • Hover to explore barangay details
                    </p>
                </div>
            </header>

            {/* Map Container */}
            <div className="w-full flex items-center justify-center py-8 px-4">
                <div className="relative w-full max-w-5xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 rounded-2xl shadow-2xl border border-red-500/20 backdrop-blur-xl ">
                    <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.05)_1px,_transparent_1px)] bg-[length:20px_20px]"></div>

                    <div className="relative w-full h-[120vh] mt-[50px]" onMouseMove={handleMouseMove}>
                        {barangays.map((b, i) => {
                            const crimeCount = getCrimeCount(b.name);
                            const crimeLevel = getCrimeLevel(crimeCount);
                            const statusCount = getStatusCount(b.name);

                            return (
                                <div
                                    key={i}
                                    className={b.style}
                                    onMouseEnter={() => setHovered(b)}
                                    onMouseLeave={() => setHovered(null)}
                                >
                                    <div className="relative group">
                                        <img
                                            src={b.img}
                                            alt={b.name}
                                            className="cursor-pointer scale-90 hover:scale-100 transition-all duration-300 filter group-hover:drop-shadow-[0_0_20px_rgba(239,68,68,0.4)] group-hover:brightness-125"
                                            loading="lazy"
                                        />

                                        {/* Crime Level Badge */}
                                        {crimeCount > 0 && (
                                            <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold bg-${crimeLevel.color}-500/80 text-white shadow-lg border border-${crimeLevel.color}-300/50 backdrop-blur-sm`}>
                                                {crimeLevel.level}
                                            </div>
                                        )}
                                    </div>

                                    {hovered?.name === b.name && (
                                        <div className="fixed w-full max-w-md p-8 rounded-3xl shadow-2xl
                        bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-950/95 backdrop-blur-2xl 
                        border border-red-500/30 z-50 ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-300 pointer-events-none"
                                            style={{
                                                left: `${mousePos.x - 400}px`,
                                                top: `${mousePos.y - 300}px`,


                                            }}>

                                            <div className="space-y-6">
                                                {/* Header Section */}
                                                <div className="space-y-2">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <h3 className="text-2xl font-bold text-white tracking-tight">
                                                                {b.name}
                                                            </h3>
                                                            <div className="h-0.5 w-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full mt-2"></div>
                                                        </div>
                                                        <div className={`px-3 py-1 rounded-lg text-xs font-bold bg-${crimeLevel.color}-500/20 text-${crimeLevel.color}-300 border border-${crimeLevel.color}-500/30`}>
                                                            {crimeLevel.level}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <p className="text-gray-300 text-sm leading-relaxed">
                                                    {b.offense}
                                                </p>

                                                {/* Stats Grid */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 p-4 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all group/stat">
                                                        <div className="text-gray-400 text-xs font-semibold mb-2">📊 Total Cases</div>
                                                        <div className="text-2xl font-bold text-red-400">{crimeCount}</div>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all">
                                                        <div className="text-gray-400 text-xs font-semibold mb-2">🔎 Crime Type</div>
                                                        <div className="text-sm font-bold text-blue-400 truncate">{getCommonoffense(b.name)}</div>
                                                    </div>
                                                </div>

                                                {/* Status Breakdown */}
                                                <div className="space-y-3">
                                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Case Status Distribution</h4>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-lg p-3 text-center hover:bg-emerald-500/25 transition-all cursor-pointer group/cleared">
                                                            <div className="text-emerald-400 font-bold text-xl">{statusCount.Cleared}</div>
                                                            <div className="text-emerald-600 text-xs font-semibold mt-1 group-hover/cleared:text-emerald-500">Cleared</div>
                                                        </div>
                                                        <div className="bg-blue-500/15 border border-blue-500/40 rounded-lg p-3 text-center hover:bg-blue-500/25 transition-all cursor-pointer group/solved">
                                                            <div className="text-blue-400 font-bold text-xl">{statusCount.Solved}</div>
                                                            <div className="text-blue-600 text-xs font-semibold mt-1 group-hover/solved:text-blue-500">Solved</div>
                                                        </div>
                                                        <div className="bg-red-500/15 border border-red-500/40 rounded-lg p-3 text-center hover:bg-red-500/25 transition-all cursor-pointer group/unsolved">
                                                            <div className="text-red-400 font-bold text-xl">{statusCount.Unsolved}</div>
                                                            <div className="text-red-600 text-xs font-semibold mt-1 group-hover/unsolved:text-red-500">Unsolved</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="space-y-2 pt-2 border-t border-white/10">
                                                    <div className="text-xs text-gray-400 font-semibold">Resolution Rate</div>
                                                    <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden border border-white/5">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-red-500 transition-all duration-500"
                                                            style={{
                                                                width: crimeCount > 0
                                                                    ? `${((statusCount.Cleared + statusCount.Solved) / crimeCount * 100)}%`
                                                                    : '0%'
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {crimeCount > 0
                                                            ? `${Math.round((statusCount.Cleared + statusCount.Solved) / crimeCount * 100)}% resolved`
                                                            : 'No cases'
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;