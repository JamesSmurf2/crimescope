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
        getReports();
    }, [getReports]);

    const getCrimeCount = (barangayName: string) => {
        const reportList = reports || [];
        return reportList.filter((r: any) => r.barangay === barangayName).length;
    };

    const getCommonCrimes = (barangayName: string) => {
        const reportList = reports || [];
        const crimes = reportList.filter((r: any) => r.barangay === barangayName);

        if (crimes.length === 0) return "No reported crimes";

        const crimeCount: Record<string, number> = {};
        crimes.forEach((r: any) => {
            crimeCount[r.crime] = (crimeCount[r.crime] || 0) + 1;
        });

        const sorted = Object.entries(crimeCount).sort((a, b) => b[1] - a[1]);
        return sorted[0][0];
    };

    return (
        <div className="flex flex-col items-center w-full h-[130vh] bg-gradient-to-br from-[#0F1120] to-[#1C1E2D] text-white">
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
            <div className="relative w-[1000px] h-[105vh] bg-[#0F1120] rounded-xl shadow-xl  border border-white/10">
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

                                {/* Barangay name */}
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-xl text-white tracking-wide">
                                        {b.name}
                                    </h3>
                                    <span className="px-3 py-1 text-sm rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                                        {getCrimeCount(b.name)} cases
                                    </span>
                                </div>

                                {/* Description */}
                                <p className="text-base text-gray-300 mt-3 leading-relaxed">
                                    {b.crimes}
                                </p>

                                {/* Stats */}
                                <div className="mt-5 space-y-3 text-base">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">📊 Reported Crimes</span>
                                        <span className="text-white font-semibold">
                                            {getCrimeCount(b.name)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">🔎 Common Crime</span>
                                        <span className="text-white font-semibold">
                                            {getCommonCrimes(b.name)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>


            {/* Baranggay here news or information */}

            <div>

            </div>
        </div>
    );
};

export default Page;
