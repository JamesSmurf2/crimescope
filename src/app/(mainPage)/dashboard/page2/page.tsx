"use client";

import React, { useState, useEffect } from "react";
import useReportStore from "@/utils/zustand/ReportStore";
import useAuthStore from "@/utils/zustand/useAuthStore";
import { useRouter } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';


const ReportsPage = () => {
    const router = useRouter()

    // -------------------- Data Lists --------------------
    const barangays = [
        "Almanza Dos", "Almanza Uno", "B.F. CAA International Village", "Daniel Fajardo",
        "Elias Aldana", "Ilaya", "Manuyo Uno", "Manuyo Dos", "Pamplona Uno", "Pamplona Dos",
        "Pamplona Tres", "Pilar", "Pulang Lupa Uno", "Pulang Lupa Dos", "Talon Uno",
        "Talon Dos", "Talon Tres", "Talon Cuatro", "Talon Singko", "Zapote",
    ];

    const offenseCategories = [
        {
            label: "🚨 Index Crimes",
            color: "text-red-400 font-semibold",
            offenses: [
                "Murder",
                "Homicide",
                "Rape",
                "Physical Injury",
                "Robbery",
                "Theft",
                "Carnapping",
                "Cattle Rustling",
            ],
        },
        {
            label: "⚖️ Non-Index Crimes",
            color: "text-yellow-400 font-semibold",
            offenses: [
                "Drug Offense",
                "Illegal Firearms",
                "Child Abuse",
                "Cybercrime",
                "Estafa",
                "Direct Assault",          // RPC Art. 148
                "Grave Threats",           // RPC Art. 282
                "Other Forms of Trespass", // RPC Art. 281
                "Violence Against Women & Children (VAWC)",
                "Illegal Logging",
            ],
        },
        {
            label: "🚗 Traffic Violations",
            color: "text-blue-400 font-semibold",
            offenses: [
                "Reckless Driving",
                "Illegal Parking",
                "Overspeeding",
                "Driving Without License",
                "Road Accident",
            ],
        },
        {
            label: "📜 Ordinance Violations",
            color: "text-gray-400 font-semibold",
            offenses: [
                "Curfew Violation",
                "Public Disturbance",
                "Littering",
                "Noise Complaint",
                "Illegal Vending",
                "Drinking in Public",
                "Alarms and Scandals",  // RPC Art. 155
                "Unjust Vexations",     // RPC Art. 287
                "Light Threats",        // RPC Art. 283
                "Malicious Mischief",   // RPC Art. 327
            ],
        },
    ];


    // -------------------- Component --------------------

    const { getReports, changeReportStatus } = useReportStore();
    const [reports, setReports] = useState<any[]>([]);
    const [filteredReports, setFilteredReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [editMode, setEditMode] = useState(false);

    const [selectedReport, setSelectedReport] = useState<any | null>(null);
    const [originalReport, setOriginalReport] = useState<any | null>(null); // 

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




    const [filters, setFilters] = useState({
        search: "",
        offense: "",
        barangay: "",
        status: "",
        startDate: "",  // ADD THIS
        endDate: "",    // ADD THIS
    });



    // ✅ Fetch reports
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

    // ✅ Filtering
    useEffect(() => {
        let filtered = [...reports];

        if (filters.offense)
            filtered = filtered.filter(
                (r) => r.offense?.toLowerCase() === filters.offense.toLowerCase()
            );

        if (filters.barangay)
            filtered = filtered.filter(
                (r) => r.barangay?.toLowerCase() === filters.barangay.toLowerCase()
            );

        if (filters.status)
            filtered = filtered.filter(
                (r) => r.status?.toLowerCase() === filters.status.toLowerCase()
            );

        if (filters.search.trim()) {
            const s = filters.search.toLowerCase();
            filtered = filtered.filter(
                (r) =>
                    r.victim?.name?.toLowerCase().includes(s) ||
                    r.suspect?.name?.toLowerCase().includes(s) ||
                    r.offense?.toLowerCase().includes(s) ||
                    r.blotterNo?.toLowerCase().includes(s)
            );
        }

        // Add this AFTER the status filter and BEFORE the search filter:
        if (filters.startDate) {
            filtered = filtered.filter((r) => {
                const reportDate = new Date(r.dateCommitted);
                const start = new Date(filters.startDate);
                return reportDate >= start;
            });
        }

        if (filters.endDate) {
            filtered = filtered.filter((r) => {
                const reportDate = new Date(r.dateCommitted);
                const end = new Date(filters.endDate);
                end.setHours(23, 59, 59, 999); // Include the entire end date
                return reportDate <= end;
            });
        }

        setFilteredReports(filtered);
    }, [filters, reports]);

    const totalReports = filteredReports.length;
    const solvedCount = filteredReports.filter(
        (r) => r.status?.toLowerCase() === "solved"
    ).length;
    const unsolvedCount = filteredReports.filter(
        (r) => r.status?.toLowerCase() === "unsolved"
    ).length;
    const clearedCount = filteredReports.filter(
        (r) => r.status?.toLowerCase() === "cleared"
    ).length;

    const handleFilterChange = (e: any) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const resetFilters = () =>
        setFilters({ search: "", offense: "", barangay: "", status: "", startDate: "", endDate: "" });


    const handlePrint = () => {
        if (!selectedReport) return;

        const win = window.open("", "_blank");
        win?.document.write(`
          <html>
            <head>
              <title>Crime Report - ${selectedReport.blotterNo}</title>
              <style>
                body {
                  font-family: "Segoe UI", Arial, sans-serif;
                  margin: 40px;
                  background: #fff;
                  color: #222;
                  line-height: 1.6;
                }
    
                header {
                  text-align: center;
                  border-bottom: 2px solid #000;
                  padding-bottom: 10px;
                  margin-bottom: 25px;
                }
    
                header h1 {
                  font-size: 24px;
                  margin: 0;
                  letter-spacing: 1px;
                  text-transform: uppercase;
                }
    
                header h2 {
                  font-size: 18px;
                  margin-top: 5px;
                  color: #555;
                }
    
                section {
                  margin-bottom: 20px;
                }
    
                h3 {
                  border-bottom: 1px solid #ccc;
                  padding-bottom: 5px;
                  margin-bottom: 10px;
                  color: #111;
                  text-transform: uppercase;
                  font-size: 15px;
                }
    
                p {
                  margin: 4px 0;
                }
    
                .details-table {
                  width: 100%;
                  border-collapse: collapse;
                }
    
                .details-table td {
                  padding: 5px 10px;
                  vertical-align: top;
                }
    
                .details-table td.label {
                  font-weight: bold;
                  width: 180px;
                }
    
                footer {
                  border-top: 2px solid #000;
                  margin-top: 30px;
                  padding-top: 10px;
                  text-align: center;
                  font-size: 13px;
                  color: #555;
                }
    
                @media print {
                  body {
                    margin: 20px;
                  }
                }
              </style>
            </head>
            <body>
              <header>
                <h1>Barangay Crime Report</h1>
                <h2>Official Police Record</h2>
              </header>
    
              <section>
                <h3>General Information</h3>
                <table class="details-table">
                  <tr><td class="label">Blotter No:</td><td>${selectedReport.blotterNo}</td></tr>
                  <tr><td class="label">Barangay:</td><td>${selectedReport.barangay}</td></tr>
                  <tr><td class="label">Offense:</td><td>${selectedReport.offense}</td></tr>
                  <tr><td class="label">Status:</td><td>${selectedReport.status}</td></tr>
                  <tr><td class="label">Stage of Felony:</td><td>${selectedReport.stageOfFelony}</td></tr>
                  <tr><td class="label">Mode of Reporting:</td><td>${selectedReport.modeOfReporting}</td></tr>
                  <tr><td class="label">Mode of Reporting:</td><td>${selectedReport.modeOfReporting}</td></tr>
                  <tr><td class="label">CCTV Available:</td><td>${selectedReport.cctvAvailable || 'Unknown'}</td></tr>  // ADD THIS LINE
                  <tr><td class="label">Date Reported:</td><td>${selectedReport.dateReported}</td></tr>
                  <tr><td class="label">Date Reported:</td><td>${selectedReport.dateReported}</td></tr>
                  <tr><td class="label">Date Committed:</td><td>${selectedReport.dateCommitted}</td></tr>
                  <tr><td class="label">Type of Place:</td><td>${selectedReport.typeOfPlace}</td></tr>
                  <tr><td class="label">Street:</td><td>${selectedReport.street}</td></tr>
                </table>
              </section>
    
              <section>
                <h3>Victim Information</h3>
                <table class="details-table">
                  <tr><td class="label">Name:</td><td>${selectedReport.victim?.name}</td></tr>
                  <tr><td class="label">Age:</td><td>${selectedReport.victim?.age}</td></tr>
                  <tr><td class="label">Gender:</td><td>${selectedReport.victim?.gender}</td></tr>
                  <tr><td class="label">Harmed:</td><td>${selectedReport.victim?.harmed}</td></tr>
                  <tr><td class="label">Nationality:</td><td>${selectedReport.victim?.nationality}</td></tr>
                  <tr><td class="label">Occupation:</td><td>${selectedReport.victim?.occupation}</td></tr>
                </table>
              </section>
    
              <section>
                <h3>Suspect Information</h3>
                <table class="details-table">
                  <tr><td class="label">Name:</td><td>${selectedReport.suspect?.name}</td></tr>
                  <tr><td class="label">Age:</td><td>${selectedReport.suspect?.age}</td></tr>
                  <tr><td class="label">Gender:</td><td>${selectedReport.suspect?.gender}</td></tr>
                  <tr><td class="label">Status:</td><td>${selectedReport.suspect?.status}</td></tr>
                  <tr><td class="label">Nationality:</td><td>${selectedReport.suspect?.nationality}</td></tr>
                  <tr><td class="label">Occupation:</td><td>${selectedReport.suspect?.occupation}</td></tr>
                  ${selectedReport.suspectMotive
                ? `<tr><td class="label">Motive:</td><td>${selectedReport.suspectMotive}</td></tr>`
                : ""
            }
                </table>
              </section>
    
              ${selectedReport.narrative
                ? `
                  <section>
                    <h3>Narrative</h3>
                    <p style="white-space: pre-line;">${selectedReport.narrative}</p>
                  </section>`
                : ""
            }
    
              <section>
                <h3>Location</h3>
                <p><b>Coordinates:</b> Lat ${selectedReport.location?.coordinates?.[1]}, Lng ${selectedReport.location?.coordinates?.[0]}</p>
              </section>
    
              <footer>
                <p>Generated by Barangay Crime Analytics System</p>
                <p>${new Date().toLocaleString()}</p>
              </footer>
            </body>
          </html>
        `);

        win?.document.close();
        win?.print();
    };

    const handleChange = async () => {  // Remove selectedReport parameter
        console.log("Original:", originalReport);
        console.log("Edited:", selectedReport);

        // Pass both original and edited data
        const error = await changeReportStatus(originalReport, selectedReport);  // ✅ Pass as two separate arguments

        if (error?.data?.error) {
            toast.error(error?.data?.error);
        } else {
            toast.success(`Report Successfully Updated.`);

            setReports((prevReports) =>
                prevReports.map((report) =>
                    report._id === selectedReport._id ? selectedReport : report
                )
            );

            setEditMode(false);
            setOriginalReport(null); // Reset original
            setSelectedReport(selectedReport)
        }
    };

    return (

        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid #334155',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            <div className="max-w-7xl mx-auto space-y-8">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                        Crime Reports Dashboard
                    </h1>
                    <p className="text-gray-400 text-sm font-light">Comprehensive view of all barangay crime incidents</p>


                    {authUser?.role === 'admin' && (
                        <div className="mt-4 bg-red-500/10 border border-red-500/50 rounded-lg p-4 max-w-2xl mx-auto">
                            <p className="text-red-400 font-semibold text-sm">
                                ⚠️ Only official can edit reports. You are using admin
                            </p>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Filters & Search</h2>
                    <div className="flex flex-wrap gap-3 items-center">
                        <input
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Search by victim, suspect, offense..."
                            className="bg-slate-900/70 border border-slate-700/50 hover:border-slate-600/70 focus:border-cyan-400/50 focus:outline-none px-4 py-2 rounded-lg text-sm w-80 text-gray-200 placeholder-gray-500 transition-all"
                        />
                        <input
                            name="offense"
                            value={filters.offense}
                            onChange={handleFilterChange}
                            placeholder="Offense type..."
                            className="bg-slate-900/70 border border-slate-700/50 hover:border-slate-600/70 focus:border-cyan-400/50 focus:outline-none px-4 py-2 rounded-lg text-sm text-gray-200 placeholder-gray-500 transition-all"
                        />
                        <select
                            name="barangay"
                            value={filters.barangay}
                            onChange={handleFilterChange}
                            className="bg-slate-900/70 border border-slate-700/50 hover:border-slate-600/70 focus:border-cyan-400/50 focus:outline-none px-4 py-2 rounded-lg text-sm text-gray-200 transition-all cursor-pointer"
                        >
                            <option value="">All Barangays</option>
                            {barangays.map((b, i) => (
                                <option key={i} value={b} className="bg-slate-800">
                                    {b}
                                </option>
                            ))}
                        </select>

                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="bg-slate-900/70 border border-slate-700/50 hover:border-slate-600/70 focus:border-cyan-400/50 focus:outline-none px-4 py-2 rounded-lg text-sm text-gray-200 transition-all cursor-pointer"
                        >
                            <option value="">All Status</option>
                            <option value="Solved" className="bg-slate-800">Solved</option>
                            <option value="Unsolved" className="bg-slate-800">Unsolved</option>
                            <option value="Cleared" className="bg-slate-800">Cleared</option>
                        </select>
                        
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="bg-slate-900/70 border border-slate-700/50 hover:border-slate-600/70 focus:border-cyan-400/50 focus:outline-none px-4 py-2 rounded-lg text-sm text-gray-200 transition-all"
                            placeholder="Start Date"
                        />

                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="bg-slate-900/70 border border-slate-700/50 hover:border-slate-600/70 focus:border-cyan-400/50 focus:outline-none px-4 py-2 rounded-lg text-sm text-gray-200 transition-all"
                            placeholder="End Date"
                        />

                        <button
                            onClick={resetFilters}
                            className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 px-5 py-2 rounded-lg text-sm font-medium text-white transition-all shadow-md hover:shadow-lg"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-5 space-y-2 hover:border-blue-400/60 transition-all">
                        <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Total Reports</p>
                        <p className="text-3xl font-black text-blue-300">{totalReports}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-5 space-y-2 hover:border-emerald-400/60 transition-all">
                        <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Solved Cases</p>
                        <p className="text-3xl font-black text-emerald-300">{solvedCount}</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-xl p-5 space-y-2 hover:border-red-400/60 transition-all">
                        <p className="text-xs font-semibold text-red-300 uppercase tracking-wider">Unsolved Cases</p>
                        <p className="text-3xl font-black text-red-300">{unsolvedCount}</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-xl p-5 space-y-2 hover:border-amber-400/60 transition-all">
                        <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Cleared Cases</p>
                        <p className="text-3xl font-black text-amber-300">{clearedCount}</p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Loading reports...</div>
                    ) : filteredReports.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">No reports found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-700/50 bg-slate-900/60">
                                        <th className="p-4 text-left font-semibold text-gray-300 text-xs uppercase tracking-wider">Blotter No</th>
                                        <th className="p-4 text-left font-semibold text-gray-300 text-xs uppercase tracking-wider">Offense</th>
                                        <th className="p-4 text-left font-semibold text-gray-300 text-xs uppercase tracking-wider">Barangay</th>
                                        <th className="p-4 text-left font-semibold text-gray-300 text-xs uppercase tracking-wider">Victim</th>
                                        <th className="p-4 text-left font-semibold text-gray-300 text-xs uppercase tracking-wider">Suspect</th>
                                        <th className="p-4 text-left font-semibold text-gray-300 text-xs uppercase tracking-wider">Status</th>
                                        <th className="p-4 text-left font-semibold text-gray-300 text-xs uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReports.map((r, i) => (
                                        <tr key={r._id || i} className="border-b border-slate-700/30 hover:bg-slate-900/40 transition-all">
                                            <td className="p-4 text-gray-300 font-medium">{r.blotterNo}</td>
                                            <td className="p-4 text-gray-400 text-sm">{r.offense}</td>
                                            <td className="p-4 text-gray-400 text-sm">{r.barangay}</td>
                                            <td className="p-4 text-gray-400 text-sm">{r.victim?.name}</td>
                                            <td className="p-4 text-gray-400 text-sm max-w-xs truncate">{r.suspect?.name}</td>
                                            <td className="p-4">
                                                {r.status === "Solved" && <span className="inline-block bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/30">Solved</span>}
                                                {r.status === "Unsolved" && <span className="inline-block bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-semibold border border-red-500/30">Unsolved</span>}
                                                {r.status === "Cleared" && <span className="inline-block bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold border border-amber-500/30">Cleared</span>}
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => {
                                                        setSelectedReport(r);
                                                        setOriginalReport(JSON.parse(JSON.stringify(r))); // Deep copy original data
                                                    }}
                                                    className="bg-gradient-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-500/40 hover:to-blue-500/40 border border-cyan-400/50 hover:border-cyan-300 text-cyan-300 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal */}
                {selectedReport && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
                        <div className="relative bg-gradient-to-b from-slate-800/95 to-slate-900/95 p-8 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-700/50 shadow-2xl">

                            {/* Header */}
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                                    Case Details
                                </h2>

                            </div>


                            <div className="h-[1px] w-full bg-gradient-to-r from-cyan-400/40 via-slate-600/20 to-transparent mb-8"></div>

                            {/* General Info */}
                            <section className="mb-8">
                                <h3 className="text-lg font-bold text-gray-100 mb-4 uppercase tracking-wider">General Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 bg-slate-900/50 p-6 rounded-2xl border border-slate-700/40">
                                    {[
                                        ["Blotter No", "blotterNo"],
                                        ["Offense", "offense"],
                                        ["Status", "status"],
                                        ["Barangay", "barangay"],
                                        ["Street", "street"],
                                        ["Type of Place", "typeOfPlace"],
                                        ["Date Reported", "dateReported"],
                                        ["Time Reported", "timeReported"],
                                        ["Date Committed", "dateCommitted"],
                                        ["Time Committed", "timeCommitted"],
                                        ["Stage of Felony", "stageOfFelony"],
                                        ["Mode of Reporting", "modeOfReporting"],
                                        ["CCTV Available", "cctvAvailable"],  // ADD THIS LINE
                                        ["Suspect Motive", "suspectMotive"],
                                    ].map(([label, key]) => {
                                        const value = selectedReport[key as keyof typeof selectedReport];

                                        if (editMode) {
                                            switch (key) {
                                                case "blotterNo":
                                                    return (
                                                        <div key={key}>
                                                            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{label}</label>
                                                            <input
                                                                type="text"
                                                                value={value ? String(value) : ""}
                                                                readOnly
                                                                className="bg-slate-800/50 border border-slate-600/50 px-3 py-2 w-full rounded-lg text-gray-400 cursor-not-allowed text-sm"
                                                            />
                                                        </div>
                                                    );

                                                case "offense":
                                                    const isCustomOffense = !offenseCategories.some(cat =>
                                                        cat.offenses.includes(String(value))
                                                    );

                                                    return (
                                                        <div key={key} className="col-span-2">
                                                            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{label}</label>
                                                            <select
                                                                value={isCustomOffense ? "CUSTOM_INPUT" : (value ? String(value) : "")}
                                                                onChange={(e) => {
                                                                    const selectedValue = e.target.value;
                                                                    if (selectedValue === "CUSTOM_INPUT") {
                                                                        setSelectedReport({ ...selectedReport, [key]: "" });
                                                                    } else {
                                                                        setSelectedReport({ ...selectedReport, [key]: selectedValue });
                                                                    }
                                                                }}
                                                                className="bg-slate-800/50 border border-slate-600/50 focus:border-cyan-400/50 outline-none px-3 py-2 w-full rounded-lg text-gray-200 text-sm transition-all"
                                                            >
                                                                <option value="">Select Offense</option>
                                                                {offenseCategories.map((cat) => (
                                                                    <optgroup key={cat.label} label={cat.label} className={cat.color}>
                                                                        {cat.offenses.map((off) => (
                                                                            <option key={off} value={off} className="bg-slate-800">
                                                                                {off}
                                                                            </option>
                                                                        ))}
                                                                    </optgroup>
                                                                ))}
                                                                <option value="CUSTOM_INPUT" className="bg-slate-800 text-yellow-400 font-semibold">
                                                                    ✏️ Enter Custom Offense
                                                                </option>
                                                            </select>

                                                            {(isCustomOffense || selectedReport[key] === "") && (
                                                                <div className="mt-3">
                                                                    <input
                                                                        type="text"
                                                                        value={value ? String(value) : ""}
                                                                        onChange={(e) =>
                                                                            setSelectedReport({ ...selectedReport, [key]: e.target.value })
                                                                        }
                                                                        placeholder="Type custom offense name..."
                                                                        className="bg-slate-800/50 border border-yellow-500/50 focus:border-yellow-400/70 outline-none px-3 py-2 w-full rounded-lg text-gray-200 text-sm transition-all"
                                                                    />
                                                                    <p className="text-xs text-yellow-400 mt-2">
                                                                        💡 Custom offense entry
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );

                                                case "status":
                                                    return (
                                                        <div key={key}>
                                                            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{label}</label>
                                                            <select
                                                                value={value ? String(value) : ""}
                                                                onChange={(e) =>
                                                                    setSelectedReport({ ...selectedReport, [key]: e.target.value })
                                                                }
                                                                className="bg-slate-800/50 border border-slate-600/50 focus:border-cyan-400/50 outline-none px-3 py-2 w-full rounded-lg text-gray-200 text-sm transition-all"
                                                            >
                                                                <option value="">Select Status</option>
                                                                <option value="Solved" className="bg-slate-800">Solved</option>
                                                                <option value="Cleared" className="bg-slate-800">Cleared</option>
                                                                <option value="Unsolved" className="bg-slate-800">Unsolved</option>
                                                            </select>
                                                        </div>
                                                    );

                                                case "barangay":
                                                    return (
                                                        <div key={key}>
                                                            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{label}</label>
                                                            <select
                                                                value={value ? String(value) : ""}
                                                                onChange={(e) =>
                                                                    setSelectedReport({ ...selectedReport, [key]: e.target.value })
                                                                }
                                                                className="bg-slate-800/50 border border-slate-600/50 focus:border-cyan-400/50 outline-none px-3 py-2 w-full rounded-lg text-gray-200 text-sm transition-all"
                                                            >
                                                                <option value="" className="bg-slate-800">Select Barangay</option>
                                                                {barangays.map((b) => (
                                                                    <option key={b} value={b} className="bg-slate-800">
                                                                        {b}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    );

                                                case "typeOfPlace":
                                                    return (
                                                        <div key={key}>
                                                            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{label}</label>
                                                            <select
                                                                value={value ? String(value) : ""}
                                                                onChange={(e) =>
                                                                    setSelectedReport({ ...selectedReport, [key]: e.target.value })
                                                                }
                                                                className="bg-slate-800/50 border border-slate-600/50 focus:border-cyan-400/50 outline-none px-3 py-2 w-full rounded-lg text-gray-200 text-sm transition-all"
                                                            >
                                                                <option value="" className="bg-slate-800">Select Type</option>
                                                                <option value="Along the Street" className="bg-slate-800">Along the Street</option>
                                                                <option value="Residential" className="bg-slate-800">Residential</option>
                                                                <option value="Commercial" className="bg-slate-800">Commercial</option>
                                                            </select>
                                                        </div>
                                                    );

                                                case "modeOfReporting":
                                                    return (
                                                        <div key={key}>
                                                            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{label}</label>
                                                            <select
                                                                value={value ? String(value) : ""}
                                                                onChange={(e) =>
                                                                    setSelectedReport({ ...selectedReport, [key]: e.target.value })
                                                                }
                                                                className="bg-slate-800/50 border border-slate-600/50 focus:border-cyan-400/50 outline-none px-3 py-2 w-full rounded-lg text-gray-200 text-sm transition-all"
                                                            >
                                                                <option value="" className="bg-slate-800">Select Mode</option>
                                                                <option value="N/A" className="bg-slate-800">N/A</option>
                                                                <option value="In Person" className="bg-slate-800">In Person</option>
                                                                <option value="Phone Call" className="bg-slate-800">Phone Call</option>
                                                                <option value="Online" className="bg-slate-800">Online</option>
                                                            </select>
                                                        </div>
                                                    );

                                                case "stageOfFelony":
                                                    return (
                                                        <div key={key}>
                                                            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{label}</label>
                                                            <select
                                                                value={value ? String(value) : ""}
                                                                onChange={(e) =>
                                                                    setSelectedReport({ ...selectedReport, [key]: e.target.value })
                                                                }
                                                                className="bg-slate-800/50 border border-slate-600/50 focus:border-cyan-400/50 outline-none px-3 py-2 w-full rounded-lg text-gray-200 text-sm transition-all"
                                                            >
                                                                <option value="" className="bg-slate-800">Select Stage</option>
                                                                <option value="N/A" className="bg-slate-800">N/A</option>
                                                                <option value="Attempted" className="bg-slate-800">Attempted</option>
                                                                <option value="Frustrated" className="bg-slate-800">Frustrated</option>
                                                                <option value="Consummated" className="bg-slate-800">Consummated</option>
                                                            </select>
                                                        </div>
                                                    );

                                                // ADD THIS NEW CASE
                                                case "cctvAvailable":
                                                    return (
                                                        <div key={key}>
                                                            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{label}</label>
                                                            <select
                                                                value={value ? String(value) : ""}
                                                                onChange={(e) =>
                                                                    setSelectedReport({ ...selectedReport, [key]: e.target.value })
                                                                }
                                                                className="bg-slate-800/50 border border-slate-600/50 focus:border-cyan-400/50 outline-none px-3 py-2 w-full rounded-lg text-gray-200 text-sm transition-all"
                                                            >
                                                                <option value="" className="bg-slate-800">Select Option</option>
                                                                <option value="Yes" className="bg-slate-800">Yes</option>
                                                                <option value="No" className="bg-slate-800">No</option>
                                                                <option value="Unknown" className="bg-slate-800">Unknown</option>
                                                            </select>
                                                        </div>
                                                    );

                                                default:
                                                    return (
                                                        <div key={key}>
                                                            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{label}</label>
                                                            <input
                                                                type="text"
                                                                value={value ? String(value) : ""}
                                                                onChange={(e) =>
                                                                    setSelectedReport({ ...selectedReport, [key]: e.target.value })
                                                                }
                                                                className="bg-slate-800/50 border border-slate-600/50 focus:border-cyan-400/50 outline-none px-3 py-2 w-full rounded-lg text-gray-200 text-sm transition-all"
                                                            />
                                                        </div>
                                                    );
                                            }
                                        }

                                        // view mode
                                        return (
                                            <div key={key}>
                                                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">{label}</label>
                                                <p className="text-gray-300 text-sm">{value ? String(value) : "—"}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Victim Information */}
                            <section className="mb-8">
                                <h3 className="text-lg font-bold text-gray-100 mb-4 uppercase tracking-wider">Victim Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 bg-slate-900/50 p-6 rounded-2xl border border-slate-700/40">
                                    {Object.entries(selectedReport.victim || {})
                                        .filter(([key]) => key !== "_id")
                                        .map(([key, value]) => (
                                            <div key={key}>
                                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                                                {editMode ? (
                                                    key === "gender" ? (
                                                        <select
                                                            value={value ? String(value) : ""}
                                                            onChange={(e) =>
                                                                setSelectedReport({
                                                                    ...selectedReport,
                                                                    victim: { ...selectedReport.victim, [key]: e.target.value },
                                                                })
                                                            }
                                                            className="bg-slate-800/50 border border-slate-600/50 focus:border-cyan-400/50 outline-none px-3 py-2 w-full rounded-lg text-gray-200 text-sm transition-all"
                                                        >
                                                            <option value="" className="bg-slate-800">Select Gender</option>
                                                            <option value="N/A" className="bg-slate-800">N/A</option>
                                                            <option value="Male" className="bg-slate-800">Male</option>
                                                            <option value="Female" className="bg-slate-800">Female</option>
                                                        </select>
                                                    ) : key === "harmed" ? (
                                                        <select
                                                            value={value ? String(value) : ""}
                                                            onChange={(e) =>
                                                                setSelectedReport({
                                                                    ...selectedReport,
                                                                    victim: { ...selectedReport.victim, [key]: e.target.value },
                                                                })
                                                            }
                                                            className="bg-slate-800/50 border border-slate-600/50 focus:border-cyan-400/50 outline-none px-3 py-2 w-full rounded-lg text-gray-200 text-sm transition-all"
                                                        >
                                                            <option value="" className="bg-slate-800">Select Status</option>
                                                            <option value="N/A" className="bg-slate-800">N/A</option>
                                                            <option value="Harmed" className="bg-slate-800">Harmed</option>
                                                            <option value="Unharmed" className="bg-slate-800">Unharmed</option>
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type={key === "age" ? "number" : "text"}
                                                            value={value ? String(value) : ""}
                                                            onChange={(e) =>
                                                                setSelectedReport({
                                                                    ...selectedReport,
                                                                    victim: { ...selectedReport.victim, [key]: e.target.value },
                                                                })
                                                            }
                                                            className="bg-slate-800/50 border border-slate-600/50 focus:border-cyan-400/50 outline-none px-3 py-2 w-full rounded-lg text-gray-200 text-sm transition-all"
                                                        />
                                                    )
                                                ) : (
                                                    <p className="text-gray-300 text-sm">{value ? String(value) : "—"}</p>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </section>

                            {/* Suspect Information */}
                            <section className="mb-8">
                                <h3 className="text-lg font-bold text-gray-100 mb-4 uppercase tracking-wider">Suspect Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 bg-slate-900/50 p-6 rounded-2xl border border-slate-700/40">
                                    {Object.entries(selectedReport.suspect || {})
                                        .filter(([key]) => key !== "_id")
                                        .map(([key, value]) => (
                                            <div key={key}>
                                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                                                {editMode ? (
                                                    key === "gender" ? (
                                                        <select
                                                            value={value ? String(value) : ""}
                                                            onChange={(e) =>
                                                                setSelectedReport({
                                                                    ...selectedReport,
                                                                    suspect: { ...selectedReport.suspect, [key]: e.target.value },
                                                                })
                                                            }
                                                            className="bg-slate-800/50 border border-slate-600/50 focus:border-cyan-400/50 outline-none px-3 py-2 w-full rounded-lg text-gray-200 text-sm transition-all"
                                                        >
                                                            <option value="" className="bg-slate-800">Select Gender</option>
                                                            <option value="N/A" className="bg-slate-800">N/A</option>
                                                            <option value="Male" className="bg-slate-800">Male</option>
                                                            <option value="Female" className="bg-slate-800">Female</option>
                                                        </select>
                                                    ) : key === "status" ? (
                                                        <select
                                                            value={value ? String(value) : ""}
                                                            onChange={(e) =>
                                                                setSelectedReport({
                                                                    ...selectedReport,
                                                                    suspect: { ...selectedReport.suspect, [key]: e.target.value },
                                                                })
                                                            }
                                                            className="bg-slate-800/50 border border-slate-600/50 focus:border-cyan-400/50 outline-none px-3 py-2 w-full rounded-lg text-gray-200 text-sm transition-all"
                                                        >
                                                            <option value="" className="bg-slate-800">Select Status</option>
                                                            <option value="N/A" className="bg-slate-800">N/A</option>
                                                            <option value="Arrested" className="bg-slate-800">Arrested</option>
                                                            <option value="Detained" className="bg-slate-800">Detained</option>
                                                            <option value="At Large" className="bg-slate-800">At Large</option>
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type={key === "age" ? "number" : "text"}
                                                            value={value ? String(value) : ""}
                                                            onChange={(e) =>
                                                                setSelectedReport({
                                                                    ...selectedReport,
                                                                    suspect: { ...selectedReport.suspect, [key]: e.target.value },
                                                                })
                                                            }
                                                            className="bg-slate-800/50 border border-slate-600/50 focus:border-cyan-400/50 outline-none px-3 py-2 w-full rounded-lg text-gray-200 text-sm transition-all"
                                                        />
                                                    )
                                                ) : (
                                                    <p className="text-gray-300 text-sm">{value ? String(value) : "—"}</p>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </section>

                            {/* Narrative */}
                            {selectedReport.narrative && (
                                <section className="mb-8">
                                    <h3 className="text-lg font-bold text-gray-100 mb-4 uppercase tracking-wider">Narrative</h3>
                                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/40">
                                        {editMode ? (
                                            <textarea
                                                value={selectedReport.narrative || ""}
                                                onChange={(e) =>
                                                    setSelectedReport({ ...selectedReport, narrative: e.target.value })
                                                }
                                                className="w-full bg-slate-800/50 border border-slate-600/50 focus:border-cyan-400/50 outline-none p-3 rounded-lg text-sm text-gray-300 resize-none transition-all"
                                                rows={5}
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                                                {selectedReport.narrative}
                                            </p>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* Location */}
                            <section className="mb-8">
                                <h3 className="text-lg font-bold text-gray-100 mb-4 uppercase tracking-wider">Location</h3>
                                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/40">
                                    <p className="text-sm text-gray-300 mb-4">
                                        <span className="font-semibold text-cyan-300">Coordinates:</span> {selectedReport.location?.coordinates?.[1]}, {selectedReport.location?.coordinates?.[0]}
                                    </p>
                                    <iframe
                                        className="rounded-xl border border-slate-700/50 shadow-lg w-full"
                                        width="100%"
                                        height="300"
                                        loading="lazy"
                                        src={`https://www.google.com/maps?q=${selectedReport.location?.coordinates?.[1]},${selectedReport.location?.coordinates?.[0]}&hl=es;z=14&output=embed`}
                                    ></iframe>
                                </div>
                            </section>

                            {/* Footer */}
                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-700/50">

                                {authUser && authUser.role !== 'admin' &&
                                    <button
                                        onClick={() => setEditMode((prev) => !prev)}
                                        className={`px-5 py-2 rounded-lg font-semibold transition-all ${editMode
                                            ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg"
                                            : "bg-slate-700 hover:bg-slate-600 text-gray-200"
                                            }`}
                                    >

                                        {editMode ? "Cancel Edit" : "Edit"}
                                    </button>
                                }

                                {editMode && <button
                                    onClick={() => {
                                        handleChange();
                                    }}
                                    className="px-5 py-2 rounded-lg font-semibold transition-all bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg"
                                >
                                    Save Changes
                                </button>}

                                {!editMode && (
                                    <button
                                        onClick={handlePrint}
                                        className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold shadow-lg transition-all"
                                    >
                                        Print Report
                                    </button>
                                )}

                                <button
                                    onClick={() => {
                                        setSelectedReport(null)
                                        setEditMode(false)
                                    }}
                                    className="px-6 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-gray-200 font-semibold transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;