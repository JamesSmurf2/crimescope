'use client'
import React, { useState } from "react";

type Barangay = {
    name: string;
    img: string;
    style: string;
    crimes: string;
};

const barangays = [
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
    }
    , { name: "Manuyo Dos", img: "/maps/Manuyo dos.png", style: "absolute top-[40px] left-[440px]", crimes: "Frequent cases of physical altercations reported.", }, { name: "Pulang Lupa Dos", img: "/maps/pulang lupa dos.png", style: "absolute top-[105px] left-[399px]", crimes: "Noted for burglary and illegal parking issues.", }, { name: "CAA BF INT", img: "/maps/CAA BF INT.png", style: "absolute top-[180px] left-[500px]", crimes: "High cases of drug-related incidents in 2023–2024.", }, { name: "Talon Tres", img: "/maps/talon tres.png", style: "absolute top-[272px] left-[527px]", crimes: "Petty theft and domestic disturbance are common.", }, { name: "Almanza Uno", img: "/maps/Almanza uno.png", style: "absolute top-[330px] left-[595px]", crimes: "Traffic congestion and pickpocketing issues.", }, { name: "Talon Uno", img: "/maps/talon uno.png", style: "absolute top-[248px] left-[500px]", crimes: "Moderate crime, mostly physical assault cases.", }, { name: "Pilar", img: "/maps/pillar.png", style: "absolute top-[381px] left-[540px]", crimes: "Frequent cases of illegal gambling reported.", }, { name: "Talon Cinco", img: "/maps/talon sinko.png", style: "absolute top-[360px] left-[455px]", crimes: "Street-level crimes and illegal vendors.", }, { name: "Talon Kwatro", img: "/maps/talon kwatro.png", style: "absolute top-[335px] left-[500px]", crimes: "High vehicular accidents and traffic problems.", }, { name: "Pamplona Dos", img: "/maps/pamplona dos.png", style: "absolute top-[240px] left-[340px]", crimes: "Pickpocketing incidents near marketplaces.", }, { name: "Pamplona Uno", img: "/maps/pamplona uno.png", style: "absolute top-[170px] left-[325px]", crimes: "Low crime rate, mainly curfew violations.", }, { name: "Pamplona Tres", img: "/maps/pamplona tres.png", style: "absolute top-[170px] left-[375px]", crimes: "Frequent cases of petty theft in public areas.", }, { name: "Pulang Lupa Uno", img: "/maps/pulang lupa uno.png", style: "absolute top-[78px] left-[333px]", crimes: "Cases of illegal street racing reported.", }, { name: "Zapote", img: "/maps/zapote.png", style: "absolute top-[133px] left-[320px]", crimes: "Drug-related cases and property theft.", }, { name: "Talon Dos", img: "/maps/talon dos.png", style: "absolute top-[275px] left-[355px]", crimes: "Street brawls and noise complaints.", }, { name: "Almanza Dos", img: "/maps/Almanza dos.png", style: "absolute top-[435px] left-[510px]", crimes: "Moderate crime, mostly petty theft and robbery.", },];

const Page = () => {
    const [hovered, setHovered] = useState<Barangay | null>(null);

    return (
        <div className="flex items-center justify-center w-full h-[100%] bg-base-200">
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
                            <div className="absolute left-full top-0 ml-2 w-60 p-3 rounded-lg shadow-lg bg-base-100 border border-base-300 z-50 animate-fadeIn">
                                <h3 className="font-bold text-lg">{b.name}</h3>
                                <p className="text-sm text-gray-600">{b.crimes}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Page;
