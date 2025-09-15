'use client'
import React, { useEffect, useState } from "react";
import useReportStore from "@/utils/zustand/ReportStore";

type Barangay = {
    name: string;
    img: string;
    style: string;
    crimes: string;
};

const barangays: Barangay[] = [
    {
        name: "Manuyo Uno",
        img: "/maps/manuyo uno.png",
        style: "absolute left-[400px]",
        crimes: "Reported theft and minor robbery cases in 2024.",
    },
    {
        name: "Aldana",
        img: "/maps/aldana.png",
        style: "absolute top-[45px] left-[365px]",
        crimes: "Low crime rate. Mostly traffic-related violations.",
    },
    {
        name: "Manuyo Dos",
        img: "/maps/Manuyo dos.png",
        style: "absolute top-[40px] left-[440px]",
        crimes: "Frequent cases of physical altercations reported.",
    },
    {
        name: "Pulang Lupa Dos",
        img: "/maps/pulang lupa dos.png",
        style: "absolute top-[105px] left-[399px]",
        crimes: "Noted for burglary and illegal parking issues.",
    },
    {
        name: "B.F. CAA International Village",
        img: "/maps/CAA BF INT.png",
        style: "absolute top-[180px] left-[500px]",
        crimes: "High cases of drug-related incidents in 2023–2024.",
    },
    {
        name: "Talon Tres",
        img: "/maps/talon tres.png",
        style: "absolute top-[272px] left-[527px]",
        crimes: "Petty theft and domestic disturbance are common.",
    },
    {
        name: "Almanza Uno",
        img: "/maps/Almanza uno.png",
        style: "absolute top-[330px] left-[595px]",
        crimes: "Traffic congestion and pickpocketing issues.",
    },
    {
        name: "Talon Uno",
        img: "/maps/talon uno.png",
        style: "absolute top-[248px] left-[500px]",
        crimes: "Moderate crime, mostly physical assault cases.",
    },
    {
        name: "Pilar",
        img: "/maps/pillar.png",
        style: "absolute top-[381px] left-[540px]",
        crimes: "Frequent cases of illegal gambling reported.",
    },
    {
        name: "Talon Cinco",
        img: "/maps/talon sinko.png",
        style: "absolute top-[360px] left-[455px]",
        crimes: "Street-level crimes and illegal vendors.",
    },
    {
        name: "Talon Kwatro",
        img: "/maps/talon kwatro.png",
        style: "absolute top-[335px] left-[500px]",
        crimes: "High vehicular accidents and traffic problems.",
    },
    {
        name: "Pamplona Dos",
        img: "/maps/pamplona dos.png",
        style: "absolute top-[240px] left-[340px]",
        crimes: "Pickpocketing incidents near marketplaces.",
    },
    {
        name: "Pamplona Uno",
        img: "/maps/pamplona uno.png",
        style: "absolute top-[170px] left-[325px]",
        crimes: "Low crime rate, mainly curfew violations.",
    },
    {
        name: "Pamplona Tres",
        img: "/maps/pamplona tres.png",
        style: "absolute top-[170px] left-[375px]",
        crimes: "Frequent cases of petty theft in public areas.",
    },
    {
        name: "Pulang Lupa Uno",
        img: "/maps/pulang lupa uno.png",
        style: "absolute top-[78px] left-[333px]",
        crimes: "Cases of illegal street racing reported.",
    },
    {
        name: "Zapote",
        img: "/maps/zapote.png",
        style: "absolute top-[133px] left-[320px]",
        crimes: "Drug-related cases and property theft.",
    },
    {
        name: "Talon Dos",
        img: "/maps/talon dos.png",
        style: "absolute top-[275px] left-[355px]",
        crimes: "Street brawls and noise complaints.",
    },
    {
        name: "Almanza Dos",
        img: "/maps/Almanza dos.png",
        style: "absolute top-[435px] left-[510px]",
        crimes: "Moderate crime, mostly petty theft and robbery.",
    },
];

const Page = () => {
    const { getReports, reports } = useReportStore();
    const [hovered, setHovered] = useState<Barangay | null>(null);

    useEffect(() => {
        getReports(); // fetch reports on load
    }, [getReports]);

    // Count crimes by barangay
    const getCrimeCount = (barangayName: string) => {
        const reportList = reports || []; // safely access array
        return reportList.filter((r: any) => r.barangay === barangayName).length;
    };

    // Get the most common crimes in a barangay
    const getCommonCrimes = (barangayName: string) => {
        const reportList = reports || [];
        const crimes = reportList.filter((r: any) => r.barangay === barangayName);

        if (crimes.length === 0) return "No reported crimes";

        const crimeCount: Record<string, number> = {};
        crimes.forEach((r: any) => {
            crimeCount[r.crime] = (crimeCount[r.crime] || 0) + 1;
        });

        // sort by frequency
        const sorted = Object.entries(crimeCount).sort((a, b) => b[1] - a[1]);
        return sorted[0][0]; // return most common crime
    };

    return (
        <div className="flex items-center justify-center w-full h-[100%] bg-[#0F1120]">
            <div className="relative w-[1000px] h-[100%]">
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
                            className="cursor-pointer hover:scale-105 transition"
                        />

                        {/* Tooltip Card */}
                        {hovered?.name === b.name && (
                            <div className="absolute left-full top-0 ml-5 w-80 p-6 rounded-2xl shadow-2xl
      bg-gradient-to-br from-[#1E2130]/95 to-[#2A2E42]/95 backdrop-blur-xl border border-white/10 z-50
      animate-fadeIn transform transition-all duration-300 ease-in-out">

                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-xl text-white tracking-wide">
                                        {b.name}
                                    </h3>
                                    <span className="px-3 py-1 text-sm rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                                        {getCrimeCount(b.name)} cases
                                    </span>
                                </div>

                                {/* Crime Description */}
                                <p className="text-base text-gray-300 mt-3 leading-relaxed">
                                    {b.crimes}
                                </p>

                                {/* Stats */}
                                <div className="mt-5 space-y-3 text-base">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">📊 Reported Crimes</span>
                                        <span className="text-white font-semibold">{getCrimeCount(b.name)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">🔎 Common Crime</span>
                                        <span className="text-white font-semibold">{getCommonCrimes(b.name)}</span>
                                    </div>
                                </div>
                            </div>
                        )}



                    </div>
                ))}
            </div>
        </div>
    );
};

export default Page;
