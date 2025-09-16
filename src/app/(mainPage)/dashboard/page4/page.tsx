"use client";

import React, { useEffect, useState } from "react";
import {
    PieChart, Pie, Cell,
    BarChart, Bar,
    XAxis, YAxis, Tooltip,
    ResponsiveContainer, LineChart, Line,
    CartesianGrid, Legend
} from "recharts";
import useReportStore from "@/utils/zustand/ReportStore";

const COLORS = ["#EF4444", "#FACC15", "#22C55E"]; // red, yellow, green

const AnalyticsPage = () => {
    const { getReports } = useReportStore();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReports() {
            setLoading(true);
            const data = await getReports();
            if (data?.reports) {
                setReports(data.reports);
            }
            setLoading(false);
        }
        fetchReports();
    }, [getReports]);

    if (loading) {
        return <p className="text-center text-gray-400 mt-10">Loading analytics...</p>;
    }

    // ----- Prepare Data -----
    const statusCounts = [
        { name: "Solved", value: reports.filter(r => r.status === "Solved").length },
        { name: "Unsolved", value: reports.filter(r => r.status === "Unsolved").length },
        { name: "Pending", value: reports.filter(r => r.status === "Pending").length },
    ];

    const barangayCounts = reports.reduce<Record<string, number>>((acc, r) => {
        acc[r.barangay] = (acc[r.barangay] || 0) + 1;
        return acc;
    }, {});
    const barangayData = Object.entries(barangayCounts).map(([name, value]) => ({ name, value }));

    const crimeCounts = reports.reduce<Record<string, number>>((acc, r) => {
        acc[r.crime] = (acc[r.crime] || 0) + 1;
        return acc;
    }, {});
    const crimeData = Object.entries(crimeCounts).map(([name, value]) => ({ name, value }));

    const trendData = reports.map((r) => ({
        date: new Date(r.createdAt).toLocaleDateString(),
        count: 1,
    }));
    const aggregated = trendData.reduce<Record<string, number>>((acc, r) => {
        acc[r.date] = (acc[r.date] || 0) + 1;
        return acc;
    }, {});
    const lineData = Object.entries(aggregated).map(([date, count]) => ({ date, count }));

    // ----- NEW: Time & Day Insights -----
    const timeBuckets = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
    reports.forEach((r) => {
        if (r.time) {
            const [hourStr] = r.time.split(":");
            const hour = parseInt(hourStr, 10);
            if (hour >= 5 && hour < 12) timeBuckets.Morning++;
            else if (hour >= 12 && hour < 17) timeBuckets.Afternoon++;
            else if (hour >= 17 && hour < 21) timeBuckets.Evening++;
            else timeBuckets.Night++;
        }
    });
    const timeData = Object.entries(timeBuckets).map(([name, value]) => ({ name, value }));

    const dayCounts = reports.reduce<Record<string, number>>((acc, r) => {
        const day = new Date(r.date).toLocaleDateString("en-US", { weekday: "long" });
        acc[day] = (acc[day] || 0) + 1;
        return acc;
    }, {});
    const dayData = Object.entries(dayCounts).map(([name, value]) => ({ name, value }));

    // Quick Stats
    const totalReports = reports.length;
    const topCrime = crimeData.sort((a, b) => b.value - a.value)[0]?.name || "N/A";
    const topBarangay = barangayData.sort((a, b) => b.value - a.value)[0]?.name || "N/A";
    const peakTime = timeData.sort((a, b) => b.value - a.value)[0]?.name || "N/A";

    // ----- UI -----
    return (
        <div className="min-h-screen bg-[#0F1120] text-white p-4">
            <h1 className="text-2xl font-bold mb-4">📊 Crime Analytics Dashboard</h1>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#1C1E2E] p-4 rounded-lg text-center">
                    <p className="text-gray-400 text-sm">Total Reports</p>
                    <p className="text-xl font-bold">{totalReports}</p>
                </div>
                <div className="bg-[#1C1E2E] p-4 rounded-lg text-center">
                    <p className="text-gray-400 text-sm">Most Common Crime</p>
                    <p className="text-lg font-semibold">{topCrime}</p>
                </div>
                <div className="bg-[#1C1E2E] p-4 rounded-lg text-center">
                    <p className="text-gray-400 text-sm">Hotspot Barangay</p>
                    <p className="text-lg font-semibold">{topBarangay}</p>
                </div>
                <div className="bg-[#1C1E2E] p-4 rounded-lg text-center">
                    <p className="text-gray-400 text-sm">Peak Time</p>
                    <p className="text-lg font-semibold">{peakTime}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Status Pie Chart */}
                <div className="bg-[#1C1E2E] p-4 rounded-lg shadow">
                    <h2 className="text-sm font-semibold mb-2">Case Status</h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={statusCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                                {statusCounts.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Reports Over Time */}
                <div className="bg-[#1C1E2E] p-4 rounded-lg shadow">
                    <h2 className="text-sm font-semibold mb-2">Reports Over Time</h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={lineData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" hide />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Time of Day */}
                <div className="bg-[#1C1E2E] p-4 rounded-lg shadow">
                    <h2 className="text-sm font-semibold mb-2">Crimes by Time of Day</h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={timeData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#10B981" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Crimes per Barangay */}
                <div className="bg-[#1C1E2E] p-4 rounded-lg shadow col-span-1 md:col-span-2">
                    <h2 className="text-sm font-semibold mb-2">Crimes per Barangay</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={barangayData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" hide />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#F59E0B" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Crimes Breakdown */}
                <div className="bg-[#1C1E2E] p-4 rounded-lg shadow col-span-1 md:col-span-2 lg:col-span-3">
                    <h2 className="text-sm font-semibold mb-2">Crimes Breakdown</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={crimeData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={60} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#EF4444" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
