"use client";

import React, { useState, useEffect } from "react";
import useReportStore from "@/utils/zustand/ReportStore";

const ReportsPage = () => {
    const { getReports } = useReportStore();
    const [reports, setReports] = useState<any[]>([]);
    const [filteredReports, setFilteredReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters state
    const [filters, setFilters] = useState({
        dateRange: "",
        crimeType: "",
        barangay: "",
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

    // Fetch reports on mount
    useEffect(() => {
        async function fetchReports() {
            setLoading(true);
            const data = await getReports();
            if (data && data.reports) {
                setReports(data.reports);
                setFilteredReports(data.reports);
            }
            setLoading(false);
        }
        fetchReports();
    }, [getReports]);

    // Filtering logic
    useEffect(() => {
        if (!reports.length) return;

        let filtered = [...reports];

        // Filter by crimeType
        if (filters.crimeType) {
            filtered = filtered.filter((r) => r.crime === filters.crimeType);
        }

        // Filter by barangay
        if (filters.barangay) {
            filtered = filtered.filter((r) => r.barangay === filters.barangay);
        }

        // Filter by status
        if (filters.status) {
            // Normalize status check, fallback 'Pending' if no status field
            filtered = filtered.filter((r) => {
                const status = r.status?.toLowerCase() || "pending";
                return status === filters.status.toLowerCase();
            });
        }

        // Filter by dateRange
        if (filters.dateRange) {
            const today = new Date();
            filtered = filtered.filter((r) => {
                const reportDate = new Date(r.date);
                switch (filters.dateRange) {
                    case "Last 7 Days":
                        return reportDate >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    case "Last 30 Days":
                        return reportDate >= new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    case "This Year":
                        return reportDate.getFullYear() === today.getFullYear();
                    default:
                        return true;
                }
            });
        }

        setFilteredReports(filtered);
    }, [filters, reports]);

    // === Helper functions for summary ===
    const totalReports = filteredReports.length;

    const solvedCount = filteredReports.filter(
        (r) => r.status?.toLowerCase() === "solved"
    ).length;

    const unsolvedCount = filteredReports.filter(
        (r) => r.status?.toLowerCase() === "unsolved"
    ).length;

    const crimeFrequency = filteredReports.reduce<Record<string, number>>((acc, r) => {
        acc[r.crime] = (acc[r.crime] || 0) + 1;
        return acc;
    }, {});

    const mostCommonCrime = Object.entries(crimeFrequency).reduce(
        (max, entry) => (entry[1] > max[1] ? entry : max),
        ["N/A", 0]
    )[0];

    // Handle filter changes
    function handleFilterChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value === "" ? "" : value,
        }));
    }

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
                    <select
                        name="dateRange"
                        value={filters.dateRange}
                        onChange={handleFilterChange}
                        className="bg-[#1C1E2E] px-3 py-2 rounded-lg text-sm"
                    >
                        <option value="">Date Range</option>
                        <option value="Last 7 Days">Last 7 Days</option>
                        <option value="Last 30 Days">Last 30 Days</option>
                        <option value="This Year">This Year</option>
                    </select>

                    {/* Crime Type Dropdown */}
                    <select
                        name="crimeType"
                        value={filters.crimeType}
                        onChange={handleFilterChange}
                        className="bg-[#1C1E2E] px-3 py-2 rounded-lg text-sm"
                    >
                        <option value="">Crime Type</option>
                        <optgroup label="🚨 Serious Crimes">
                            {crimes.serious.map((c, idx) => (
                                <option key={idx} className="text-red-500" value={c}>
                                    {c}
                                </option>
                            ))}
                        </optgroup>
                        <optgroup label="⚖️ Moderate Offenses">
                            {crimes.moderate.map((c, idx) => (
                                <option key={idx} className="text-yellow-400" value={c}>
                                    {c}
                                </option>
                            ))}
                        </optgroup>
                        <optgroup label="📝 Minor Violations">
                            {crimes.minor.map((c, idx) => (
                                <option key={idx} className="text-green-400" value={c}>
                                    {c}
                                </option>
                            ))}
                        </optgroup>
                    </select>

                    {/* Barangay Dropdown */}
                    <select
                        name="barangay"
                        value={filters.barangay}
                        onChange={handleFilterChange}
                        className="bg-[#1C1E2E] px-3 py-2 rounded-lg text-sm"
                    >
                        <option value="">Barangay</option>
                        {barangays.map((b, idx) => (
                            <option key={idx} value={b}>
                                {b}
                            </option>
                        ))}
                    </select>

                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="bg-[#1C1E2E] px-3 py-2 rounded-lg text-sm"
                    >
                        <option value="">Status</option>
                        <option value="Solved">Solved</option>
                        <option value="Unsolved">Unsolved</option>
                        <option value="Pending">Pending</option>
                    </select>
                </div>

                {/* 🔹 Report Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#1C1E2E] p-4 rounded-xl shadow">
                        <h2 className="text-sm text-gray-400">Total Reports</h2>
                        <p className="text-xl font-bold">{loading ? "Loading..." : totalReports}</p>
                    </div>
                    <div className="bg-[#1C1E2E] p-4 rounded-xl shadow">
                        <h2 className="text-sm text-gray-400">Most Common Crime</h2>
                        <p className="text-xl font-bold">{loading ? "Loading..." : mostCommonCrime}</p>
                    </div>
                    <div className="bg-[#1C1E2E] p-4 rounded-xl shadow">
                        <h2 className="text-sm text-gray-400">Solved Cases</h2>
                        <p className="text-xl font-bold">{loading ? "Loading..." : solvedCount}</p>
                    </div>
                    <div className="bg-[#1C1E2E] p-4 rounded-xl shadow">
                        <h2 className="text-sm text-gray-400">Unsolved Cases</h2>
                        <p className="text-xl font-bold">{loading ? "Loading..." : unsolvedCount}</p>
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
                    {loading ? (
                        <p className="text-center text-gray-400">Loading reports...</p>
                    ) : (
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
                                {filteredReports.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-4 text-center text-gray-400">
                                            No reports found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReports.map((report) => {
                                        let statusText = report.status || "Pending";
                                        let statusClass = "text-yellow-400";

                                        if (statusText.toLowerCase() === "solved") statusClass = "text-green-400";
                                        else if (statusText.toLowerCase() === "unsolved") statusClass = "text-red-400";
                                        else if (statusText.toLowerCase() === "pending") statusClass = "text-yellow-400";

                                        // Crime severity color mapping
                                        const allCrimes = [...crimes.serious, ...crimes.moderate, ...crimes.minor];
                                        let crimeColor = "text-white";
                                        if (crimes.serious.includes(report.crime)) crimeColor = "text-red-400";
                                        else if (crimes.moderate.includes(report.crime)) crimeColor = "text-yellow-400";
                                        else if (crimes.minor.includes(report.crime)) crimeColor = "text-green-400";

                                        return (
                                            <tr key={report._id} className="border-b border-gray-800">
                                                <td className="p-2">{report._id}</td>
                                                <td className="p-2">{report.complainantName}</td>
                                                <td className={`p-2 ${crimeColor}`}>{report.crime}</td>
                                                <td className="p-2">{report.barangay}</td>
                                                <td className="p-2">{report.date}</td>
                                                <td className={`p-2 ${statusClass}`}>{statusText}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
