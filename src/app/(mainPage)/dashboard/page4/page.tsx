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

    // ----- Time Insights -----
    const timeBuckets = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
    const hourCounts: Record<string, number> = {};
    const crimeTimeCounts: Record<string, Record<string, number>> = {};

    reports.forEach((r) => {
        if (r.time) {
            const [hourStr] = r.time.split(":");
            const hour = parseInt(hourStr, 10);

            // bucket classification
            if (hour >= 5 && hour < 12) timeBuckets.Morning++;
            else if (hour >= 12 && hour < 17) timeBuckets.Afternoon++;
            else if (hour >= 17 && hour < 21) timeBuckets.Evening++;
            else timeBuckets.Night++;

            // count by exact hour
            const label = new Date(0, 0, 0, hour).toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
            hourCounts[label] = (hourCounts[label] || 0) + 1;

            // count per crime per hour
            if (!crimeTimeCounts[r.crime]) crimeTimeCounts[r.crime] = {};
            crimeTimeCounts[r.crime][label] = (crimeTimeCounts[r.crime][label] || 0) + 1;
        }
    });

    const timeData = Object.entries(timeBuckets).map(([name, value]) => ({ name, value }));
    const hourData = Object.entries(hourCounts).map(([hour, value]) => ({ hour, value }));

    const dayCounts = reports.reduce<Record<string, number>>((acc, r) => {
        const day = new Date(r.date).toLocaleDateString("en-US", { weekday: "long" });
        acc[day] = (acc[day] || 0) + 1;
        return acc;
    }, {});
    const dayData = Object.entries(dayCounts).map(([name, value]) => ({ name, value }));

    // ----- Predictions -----
    const last7 = lineData.slice(-7);
    const avgLast7 = last7.reduce((sum, d) => sum + d.count, 0) / (last7.length || 1);
    const forecastData = Array.from({ length: 7 }).map((_, i) => ({
        date: `Day +${i + 1}`,
        predicted: Math.round(avgLast7 + Math.random() * 2 - 1),
    }));

    // Crime vs Status correlation
    const crimeStatusCounts: Record<string, { Solved: number; Unsolved: number; Pending: number }> = {};
    reports.forEach(r => {
        if (!crimeStatusCounts[r.crime]) {
            crimeStatusCounts[r.crime] = { Solved: 0, Unsolved: 0, Pending: 0 };
        }
        crimeStatusCounts[r.crime][r.status as keyof typeof crimeStatusCounts[string]]++;
    });
    const crimeStatusData = Object.entries(crimeStatusCounts).map(([crime, counts]) => ({
        crime,
        ...counts,
    }));

    // Quick Stats
    const totalReports = reports.length;
    const topCrime = crimeData.sort((a, b) => b.value - a.value)[0]?.name || "N/A";
    const topBarangay = barangayData.sort((a, b) => b.value - a.value)[0]?.name || "N/A";
    const peakHour = hourData.sort((a, b) => b.value - a.value)[0]?.hour || "N/A";

    // Crime-specific peak times
    const crimePeakTimes = Object.entries(crimeTimeCounts).map(([crime, hours]) => {
        const sorted = Object.entries(hours).sort((a, b) => b[1] - a[1]);
        return { crime, peakHour: sorted[0]?.[0] || "N/A", count: sorted[0]?.[1] || 0 };
    });

    // --- Top 5 Crimes by Hour ---
    const crimeHourData: Record<string, Record<string, number>> = {};
    reports.forEach(r => {
        if (r.time) {
            const [hourStr] = r.time.split(":");
            const hour = parseInt(hourStr, 10);
            const label = new Date(0, 0, 0, hour).toLocaleTimeString("en-US", { hour: "numeric", hour12: true });

            if (!crimeHourData[label]) crimeHourData[label] = {};
            crimeHourData[label][r.crime] = (crimeHourData[label][r.crime] || 0) + 1;
        }
    });

    const topCrimesByHour = Object.entries(crimeHourData).map(([hour, crimes]) => {
        const sorted = Object.entries(crimes).sort((a, b) => b[1] - a[1]).slice(0, 5);
        return { hour, crimes: sorted };
    });

    // ----- Day of Week Analysis -----
    const weekdayCounts = reports.reduce<Record<string, number>>((acc, r) => {
        const weekday = new Date(r.date).toLocaleDateString("en-US", { weekday: "long" });
        acc[weekday] = (acc[weekday] || 0) + 1;
        return acc;
    }, {});
    const weekdayData = Object.entries(weekdayCounts).map(([day, value]) => ({ day, value }));

    // ----- Top 3 Crimes per Barangay -----
    const barangayCrimeBreakdown: Record<string, Record<string, number>> = {};
    reports.forEach(r => {
        if (!barangayCrimeBreakdown[r.barangay]) barangayCrimeBreakdown[r.barangay] = {};
        barangayCrimeBreakdown[r.barangay][r.crime] = (barangayCrimeBreakdown[r.barangay][r.crime] || 0) + 1;
    });
    const topCrimesPerBarangay = Object.entries(barangayCrimeBreakdown).map(([barangay, crimes]) => {
        const sorted = Object.entries(crimes).sort((a, b) => b[1] - a[1]).slice(0, 3);
        return { barangay, topCrimes: sorted };
    });

    // ----- Repeat Crimes in Last 7 Days -----
    const last7Reports = reports.filter(r => {
        const diffDays = (Date.now() - new Date(r.date).getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
    });
    const recentCrimeCounts: Record<string, Record<string, number>> = {};
    last7Reports.forEach(r => {
        if (!recentCrimeCounts[r.barangay]) recentCrimeCounts[r.barangay] = {};
        recentCrimeCounts[r.barangay][r.crime] = (recentCrimeCounts[r.barangay][r.crime] || 0) + 1;
    });
    const repeatCrimes = Object.entries(recentCrimeCounts).map(([barangay, crimes]) => {
        const repeats = Object.entries(crimes).filter(([_, count]) => count > 1);
        return { barangay, repeats };
    }).filter(b => b.repeats.length > 0);

    // ----- Avg Resolution Time (if resolvedAt exists) -----
    const resolutionTimes: Record<string, number[]> = {};
    reports.forEach(r => {
        if (r.status === "Solved" && r.resolvedAt) {
            const diff = (new Date(r.resolvedAt).getTime() - new Date(r.date).getTime()) / (1000 * 60 * 60 * 24);
            if (!resolutionTimes[r.crime]) resolutionTimes[r.crime] = [];
            resolutionTimes[r.crime].push(diff);
        }
    });
    const avgResolution = Object.entries(resolutionTimes).map(([crime, times]) => ({
        crime,
        avgDays: (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1),
    }));

    // ----- Crime Growth (Month-over-Month) -----
    const monthCrimeCounts: Record<string, Record<string, number>> = {};
    reports.forEach(r => {
        const month = new Date(r.date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
        if (!monthCrimeCounts[month]) monthCrimeCounts[month] = {};
        monthCrimeCounts[month][r.crime] = (monthCrimeCounts[month][r.crime] || 0) + 1;
    });
    const months = Object.keys(monthCrimeCounts).sort();
    const lastTwo = months.slice(-2);
    let crimeGrowth: { crime: string; change: number }[] = [];
    if (lastTwo.length === 2) {
        const [prev, curr] = lastTwo;
        const prevCrimes = monthCrimeCounts[prev];
        const currCrimes = monthCrimeCounts[curr];
        crimeGrowth = Object.keys({ ...prevCrimes, ...currCrimes }).map(crime => {
            const prevVal = prevCrimes[crime] || 0;
            const currVal = currCrimes[crime] || 0;
            const change = prevVal === 0 ? (currVal > 0 ? 100 : 0) : ((currVal - prevVal) / prevVal) * 100;
            return { crime, change: Math.round(change) };
        });
    }



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
                    <p className="text-lg font-semibold">{peakHour}</p>
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
                    <h2 className="text-sm font-semibold mb-2">Crimes by Time of Day (Buckets)</h2>
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

                {/* Crimes per Hour */}
                <div className="bg-[#1C1E2E] p-4 rounded-lg shadow">
                    <h2 className="text-sm font-semibold mb-2">Crimes by Hour</h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={hourData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" interval={0} angle={-30} textAnchor="end" height={60} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3B82F6" />
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

                {/* 🔮 Forecast Next 7 Days */}
                <div className="bg-[#1C1E2E] p-4 rounded-lg shadow col-span-1 md:col-span-2">
                    <h2 className="text-sm font-semibold mb-2">Predicted Reports (Next 7 Days)</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={forecastData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="predicted" stroke="#8B5CF6" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* 🔗 Crime vs Status Correlation */}
                <div className="bg-[#1C1E2E] p-4 rounded-lg shadow col-span-1 md:col-span-2 lg:col-span-3">
                    <h2 className="text-sm font-semibold mb-2">Crime vs Case Status</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={crimeStatusData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="crime" interval={0} angle={-30} textAnchor="end" height={60} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Solved" fill="#22C55E" />
                            <Bar dataKey="Unsolved" fill="#EF4444" />
                            <Bar dataKey="Pending" fill="#FACC15" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* ⏰ Crime-specific Peak Times */}
                <div className="bg-[#1C1E2E] p-4 rounded-lg shadow col-span-1 md:col-span-2 lg:col-span-3">
                    <h2 className="text-sm font-semibold mb-2">Crime-specific Peak Times</h2>
                    <ul className="text-sm space-y-1">
                        {crimePeakTimes.map((c, idx) => (
                            <li key={idx}>
                                <span className="font-semibold text-gray-200">{c.crime}</span> → {c.peakHour} ({c.count} cases)
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ⏱️ Top 5 Crimes per Hour */}
                <div className="bg-[#1C1E2E] p-4 rounded-lg shadow col-span-1 md:col-span-2 lg:col-span-3">
                    <h2 className="text-sm font-semibold mb-2">Top 5 Crimes per Hour</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {topCrimesByHour.map((h, idx) => (
                            <div key={idx}>
                                <p className="font-semibold text-gray-300">{h.hour}</p>
                                <ul className="pl-2 list-disc">
                                    {h.crimes.map(([crime, count], i) => (
                                        <li key={i}>{crime} ({count})</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 📆 Crimes by Day of Week */}
                <div className="bg-[#1C1E2E] p-4 rounded-lg shadow">
                    <h2 className="text-sm font-semibold mb-2">Crimes by Day of Week</h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={weekdayData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#14B8A6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 🏘 Top Crimes per Barangay */}
                <div className="bg-[#1C1E2E] p-4 rounded-lg shadow col-span-1 md:col-span-2 lg:col-span-3">
                    <h2 className="text-sm font-semibold mb-2">Top Crimes per Barangay</h2>
                    <ul className="text-sm space-y-2">
                        {topCrimesPerBarangay.map((b, idx) => (
                            <li key={idx}>
                                <span className="font-semibold">{b.barangay}:</span>{" "}
                                {b.topCrimes.map(([crime, count]) => `${crime} (${count})`).join(", ")}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 🔁 Repeat Crimes in Last 7 Days */}
                <div className="bg-[#1C1E2E] p-4 rounded-lg shadow">
                    <h2 className="text-sm font-semibold mb-2">Repeat Crimes (Last 7 Days)</h2>
                    <ul className="text-sm space-y-2">
                        {repeatCrimes.map((b, idx) => (
                            <li key={idx}>
                                <span className="font-semibold">{b.barangay}:</span>{" "}
                                {b.repeats.map(([crime, count]) => `${crime} (${count})`).join(", ")}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ⏳ Avg Resolution Time */}
                <div className="bg-[#1C1E2E] p-4 rounded-lg shadow">
                    <h2 className="text-sm font-semibold mb-2">Avg Resolution Time</h2>
                    <ul className="text-sm space-y-1">
                        {avgResolution.map((c, idx) => (
                            <li key={idx}>{c.crime} → {c.avgDays} days</li>
                        ))}
                    </ul>
                </div>

                {/* 📈 Crime Growth (MoM) */}
                <div className="bg-[#1C1E2E] p-4 rounded-lg shadow">
                    <h2 className="text-sm font-semibold mb-2">Crime Growth (Month-over-Month)</h2>
                    <ul className="text-sm space-y-1">
                        {crimeGrowth.map((c, idx) => (
                            <li key={idx}>
                                {c.crime} → {c.change > 0 ? `↑ ${c.change}%` : c.change < 0 ? `↓ ${Math.abs(c.change)}%` : "No change"}
                            </li>
                        ))}
                    </ul>
                </div>


            </div>
        </div>
    );
};

export default AnalyticsPage;
