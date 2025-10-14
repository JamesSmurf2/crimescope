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
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.2)",
            },
            {
                label: "Predicted Cases",
                data: Object.keys(casesWithPrediction).map((d) =>
                    casesOverTimeCounts[d] ?? casesWithPrediction[d]
                ),
                borderColor: "#f97316",
                borderDash: [5, 5],
                backgroundColor: "rgba(249, 115, 22, 0.2)",
            },
        ],
    };

    // -------------------- Chart Options --------------------
    const options: any = {
        responsive: true,
        plugins: {
            legend: {
                position: "bottom",
            },
        },
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
        datasets: [{ label: "Cases", data: Object.values(counts), backgroundColor: "#3b82f6" }],
    });

    const getDonutData = (counts: Record<string, number>) => ({
        labels: Object.keys(counts),
        datasets: [{ data: Object.values(counts), backgroundColor: ["#3b82f6", "#f97316", "#22c55e", "#ef4444", "#facc15", "#94a3b8"] }],
    });

    const getLineData = (counts: Record<string, number>) => ({
        labels: Object.keys(counts),
        datasets: [{ label: "Cases Over Time", data: Object.values(counts), borderColor: "#3b82f6", backgroundColor: "rgba(59, 130, 246, 0.2)" }],
    });

    const barangayBarChartData = {
        labels: barangays,
        datasets: [
            { label: "Total Crimes", data: barangays.map((b) => allBarangayCounts[b] || 0), backgroundColor: "#f97316" },
        ],
    };

    const casesByMonthCounts: Record<string, number> = {};
    reports.forEach(r => {
        const date = new Date(r.createdAt);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        casesByMonthCounts[month] = (casesByMonthCounts[month] || 0) + 1;
    });

    const casesByDayData = { labels: Object.keys(casesByDayCounts), datasets: [{ label: "Cases by Day of Week", data: Object.values(casesByDayCounts), backgroundColor: "#ef4444" }] };
    const casesByMonthData = { labels: Object.keys(casesByMonthCounts), datasets: [{ label: "Cases by Month", data: Object.values(casesByMonthCounts), borderColor: "#facc15", backgroundColor: "rgba(250, 204, 21, 0.2)" }] };
    const casesByHourData = { labels: Object.keys(casesByHourCounts), datasets: [{ label: "Cases by Hour", data: Object.values(casesByHourCounts), backgroundColor: "#22c55e" }] };

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

    // Predicted cases next 7 days (already in your code)
    const predictedNext7DaysTotal = Object.values(predictedNextWeek).reduce((a, b) => a + b, 0);


    // -------------------- Render --------------------
    return (
        <div className="min-h-screen bg-[#0F1120] text-white p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold">Barangay Crime Analytics Dashboard</h1>

                {!loading && reports.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

                        <div className="bg-[#1C1E2E] p-4 rounded-md border border-gray-700/50">
                            <h3 className="text-sm font-semibold mb-1">Total Reports</h3>
                            <p className="text-xl font-bold">{totalReports}</p>
                        </div>

                        <div className="bg-[#1C1E2E] p-4 rounded-md border border-gray-700/50">
                            <h3 className="text-sm font-semibold mb-1">Solved</h3>
                            <p className="text-xl font-bold">{solvedCount}</p>
                        </div>

                        <div className="bg-[#1C1E2E] p-4 rounded-md border border-gray-700/50">
                            <h3 className="text-sm font-semibold mb-1">Cleared</h3>
                            <p className="text-xl font-bold">{clearedCount}</p>
                        </div>

                        <div className="bg-[#1C1E2E] p-4 rounded-md border border-gray-700/50">
                            <h3 className="text-sm font-semibold mb-1">Unsolved</h3>
                            <p className="text-xl font-bold">{unsolvedCount}</p>
                        </div>

                        <div className="bg-[#1C1E2E] p-4 rounded-md border border-gray-700/50 md:col-span-2">
                            <h3 className="text-sm font-semibold mb-1">Most Common Barangay</h3>
                            <p className="text-xl font-bold">{mostCommonBarangay}</p>
                        </div>

                        <div className="bg-[#1C1E2E] p-4 rounded-md border border-gray-700/50 md:col-span-2">
                            <h3 className="text-sm font-semibold mb-1">Most Common Offense</h3>
                            <p className="text-xl font-bold">{mostCommonOffense}</p>
                        </div>

                        <div className="bg-[#1C1E2E] p-4 rounded-md border border-gray-700/50 md:col-span-2">
                            <h3 className="text-sm font-semibold mb-1">Peak Day of Week</h3>
                            <p className="text-xl font-bold">{peakDay}</p>
                        </div>

                        <div className="bg-[#1C1E2E] p-4 rounded-md border border-gray-700/50 md:col-span-2">
                            <h3 className="text-sm font-semibold mb-1">Peak Hour</h3>
                            <p className="text-xl font-bold">{peakHour}:00</p>
                        </div>

                        <div className="bg-[#1C1E2E] p-4 rounded-md border border-gray-700/50 md:col-span-4">
                            <h3 className="text-sm font-semibold mb-1">Predicted Cases Next 7 Days</h3>
                            <p className="text-xl font-bold">{predictedNext7DaysTotal}</p>
                        </div>

                    </div>
                )}

                {loading ? (
                    <p>Loading analytics...</p>
                ) : reports.length === 0 ? (
                    <p className="text-gray-400 text-center">No reports available for analytics.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Overall Crimes by Barangay - Full Width */}
                        <div className="bg-[#1C1E2E] p-4 rounded-md border border-gray-700/50 md:col-span-3 lg:col-span-3">
                            <h2 className="text-sm font-semibold mb-2">Overall Crimes by Barangay</h2>
                            <Bar
                                data={barangayBarChartData}
                                options={{
                                    responsive: true,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: { beginAtZero: true },
                                    },
                                }}
                            />
                        </div>

                        {/*9. Cases by Hour */}
                        <div className="bg-[#1C1E2E] p-4 rounded-md border border-gray-700/50">
                            <h2 className="text-sm font-semibold mb-2">Cases by Hour</h2>
                            <Bar data={casesByHourData} options={{ ...options, scales: { y: { beginAtZero: true } } }} />
                        </div>

                        {/*10. Cases by Day of Week */}
                        <div className="bg-[#1C1E2E] p-4 rounded-md border border-gray-700/50">
                            <h2 className="text-sm font-semibold mb-2">Cases by Day of Week</h2>
                            <Bar data={casesByDayData} options={{ ...options, scales: { y: { beginAtZero: true } } }} />
                        </div>

                        {/*11. Cases by Month */}
                        <div className="bg-[#1C1E2E] p-4 rounded-md border border-gray-700/50">
                            <h2 className="text-sm font-semibold mb-2">Cases by Month</h2>
                            <Line data={casesByMonthData} options={options} />
                        </div>

                        {/* 9. Predicted Cases Next 7 Days */}
                        <div className="bg-[#1C1E2E] p-4 rounded-md border border-gray-700/50 md:col-span-3 lg:col-span-3">
                            <h2 className="text-sm font-semibold mb-2">Predicted Cases Next 7 Days</h2>
                            <Line data={predictedLineData} options={options} />
                        </div>


                        {/* 1. Cases by Status */}
                        <div className="bg-[#1C1E2E] p-4 rounded-md border border-gray-700/50">
                            <h2 className="text-sm font-semibold mb-2">Cases by Status</h2>
                            <Doughnut data={getDonutData(statusCounts)} options={options} />
                        </div>

                        {/* 2. Cases by Barangay */}
                        <div className="bg-[#1C1E2E] p-4 rounded-md border border-gray-700/50">
                            <h2 className="text-sm font-semibold mb-2">Cases by Barangay</h2>
                            <Bar data={getBarData(barangayCounts)} options={options} />
                        </div>

                        {/* 3. Cases by Offense */}
                        <div className="bg-[#1C1E2E] p-4 rounded-md border border-gray-700/50">
                            <h2 className="text-sm font-semibold mb-2">Cases by Offense</h2>
                            <Bar data={getBarData(offenseCounts)} options={options} />
                        </div>

                        {/* 4. Cases Over Time */}
                        <div className="bg-[#1C1E2E] p-4 rounded-md border border-gray-700/50">
                            <h2 className="text-sm font-semibold mb-2">Cases Over Time</h2>
                            <Line data={getLineData(casesOverTimeCounts)} options={options} />
                        </div>

                        {/* 5. Cases by Mode of Reporting */}
                        <div className="bg-[#1C1E2E] p-4 rounded-md border border-gray-700/50">
                            <h2 className="text-sm font-semibold mb-2">Cases by Mode of Reporting</h2>
                            <Doughnut data={getDonutData(modeCounts)} options={options} />
                        </div>

                        {/* 6. Cases by Stage of Felony */}
                        <div className="bg-[#1C1E2E] p-4 rounded-md border border-gray-700/50">
                            <h2 className="text-sm font-semibold mb-2">Cases by Stage of Felony</h2>
                            <Doughnut data={getDonutData(felonyStageCounts)} options={options} />
                        </div>

                        {/* 7. Cases by Suspect Status */}
                        <div className="bg-[#1C1E2E] p-4 rounded-md border border-gray-700/50">
                            <h2 className="text-sm font-semibold mb-2">Cases by Suspect Status</h2>
                            <Doughnut data={getDonutData(suspectStatusCounts)} options={options} />
                        </div>

                        {/* 8. Cases by Type of Place */}
                        <div className="bg-[#1C1E2E] p-4 rounded-md border border-gray-700/50">
                            <h2 className="text-sm font-semibold mb-2">Cases by Type of Place</h2>
                            <Bar data={getBarData(typeOfPlaceCounts)} options={options} />
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsPage;
