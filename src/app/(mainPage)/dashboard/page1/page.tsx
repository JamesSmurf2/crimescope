'use client'
import React, { useEffect, useState, useCallback } from "react";
import useReportStore from "@/utils/zustand/ReportStore";
import useAuthStore from "@/utils/zustand/useAuthStore";
import { useRouter } from "next/navigation";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    ChartDataLabels
);

type Barangay = {
    name: string;
    filename: string;
    style: string;
};

const barangays: Barangay[] = [
    {
        name: "Manuyo Uno",
        filename: "Manuyo-Uno.png",
        style: "scale-[0.3] absolute left-[350px]",
    },
    {
        name: "Daniel Fajardo",
        filename: "Daniel-Fajardo.png",
        style: "scale-[0.3] absolute top-[82px] left-[406px]",
    },
    {
        name: "Ilaya",
        filename: "Ilaya.png",
        style: "scale-[0.3] absolute top-[117px] left-[422px]",
    },
    {
        name: "Elias Aldana",
        filename: "Elias-Aldana.png",
        style: "scale-[0.3] absolute top-[158px] left-[354px]",
    },
    {
        name: "Pulang Lupa Uno",
        filename: "Pulang-Lupa-Uno.png",
        style: "scale-[0.3] absolute top-[114px] left-[153px]",
    },
    {
        name: "Manuyo Dos",
        filename: "Manuyo-Dos.png",
        style: "scale-[0.3] absolute top-[-15px] left-[360px]",
    },
    {
        name: "Zapote",
        filename: "Zapote.png",
        style: "scale-[0.3] absolute top-[168px] left-[140px]",
    },
    {
        name: "Pulang Lupa Dos",
        filename: "Pulang-Lupa-Dos.png",
        style: "scale-[0.3] absolute top-[139px] left-[382px]",
    },
    {
        name: "Pamplona Uno",
        filename: "Pamplona-Uno.png",
        style: "scale-[0.3] absolute top-[267px] left-[283px]",
    },
    {
        name: "Pamplona Tres",
        filename: "Pamplona-Tres.png",
        style: "scale-[0.3] absolute top-[141px] left-[156px]",
    },
    {
        name: "B.F. CAA International Village",
        filename: "BF-CAA-International-Village.png",
        style: "scale-[0.3] absolute top-[282px] left-[362px]",
    },
    {
        name: "Talon Tres",
        filename: "Talon-Tres.png",
        style: "scale-[0.3] absolute top-[315px] left-[415px]",
    },
    {
        name: "Pamplona Dos",
        filename: "Pamplona-Dos.png",
        style: "scale-[0.3] absolute top-[378px] left-[253px]",
    },
    {
        name: "Talon Dos",
        filename: "Talon-Dos.png",
        style: "scale-[0.3] absolute top-[232px] left-[66px]",
    },
    {
        name: "Talon Uno",
        filename: "Talon-Uno.png",
        style: "scale-[0.3] absolute top-[540px] left-[430px]",
    },
    {
        name: "Talon Kwatro",
        filename: "Talon-Kwatro.png",
        style: "scale-[0.3] absolute top-[538px] left-[493px]",
    },
    {
        name: "Almanza Uno",
        filename: "Almanza-Uno.png",
        style: "scale-[0.3] absolute top-[419px] left-[610px]",
    },
    {
        name: "Talon Singko",
        filename: "Talon-Singko.png",
        style: "scale-[0.3] absolute top-[477px] left-[331px]",
    },
    {
        name: "Pilar",
        filename: "Pilar.png",
        style: "scale-[0.3] absolute top-[470px] left-[556px]",
    },
    {
        name: "Almanza Dos",
        filename: "Almanza-Dos.png",
        style: "scale-[0.3] absolute top-[285px] left-[333px]",
    },
];

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const Page = () => {
    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };
    const { getReports, reports } = useReportStore();
    const [hovered, setHovered] = useState<Barangay | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

    const getOffenseDistribution = useCallback((barangayName: string) => {
        const offenseList = (reports || []).filter((r: any) => r.barangay === barangayName);

        if (offenseList.length === 0) return null;

        const offenseCount: Record<string, number> = {};
        offenseList.forEach((r: any) => {
            offenseCount[r.offense] = (offenseCount[r.offense] || 0) + 1;
        });

        const labels = Object.keys(offenseCount);
        const data = Object.values(offenseCount);

        return {
            labels,
            datasets: [{
                data,
                backgroundColor: COLORS.slice(0, labels.length),
                borderColor: COLORS.slice(0, labels.length).map(color => color + '80'),
                borderWidth: 2,
            }]
        };
    }, [reports]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: '#9ca3af',
                    font: {
                        size: 10
                    },
                    padding: 10,
                    boxWidth: 12,
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(248, 113, 113, 0.3)',
                borderWidth: 1,
                padding: 10,
                displayColors: true,
            },
            datalabels: {
                color: '#fff',
                font: {
                    weight: 'bold' as const,
                    size: 14
                },
                formatter: (value: number, context: any) => {
                    const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                    const percentage = Math.round((value / total) * 100);
                    return `${percentage}%`;
                },
                anchor: 'center' as const,
                align: 'center' as const,
            }
        }
    };

    const getCrimeLevel = useCallback((count: number) => {
        if (count === 0) return { level: "Low", color: "emerald", folder: "gray" };
        if (count <= 5) return { level: "Moderate", color: "amber", folder: "yellow" };
        if (count <= 10) return { level: "High", color: "orange", folder: "red" };
        return { level: "Critical", color: "red", folder: "red" };
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
            <div className="w-full flex items-center justify-center">
                <div className="relative w-[1200px] h-[150vh] mt-[-150px]" onMouseMove={handleMouseMove}>
                    {barangays.map((b, i) => {
                        const crimeCount = getCrimeCount(b.name);
                        const crimeLevel = getCrimeLevel(crimeCount);
                        const statusCount = getStatusCount(b.name);
                        const offenseChartData = getOffenseDistribution(b.name);
                        const imgPath = `/maps/${crimeLevel.folder}/${b.filename}`;

                        return (
                            <div key={i}>
                                <img
                                    src={imgPath}
                                    alt={b.name}
                                    className={`${b.style} cursor-pointer hover:scale-[0.32] transition-all duration-300 filter hover:drop-shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:brightness-125`}
                                    loading="lazy"
                                    onMouseEnter={() => setHovered(b)}
                                    onMouseLeave={() => setHovered(null)}
                                />

                                {hovered?.name === b.name && (
                                    <div className="fixed w-full max-w-md p-8 rounded-3xl shadow-2xl
                        bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-950/95 backdrop-blur-2xl 
                        border border-red-500/30 z-50 ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-300 pointer-events-none"
                                        style={{
                                            left: `${mousePos.x - 600}px`,
                                            top: `${mousePos.y - 200}px`,
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
                                                    <div className={`px-3 py-1 rounded-lg text-xs font-bold ${crimeLevel.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                                                        crimeLevel.color === 'amber' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                                                            crimeLevel.color === 'orange' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                                                                'bg-red-500/20 text-red-300 border-red-500/30'
                                                        } border`}>
                                                        {crimeLevel.level}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Pie Chart */}
                                            {offenseChartData && (
                                                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Crime Type Distribution</h4>
                                                    <div className="h-[200px]">
                                                        <Pie data={offenseChartData} options={chartOptions} />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 p-4 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all group/stat">
                                                    <div className="text-gray-400 text-xs font-semibold mb-2">📊 Total Cases</div>
                                                    <div className="text-2xl font-bold text-red-400">{crimeCount}</div>
                                                </div>
                                                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all">
                                                    <div className="text-gray-400 text-xs font-semibold mb-2">🔎 Common Crime</div>
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
    );
};

export default Page;