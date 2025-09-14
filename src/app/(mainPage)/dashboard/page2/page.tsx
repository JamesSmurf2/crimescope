"use client";

import React, { useState } from "react";

const ReportsPage = () => {
    const [filters, setFilters] = useState({
        dateRange: "",
        crimeType: "",
        status: "",
    });

    const crimes = {
        serious: [
            "Theft / Robbery",
            "Physical Assault",
            "Domestic Violence",
            "Illegal Drugs",
            "Sexual Harassment",
            "Murder / Homicide",
            "Human Trafficking",
            "Kidnapping",
            "Fraud / Scam",
        ],
        moderate: [
            "Vandalism",
            "Trespassing",
            "Illegal Gambling",
            "Public Disturbance / Fighting",
            "Threats / Verbal Harassment",
            "Cybercrime / Online Harassment",
            "Stalking",
            "Animal Cruelty",
        ],
        minor: [
            "Noise Complaint",
            "Curfew Violation",
            "Littering / Illegal Dumping",
            "Drinking in Public",
            "Smoking in Prohibited Areas",
            "Jaywalking",
            "Loitering",
            "Minor Traffic Violation",
            "Unleashed Pets / Stray Animals",
            "Illegal Parking",
        ],
    };

    const barangays = [
        "Almanza Dos",
        "Almanza Uno",
        "B.F. CAA International Village",
        "Aldana",
        "Manuyo Dos",
        "Manuyo Uno",
        "Pamplona Dos",
        "Pamplona Tres",
        "Pamplona Uno",
        "Pilar",
        "Pulang Lupa Dos",
        "Pulang Lupa Uno",
        "Talon Dos",
        "Talon Kuatro",
        "Talon Singko",
        "Talon Tres",
        "Talon Uno",
        "Zapote",
    ];

    return (
        <div className="flex items-center justify-center w-full min-h-screen bg-[#0F1120] text-white p-6">
            <div className="w-full max-w-[1200px] space-y-6">
                {/* 🔹 Header Section */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Crime Reports Dashboard</h1>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">
                        Generate Report
                    </button>
                </div>

                {/* 🔹 Filters */}
                <div className="flex gap-4 flex-wrap">
                    <select className="bg-[#1C1E2E] px-3 py-2 rounded-lg text-sm">
                        <option>Date Range</option>
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>This Year</option>
                    </select>

                    {/* Crime Type Dropdown */}
                    <select className="bg-[#1C1E2E] px-3 py-2 rounded-lg text-sm">
                        <option>Crime Type</option>
                        <optgroup label="🚨 Serious Crimes">
                            {crimes.serious.map((c, idx) => (
                                <option key={idx} className="text-red-500">
                                    {c}
                                </option>
                            ))}
                        </optgroup>
                        <optgroup label="⚖️ Moderate Offenses">
                            {crimes.moderate.map((c, idx) => (
                                <option key={idx} className="text-yellow-400">
                                    {c}
                                </option>
                            ))}
                        </optgroup>
                        <optgroup label="📝 Minor Violations">
                            {crimes.minor.map((c, idx) => (
                                <option key={idx} className="text-green-400">
                                    {c}
                                </option>
                            ))}
                        </optgroup>
                    </select>

                    {/* Barangay Dropdown */}
                    <select className="bg-[#1C1E2E] px-3 py-2 rounded-lg text-sm">
                        <option>Barangay</option>
                        {barangays.map((b, idx) => (
                            <option key={idx}>{b}</option>
                        ))}
                    </select>

                    <select className="bg-[#1C1E2E] px-3 py-2 rounded-lg text-sm">
                        <option>Status</option>
                        <option>Solved</option>
                        <option>Unsolved</option>
                    </select>
                </div>

                {/* 🔹 Report Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#1C1E2E] p-4 rounded-xl shadow">
                        <h2 className="text-sm text-gray-400">Total Reports</h2>
                        <p className="text-xl font-bold">123</p>
                    </div>
                    <div className="bg-[#1C1E2E] p-4 rounded-xl shadow">
                        <h2 className="text-sm text-gray-400">Most Common Crime</h2>
                        <p className="text-xl font-bold">Theft</p>
                    </div>
                    <div className="bg-[#1C1E2E] p-4 rounded-xl shadow">
                        <h2 className="text-sm text-gray-400">Solved Cases</h2>
                        <p className="text-xl font-bold">89</p>
                    </div>
                    <div className="bg-[#1C1E2E] p-4 rounded-xl shadow">
                        <h2 className="text-sm text-gray-400">Unsolved Cases</h2>
                        <p className="text-xl font-bold">34</p>
                    </div>
                </div>

                {/* 🔹 Charts Placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#1C1E2E] rounded-xl p-4 h-64 flex items-center justify-center">
                        <p className="text-gray-400">[ Bar Chart Placeholder ]</p>
                    </div>
                    <div className="bg-[#1C1E2E] rounded-xl p-4 h-64 flex items-center justify-center">
                        <p className="text-gray-400">[ Pie Chart Placeholder ]</p>
                    </div>
                </div>

                {/* 🔹 Reports Table */}
                <div className="bg-[#1C1E2E] rounded-xl p-4 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left border-b border-gray-700">
                                <th className="p-2">Report ID</th>
                                <th className="p-2">Complainant</th>
                                <th className="p-2">Crime</th>
                                <th className="p-2">Barangay</th>
                                <th className="p-2">Date</th>
                                <th className="p-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-800">
                                <td className="p-2">RPT-001</td>
                                <td className="p-2">Juan Dela Cruz</td>
                                <td className="p-2 text-red-400">Robbery</td>
                                <td className="p-2">Zapote</td>
                                <td className="p-2">2025-09-01</td>
                                <td className="p-2 text-green-400">Solved</td>
                            </tr>
                            <tr className="border-b border-gray-800">
                                <td className="p-2">RPT-002</td>
                                <td className="p-2">Maria Santos</td>
                                <td className="p-2 text-yellow-400">Vandalism</td>
                                <td className="p-2">Talon Uno</td>
                                <td className="p-2">2025-09-05</td>
                                <td className="p-2 text-yellow-400">In Progress</td>
                            </tr>
                            <tr>
                                <td className="p-2">RPT-003</td>
                                <td className="p-2">Pedro Reyes</td>
                                <td className="p-2 text-green-400">Noise Complaint</td>
                                <td className="p-2">Pamplona Tres</td>
                                <td className="p-2">2025-09-10</td>
                                <td className="p-2 text-red-400">Pending</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
