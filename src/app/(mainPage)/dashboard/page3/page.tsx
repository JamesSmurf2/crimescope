"use client";

import React, { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    TimeScale,
    PointElement,
    LineElement,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import useReportStore from "@/utils/zustand/ReportStore";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
);

interface Report {
    _id: string;
    blotterNo: string;
    dateEncoded: string;
    barangay: string;
    street: string;
    typeOfPlace: string;
    dateReported: string;
    timeReported: string;
    dateCommitted: string;
    timeCommitted: string;
    modeOfReporting: string;
    stageOfFelony: string;
    offense: string;
    victim: {
        name: string;
        age: string;
        gender: string;
        harmed: string;
        nationality: string;
        occupation: string;
    };
    suspect: {
        name: string;
        age: string;
        gender: string;
        status: string;
        nationality: string;
        occupation: string;
    };
    suspectMotive: string;
    narrative: string;
    status: "Solved" | "Cleared" | "Unsolved";
    location: { lat: number; lng: number } | null;
    createdAt: string;
}

const AnalyticsPage: React.FC = () => {
    const { getReports } = useReportStore();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBarangay, setSelectedBarangay] = useState<string>("All Barangays");

    const barangays = [
        "Almanza Dos", "Almanza Uno", "B.F. CAA International Village", "Daniel Fajardo",
        "Elias Aldana", "Ilaya", "Manuyo Uno", "Manuyo Dos", "Pamplona Uno", "Pamplona Dos",
        "Pamplona Tres", "Pilar", "Pulang Lupa Uno", "Pulang Lupa Dos", "Talon Uno",
        "Talon Dos", "Talon Tres", "Talon Cuatro", "Talon Singko", "Zapote",
    ];

    useEffect(() => {
        async function fetchReports() {
            setLoading(true);
            const data = await getReports();
            if (data?.reports) setReports(data.reports);
            setLoading(false);
        }
        fetchReports();
    }, [getReports]);

    // Filter reports based on selected barangay
    const filteredReports = selectedBarangay === "All Barangays"
        ? reports
        : reports.filter(r => r.barangay === selectedBarangay);

    // -------------------- Helper Functions --------------------
    const countByField = (field: string | ((r: Report) => string)) => {
        return filteredReports.reduce((acc: Record<string, number>, r) => {
            const key = typeof field === "string" ? (r as any)[field] || "Unspecified" : field(r) || "Unspecified";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
    };

    const allBarangayCounts: Record<string, number> = {};
    barangays.forEach((b) => {
        allBarangayCounts[b] = filteredReports.filter((r) => r.barangay === b).length || 0;
    });

    // -------------------- Chart Data --------------------
    const statusCounts = countByField("status");
    const barangayCounts = countByField("barangay");
    const offenseCounts = countByField("offense");
    const modeCounts = countByField("modeOfReporting");
    const felonyStageCounts = countByField("stageOfFelony");
    const suspectStatusCounts = countByField((r) => r.suspect.status);
    const typeOfPlaceCounts = countByField("typeOfPlace");

    const casesOverTimeCounts = countByField((r) =>
        new Date(r.createdAt).toLocaleDateString()
    );

    // -------------------- Predictive Cases for Next 7 Days --------------------
    const getPredictedCases = (counts: Record<string, number>, daysAhead = 7) => {
        const dates = Object.keys(counts).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        const values = dates.map((d) => counts[d]);

        if (values.length < 2) return {};

        const n = values.length;
        const xMean = (n - 1) / 2;
        const yMean = values.reduce((a, b) => a + b, 0) / n;

        let numerator = 0;
        let denominator = 0;
        for (let i = 0; i < n; i++) {
            numerator += (i - xMean) * (values[i] - yMean);
            denominator += (i - xMean) ** 2;
        }
        const slope = numerator / denominator;
        const intercept = yMean - slope * xMean;

        const predicted: Record<string, number> = {};
        for (let i = 0; i < daysAhead; i++) {
            const nextIndex = n + i;
            const nextDate = new Date(dates[n - 1]);
            nextDate.setDate(nextDate.getDate() + i + 1);
            const formatted = nextDate.toLocaleDateString();
            const predictedValue = Math.max(Math.round(intercept + slope * nextIndex), 0);
            predicted[formatted] = predictedValue;
        }
        return predicted;
    };

    const predictedNextWeek = getPredictedCases(casesOverTimeCounts, 7);

    const casesWithPrediction = {
        ...casesOverTimeCounts,
        ...predictedNextWeek,
    };

    const predictedLineData = {
        labels: Object.keys(casesWithPrediction),
        datasets: [
            {
                label: "Actual Cases",
                data: Object.keys(casesOverTimeCounts).map((d) => casesOverTimeCounts[d]),
                borderColor: "#0ea5e9",
                backgroundColor: "rgba(6, 182, 212, 0.2)",
                tension: 0.3,
            },
            {
                label: "Predicted Cases",
                data: Object.keys(casesWithPrediction).map((d) =>
                    casesOverTimeCounts[d] ?? casesWithPrediction[d]
                ),
                borderColor: "#f97316",
                borderDash: [5, 5],
                backgroundColor: "rgba(249, 115, 22, 0.2)",
                tension: 0.3,
            },
        ],
    };

    // -------------------- Chart Options --------------------
    const options: any = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: "bottom",
                labels: { color: "#d1d5db", font: { size: 12 } }
            },
        },
        scales: {
            x: { ticks: { color: "#9ca3af" }, grid: { color: "rgba(75, 85, 99, 0.2)" } },
            y: { ticks: { color: "#9ca3af" }, grid: { color: "rgba(75, 85, 99, 0.2)" } },
        }
    };

    // -------------------- New Helper Functions to Fix Redeclare --------------------
    const getCasesByDayCounts = (reports: Report[]) => {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const counts: Record<string, number> = {};
        days.forEach(d => counts[d] = 0);
        reports.forEach((r) => {
            const day = days[new Date(r.createdAt).getDay()];
            counts[day] += 1;
        });
        return counts;
    };

    const getCasesByHourCounts = (reports: Report[]) => {
        const counts: Record<string, number> = {};
        Array.from({ length: 24 }).forEach((_, i) => counts[i.toString()] = 0);
        reports.forEach((r) => {
            const hour = new Date(r.createdAt).getHours();
            counts[hour.toString()] += 1;
        });
        return counts;
    };

    const casesByDayCounts = getCasesByDayCounts(filteredReports);
    const casesByHourCounts = getCasesByHourCounts(filteredReports);

    // Array of distinct colors for different offenses
    const colorPalette = [
        { bg: "#ef4444", border: "#dc2626" },  // Red
        { bg: "#f97316", border: "#ea580c" },  // Orange
        { bg: "#facc15", border: "#eab308" },  // Yellow
        { bg: "#22c55e", border: "#16a34a" },  // Green
        { bg: "#06b6d4", border: "#0891b2" },  // Cyan
        { bg: "#3b82f6", border: "#2563eb" },  // Blue
        { bg: "#6366f1", border: "#4f46e5" },  // Indigo
        { bg: "#a855f7", border: "#9333ea" },  // Purple
        { bg: "#ec4899", border: "#db2777" },  // Pink
        { bg: "#f43f5e", border: "#e11d48" },  // Rose
        { bg: "#14b8a6", border: "#0d9488" },  // Teal
        { bg: "#84cc16", border: "#65a30d" },  // Lime
        { bg: "#eab308", border: "#ca8a04" },  // Amber
        { bg: "#f59e0b", border: "#d97706" },  // Orange variant
        { bg: "#8b5cf6", border: "#7c3aed" },  // Violet
    ];

    // Assign a unique color to each offense type
    const offenseColors = Object.keys(offenseCounts).map((_, index) =>
        colorPalette[index % colorPalette.length]
    );

    const coloredOffenseData = {
        labels: Object.keys(offenseCounts),
        datasets: [{
            label: "Cases by Offense Type",
            data: Object.values(offenseCounts),
            backgroundColor: offenseColors.map(c => c.bg),
            borderColor: offenseColors.map(c => c.border),
            borderWidth: 1
        }]
    };

    // -------------------- Render --------------------
    const getBarData = (counts: Record<string, number>) => ({
        labels: Object.keys(counts),
        datasets: [{ label: "Cases", data: Object.values(counts), backgroundColor: "#0ea5e9", borderColor: "#0284c7", borderWidth: 1 }],
    });

    const getDonutData = (counts: Record<string, number>) => ({
        labels: Object.keys(counts),
        datasets: [{ data: Object.values(counts), backgroundColor: ["#0ea5e9", "#f97316", "#22c55e", "#ef4444", "#facc15", "#94a3b8", "#ec4899"] }],
    });

    const getLineData = (counts: Record<string, number>) => ({
        labels: Object.keys(counts),
        datasets: [{ label: "Cases Over Time", data: Object.values(counts), borderColor: "#0ea5e9", backgroundColor: "rgba(6, 182, 212, 0.1)", tension: 0.3 }],
    });

    const barangayBarChartData = {
        labels: barangays,
        datasets: [
            { label: "Total Crimes", data: barangays.map((b) => allBarangayCounts[b] || 0), backgroundColor: "#f97316", borderColor: "#ea580c", borderWidth: 1 },
        ],
    };

    const casesByMonthCounts: Record<string, number> = {};
    filteredReports.forEach(r => {
        const date = new Date(r.createdAt);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        casesByMonthCounts[month] = (casesByMonthCounts[month] || 0) + 1;
    });

    const casesByDayData = { labels: Object.keys(casesByDayCounts), datasets: [{ label: "Cases by Day of Week", data: Object.values(casesByDayCounts), backgroundColor: "#ef4444", borderColor: "#dc2626", borderWidth: 1 }] };
    const casesByMonthData = { labels: Object.keys(casesByMonthCounts), datasets: [{ label: "Cases by Month", data: Object.values(casesByMonthCounts), borderColor: "#facc15", backgroundColor: "rgba(250, 204, 21, 0.1)", tension: 0.3 }] };
    const casesByHourData = { labels: Object.keys(casesByHourCounts), datasets: [{ label: "Cases by Hour", data: Object.values(casesByHourCounts), backgroundColor: "#22c55e", borderColor: "#16a34a", borderWidth: 1 }] };

    // -------------------- Summary Calculations --------------------
    const totalReports = filteredReports.length;
    const solvedCount = filteredReports.filter(r => r.status === "Solved").length;
    const clearedCount = filteredReports.filter(r => r.status === "Cleared").length;
    const unsolvedCount = filteredReports.filter(r => r.status === "Unsolved").length;

    // Most common barangay
    const barangayCountsSummary = filteredReports.reduce((acc: Record<string, number>, r) => {
        if (!r.barangay) return acc;
        acc[r.barangay] = (acc[r.barangay] || 0) + 1;
        return acc;
    }, {});
    const mostCommonBarangay = Object.entries(barangayCountsSummary)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Most common offense
    const offenseCountsSummary = filteredReports.reduce((acc: Record<string, number>, r) => {
        if (!r.offense) return acc;
        acc[r.offense] = (acc[r.offense] || 0) + 1;
        return acc;
    }, {});
    const mostCommonOffense = Object.entries(offenseCountsSummary)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Peak day of week
    const dayCountsSummary = filteredReports.reduce((acc: Record<string, number>, r) => {
        if (!r.createdAt) return acc;
        const day = new Date(r.createdAt).toLocaleDateString("en-US", { weekday: "long" });
        acc[day] = (acc[day] || 0) + 1;
        return acc;
    }, {});
    const peakDay = Object.entries(dayCountsSummary)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Peak hour
    const hourCountsSummary = filteredReports.reduce((acc: Record<number, number>, r) => {
        if (!r.createdAt) return acc;
        const hour = new Date(r.createdAt).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
    }, {});
    const peakHour = Object.entries(hourCountsSummary)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Predicted cases next 7 days
    const predictedNext7DaysTotal = Object.values(predictedNextWeek).reduce((a, b) => a + b, 0);

    const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) => (
        <div className={`bg-gradient-to-br ${color} backdrop-blur-xl border border-opacity-20 rounded-2xl p-5 space-y-2 hover:shadow-lg transition-all`}>
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">{title}</h3>
                <span className="text-2xl">{icon}</span>
            </div>
            <p className="text-3xl font-black text-white">{value}</p>
        </div>
    );

    // -------------------- Render --------------------
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                        Crime Analytics Dashboard
                    </h1>
                    <p className="text-gray-400 text-sm">Real-time insights and predictive analytics for barangay crime data</p>
                </div>

                {!loading && filteredReports.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                        <StatCard title="Total Reports" value={totalReports} icon="📊" color="from-blue-500/20 to-cyan-500/20 border-blue-500/30" />
                        <StatCard title="Solved Cases" value={solvedCount} icon="✅" color="from-emerald-500/20 to-green-500/20 border-emerald-500/30" />
                        <StatCard title="Cleared Cases" value={clearedCount} icon="⭐" color="from-amber-500/20 to-yellow-500/20 border-amber-500/30" />
                        <StatCard title="Unsolved Cases" value={unsolvedCount} icon="🔍" color="from-red-500/20 to-pink-500/20 border-red-500/30" />

                        <StatCard title="Most Common Barangay" value={mostCommonBarangay} icon="📍" color="from-purple-500/20 to-pink-500/20 border-purple-500/30" />
                        <StatCard title="Most Common Offense" value={mostCommonOffense} icon="⚖️" color="from-orange-500/20 to-red-500/20 border-orange-500/30" />
                        <StatCard title="Peak Day of Week" value={peakDay} icon="📅" color="from-indigo-500/20 to-blue-500/20 border-indigo-500/30" />
                        <StatCard title="Peak Hour" value={`${peakHour}:00`} icon="⏰" color="from-violet-500/20 to-purple-500/20 border-violet-500/30" />

                        <div className="lg:col-span-4 bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-gray-100 mb-2 flex items-center gap-2">
                                🔮 Predicted Cases Next 7 Days
                            </h3>
                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                                {predictedNext7DaysTotal}
                            </div>
                        </div>
                    </div>
                )}

                {/* Barangay Filter Dropdown */}
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <label htmlFor="barangay-filter" className="block text-sm font-semibold text-gray-300 mb-3">
                        🏘️ Filter by Barangay
                    </label>
                    <select
                        id="barangay-filter"
                        value={selectedBarangay}
                        onChange={(e) => setSelectedBarangay(e.target.value)}
                        className="w-full md:w-auto px-6 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all cursor-pointer hover:bg-slate-700/80"
                    >
                        <option value="All Barangays">All Barangays</option>
                        {barangays.map((barangay) => (
                            <option key={barangay} value={barangay}>
                                {barangay}
                            </option>
                        ))}
                    </select>
                    {selectedBarangay !== "All Barangays" && (
                        <p className="text-sm text-cyan-400 mt-3">
                            Showing analytics for: <span className="font-bold">{selectedBarangay}</span>
                        </p>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block">
                            <div className="h-8 w-8 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-gray-400 mt-4">Loading analytics...</p>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 text-center">
                        <p className="text-gray-400 text-lg">
                            {selectedBarangay === "All Barangays"
                                ? "No reports available for analytics."
                                : `No reports available for ${selectedBarangay}.`}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Overall Crimes by Barangay - Full Width */}
                        <div className="lg:col-span-3 bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
                                📈 {selectedBarangay === "All Barangays" ? "Overall Crimes by Barangay" : `Crime Distribution in ${selectedBarangay}`}
                            </h2>
                            {selectedBarangay === "All Barangays" ? (
                                <>
                                    <div className="mb-4 flex flex-wrap gap-3 text-xs">
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 rounded" style={{ backgroundColor: "#ef4444" }}></span>
                                            <span className="text-gray-300">Very High (80-100%)</span>
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 rounded" style={{ backgroundColor: "#f97316" }}></span>
                                            <span className="text-gray-300">High (60-79%)</span>
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 rounded" style={{ backgroundColor: "#facc15" }}></span>
                                            <span className="text-gray-300">Medium (40-59%)</span>
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 rounded" style={{ backgroundColor: "#22c55e" }}></span>
                                            <span className="text-gray-300">Low (20-39%)</span>
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 rounded" style={{ backgroundColor: "#0ea5e9" }}></span>
                                            <span className="text-gray-300">Very Low (0-19%)</span>
                                        </span>
                                    </div>
                                    <Bar data={barangayBarChartData} options={{ ...options, scales: { y: { beginAtZero: true } } }} />
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                                            <h3 className="text-sm font-semibold text-gray-400 mb-2">Total Crimes</h3>
                                            <p className="text-3xl font-bold text-cyan-400">{filteredReports.length}</p>
                                        </div>
                                        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                                            <h3 className="text-sm font-semibold text-gray-400 mb-2">Percentage of Total</h3>
                                            <p className="text-3xl font-bold text-orange-400">
                                                {reports.length > 0 ? ((filteredReports.length / reports.length) * 100).toFixed(1) : 0}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                                        <h3 className="text-sm font-semibold text-gray-400 mb-3">Crime Breakdown by Type</h3>
                                        <Bar data={coloredOffenseData} options={{ ...options, scales: { y: { beginAtZero: true } } }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Cases by Hour */}
                        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">⏱️ Cases by Hour</h2>
                            <Bar data={casesByHourData} options={{ ...options, scales: { y: { beginAtZero: true } } }} />
                        </div>

                        {/* Cases by Day of Week */}
                        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">📅 Cases by Day of Week</h2>
                            <Bar data={casesByDayData} options={{ ...options, scales: { y: { beginAtZero: true } } }} />
                        </div>

                        {/* Cases by Month */}
                        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">📊 Cases by Month</h2>
                            <Line data={casesByMonthData} options={options} />
                        </div>

                        {/* Predicted Cases Next 7 Days */}
                        <div className="lg:col-span-3 bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">🔮 Predicted Cases Next 7 Days</h2>
                            <Line data={predictedLineData} options={options} />
                        </div>

                        {/* Cases by Status */}
                        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">🎯 Cases by Status</h2>
                            <Doughnut data={getDonutData(statusCounts)} options={options} />
                        </div>

                        {/* Cases by Offense */}
                        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">⚖️ Cases by Offense Type</h2>
                            <Bar data={getBarData(offenseCounts)} options={options} />
                        </div>

                        {/* Cases Over Time */}
                        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">📈 Cases Over Time</h2>
                            <Line data={getLineData(casesOverTimeCounts)} options={options} />
                        </div>

                        {/* Cases by Mode of Reporting */}
                        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">📞 Mode of Reporting</h2>
                            <Doughnut data={getDonutData(modeCounts)} options={options} />
                        </div>

                        {/* Cases by Stage of Felony */}
                        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">⚔️ Stage of Felony</h2>
                            <Doughnut data={getDonutData(felonyStageCounts)} options={options} />
                        </div>

                        {/* Cases by Suspect Status */}
                        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">🕵️ Suspect Status</h2>
                            <Doughnut data={getDonutData(suspectStatusCounts)} options={options} />
                        </div>

                        {/* Cases by Type of Place */}
                        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">📍 Type of Place</h2>
                            <Bar data={getBarData(typeOfPlaceCounts)} options={options} />
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsPage;