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
import useAuthStore from "@/utils/zustand/useAuthStore";
import { useRouter } from "next/navigation";

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
    const router = useRouter()

    const { getReports } = useReportStore();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    const { getAuthUserFunction, authUser } = useAuthStore()
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
        async function fetchReports() {
            setLoading(true);
            const data = await getReports();
            if (data?.reports) setReports(data.reports);
            setLoading(false);
        }
        fetchReports();
    }, [getReports]);

    // -------------------- Helper Functions --------------------
    const barangays = [
        "Almanza Dos", "Almanza Uno", "B.F. CAA International Village", "Aldana",
        "Manuyo Dos", "Manuyo Uno", "Pamplona Dos", "Pamplona Tres",
        "Pamplona Uno", "Pilar", "Pulang Lupa Dos", "Pulang Lupa Uno",
        "Talon Dos", "Talon Kuatro", "Talon Singko", "Talon Tres",
        "Talon Uno", "Zapote",
    ];

    const countByField = (field: string | ((r: Report) => string)) => {
        return reports.reduce((acc: Record<string, number>, r) => {
            const key = typeof field === "string" ? (r as any)[field] || "Unspecified" : field(r) || "Unspecified";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
    };

    const allBarangayCounts: Record<string, number> = {};
    barangays.forEach((b) => {
        allBarangayCounts[b] = reports.filter((r) => r.barangay === b).length || 0;
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

    const casesByDayCounts = getCasesByDayCounts(reports);
    const casesByHourCounts = getCasesByHourCounts(reports);

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
    reports.forEach(r => {
        const date = new Date(r.createdAt);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        casesByMonthCounts[month] = (casesByMonthCounts[month] || 0) + 1;
    });

    const casesByDayData = { labels: Object.keys(casesByDayCounts), datasets: [{ label: "Cases by Day of Week", data: Object.values(casesByDayCounts), backgroundColor: "#ef4444", borderColor: "#dc2626", borderWidth: 1 }] };
    const casesByMonthData = { labels: Object.keys(casesByMonthCounts), datasets: [{ label: "Cases by Month", data: Object.values(casesByMonthCounts), borderColor: "#facc15", backgroundColor: "rgba(250, 204, 21, 0.1)", tension: 0.3 }] };
    const casesByHourData = { labels: Object.keys(casesByHourCounts), datasets: [{ label: "Cases by Hour", data: Object.values(casesByHourCounts), backgroundColor: "#22c55e", borderColor: "#16a34a", borderWidth: 1 }] };

    // -------------------- Summary Calculations --------------------
    const totalReports = reports.length;
    const solvedCount = reports.filter(r => r.status === "Solved").length;
    const clearedCount = reports.filter(r => r.status === "Cleared").length;
    const unsolvedCount = reports.filter(r => r.status === "Unsolved").length;

    // Most common barangay
    const barangayCountsSummary = reports.reduce((acc: Record<string, number>, r) => {
        if (!r.barangay) return acc;
        acc[r.barangay] = (acc[r.barangay] || 0) + 1;
        return acc;
    }, {});
    const mostCommonBarangay = Object.entries(barangayCountsSummary)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Most common offense
    const offenseCountsSummary = reports.reduce((acc: Record<string, number>, r) => {
        if (!r.offense) return acc;
        acc[r.offense] = (acc[r.offense] || 0) + 1;
        return acc;
    }, {});
    const mostCommonOffense = Object.entries(offenseCountsSummary)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Peak day of week
    const dayCountsSummary = reports.reduce((acc: Record<string, number>, r) => {
        if (!r.createdAt) return acc;
        const day = new Date(r.createdAt).toLocaleDateString("en-US", { weekday: "long" });
        acc[day] = (acc[day] || 0) + 1;
        return acc;
    }, {});
    const peakDay = Object.entries(dayCountsSummary)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Peak hour
    const hourCountsSummary = reports.reduce((acc: Record<number, number>, r) => {
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

                {!loading && reports.length > 0 && (
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

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block">
                            <div className="h-8 w-8 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-gray-400 mt-4">Loading analytics...</p>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 text-center">
                        <p className="text-gray-400 text-lg">No reports available for analytics.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Overall Crimes by Barangay - Full Width */}
                        <div className="lg:col-span-3 bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">📈 Overall Crimes by Barangay</h2>
                            <Bar data={barangayBarChartData} options={{ ...options, scales: { y: { beginAtZero: true } } }} />
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