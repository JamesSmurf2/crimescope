"use client";

import React, { useState, useEffect } from "react";
import useReportStore from "@/utils/zustand/ReportStore";

const ReportsPage = () => {


    // -------------------- Data Lists --------------------
    const barangays = [
        "Almanza Dos", "Almanza Uno", "B.F. CAA International Village", "Aldana",
        "Manuyo Dos", "Manuyo Uno", "Pamplona Dos", "Pamplona Tres",
        "Pamplona Uno", "Pilar", "Pulang Lupa Dos", "Pulang Lupa Uno",
        "Talon Dos", "Talon Kuatro", "Talon Singko", "Talon Tres",
        "Talon Uno", "Zapote",
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
                "Direct Assault",
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
                "Unjust Vexation",
                "Threats",
                "Malicious Mischief",
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



    const [filters, setFilters] = useState({
        search: "",
        offense: "",
        barangay: "",
        status: "",
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
        setFilters({ search: "", offense: "", barangay: "", status: "" });


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

    return (

        <div className="min-h-screen bg-[#0F1120] text-white p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold">Barangay Crime Reports Dashboard</h1>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-center">
                    <input
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="🔍 Search by victim, suspect, or offense"
                        className="bg-[#1C1E2E] px-3 py-2 rounded-lg text-sm w-64"
                    />
                    <input
                        name="offense"
                        value={filters.offense}
                        onChange={handleFilterChange}
                        placeholder="Offense (e.g. Rape)"
                        className="bg-[#1C1E2E] px-3 py-2 rounded-lg text-sm"
                    />
                    <select
                        name="barangay"
                        value={filters.barangay}
                        onChange={handleFilterChange}
                        className="bg-[#1C1E2E] px-3 py-2 rounded-lg text-sm"
                    >
                        <option value="">Barangay</option>
                        {barangays.map((b, i) => (
                            <option key={i} value={b}>
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
                        <option value="Cleared">Cleared</option>
                    </select>
                    <button
                        onClick={resetFilters}
                        className="bg-gray-600 px-4 py-2 rounded-lg text-sm"
                    >
                        Reset
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#1C1E2E] p-4 rounded-xl">
                        <h2 className="text-sm text-gray-400">Total Reports</h2>
                        <p className="text-xl font-bold">{totalReports}</p>
                    </div>
                    <div className="bg-[#1C1E2E] p-4 rounded-xl">
                        <h2 className="text-sm text-gray-400">Solved Cases</h2>
                        <p className="text-xl font-bold">{solvedCount}</p>
                    </div>
                    <div className="bg-[#1C1E2E] p-4 rounded-xl">
                        <h2 className="text-sm text-gray-400">Unsolved Cases</h2>
                        <p className="text-xl font-bold">{unsolvedCount}</p>
                    </div>
                    <div className="bg-[#1C1E2E] p-4 rounded-xl">
                        <h2 className="text-sm text-gray-400">Cleared Cases</h2>
                        <p className="text-xl font-bold">{clearedCount}</p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-[#1C1E2E] rounded-xl overflow-x-auto p-4">
                    {loading ? (
                        <p>Loading reports...</p>
                    ) : filteredReports.length === 0 ? (
                        <p className="text-gray-400 text-center">No reports found.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="p-2 text-left">Blotter No</th>
                                    <th className="p-2 text-left">Offense</th>
                                    <th className="p-2 text-left">Barangay</th>
                                    <th className="p-2 text-left">Victim</th>
                                    <th className="p-2 text-left">Suspect</th>
                                    <th className="p-2 text-left">Status</th>
                                    <th className="p-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.map((r, i) => (
                                    <tr key={r._id || i} className="border-b border-gray-800">
                                        <td className="p-2">{r.blotterNo}</td>
                                        <td className="p-2">{r.offense}</td>
                                        <td className="p-2">{r.barangay}</td>
                                        <td className="p-2">{r.victim?.name}</td>
                                        <td className="p-2">{r.suspect?.name}</td>
                                        <td className="p-2">
                                            <select
                                                value={r.status}
                                                onChange={(e) => {
                                                    const newStatus = e.target.value;
                                                    setReports((prev) =>
                                                        prev.map((x) =>
                                                            x._id === r._id ? { ...x, status: newStatus } : x
                                                        )
                                                    );
                                                    changeReportStatus(r._id, newStatus);
                                                }}
                                                className="bg-[#2A2C3E] rounded-lg px-2 py-1 text-sm"
                                            >
                                                <option value="Solved">🟢 Solved</option>
                                                <option value="Unsolved">🔴 Unsolved</option>
                                                <option value="Cleared">🟡 Cleared</option>
                                            </select>
                                        </td>
                                        <td className="p-2">
                                            <button
                                                onClick={() => setSelectedReport(r)}
                                                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-xs"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Modal */}
                {selectedReport && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
                        <div className="relative bg-gradient-to-b from-[#1E2233] to-[#151827] p-8 rounded-2xl w-[850px] max-h-[90vh] overflow-y-auto border border-gray-700/50 shadow-[0_0_30px_rgba(0,0,0,0.4)] transition-all duration-300">

                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
                                    <span className="text-3xl">🧾</span> Case Report Details
                                </h2>
                                <button
                                    onClick={() => setEditMode((prev) => !prev)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${editMode
                                        ? "bg-blue-600 hover:bg-blue-500 text-white"
                                        : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                                        }`}
                                >
                                    {editMode ? "💾 Save Changes" : "✏️ Edit"}
                                </button>
                            </div>

                            <div className="h-[1px] w-full bg-gradient-to-r from-green-400/60 via-gray-500/30 to-transparent mb-6"></div>

                            {/* General Info */}
                            <section className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-100 mb-3 flex items-center gap-2">
                                    📋 General Information
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm text-gray-300 bg-[#22263A]/60 p-4 rounded-xl border border-gray-700/50">
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
                                    ].map(([label, key]) => {
                                        const value = selectedReport[key as keyof typeof selectedReport];

                                        if (editMode) {
                                            switch (key) {
                                                case "blotterNo":
                                                    return (
                                                        <div key={key}>
                                                            <b>{label}:</b>{" "}
                                                            <input
                                                                type="text"
                                                                value={value ? String(value) : ""}
                                                                readOnly
                                                                className="bg-gray-700 border-b border-gray-500 px-1 w-full cursor-not-allowed"
                                                            />
                                                        </div>
                                                    );

                                                case "offense":
                                                    return (
                                                        <div key={key}>
                                                            <b>{label}:</b>{" "}
                                                            <select
                                                                value={value ? String(value) : ""}
                                                                onChange={(e) =>
                                                                    setSelectedReport({ ...selectedReport, [key]: e.target.value })
                                                                }
                                                                className="bg-transparent border-b border-gray-500 focus:border-green-400 outline-none px-1 w-full transition"
                                                            >
                                                                <option value="">Select Offense</option>
                                                                {offenseCategories.map((cat) => (
                                                                    <optgroup key={cat.label} label={cat.label} className={cat.color}>
                                                                        {cat.offenses.map((off) => (
                                                                            <option key={off} value={off}>
                                                                                {off}
                                                                            </option>
                                                                        ))}
                                                                    </optgroup>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    );

                                                case "status":
                                                    return (
                                                        <div key={key} >
                                                            <b>{label}:</b>{" "}
                                                            <select
                                                                value={value ? String(value) : ""}
                                                                onChange={(e) =>
                                                                    setSelectedReport({ ...selectedReport, [key]: e.target.value })
                                                                }
                                                                className="bg-transparent border-b border-gray-500 focus:border-green-400 outline-none px-1 w-full transition"
                                                            >
                                                                <option className='text-black' value="">Select Status</option>
                                                                <option className='text-black'>Solved</option>
                                                                <option className='text-black'>Cleared</option>
                                                                <option className='text-black'>Unsolved</option>
                                                            </select>
                                                        </div>
                                                    );

                                                case "barangay":
                                                    return (
                                                        <div key={key}>
                                                            <b>{label}:</b>{" "}
                                                            <select
                                                                value={value ? String(value) : ""}
                                                                onChange={(e) =>
                                                                    setSelectedReport({ ...selectedReport, [key]: e.target.value })
                                                                }
                                                                className="bg-transparent border-b border-gray-500 focus:border-green-400 outline-none px-1 w-full transition"
                                                            >
                                                                <option className='text-black' value="">Select Barangay</option>
                                                                {barangays.map((b) => (
                                                                    <option key={b} value={b} className='text-black'>
                                                                        {b}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    );

                                                case "typeOfPlace":
                                                    return (
                                                        <div key={key}>
                                                            <b>{label}:</b>{" "}
                                                            <select
                                                                value={value ? String(value) : ""}
                                                                onChange={(e) =>
                                                                    setSelectedReport({ ...selectedReport, [key]: e.target.value })
                                                                }
                                                                className="bg-transparent border-b border-gray-500 focus:border-green-400 outline-none px-1 w-full transition"
                                                            >
                                                                <option className='text-black' value="">Select Type</option>
                                                                <option className='text-black' value="Along the Street">Along the Street</option>
                                                                <option className='text-black' value="Residential">Residential</option>
                                                                <option className='text-black' value="Commercial">Commercial</option>
                                                            </select>
                                                        </div>
                                                    );

                                                case "modeOfReporting":
                                                    return (
                                                        <div key={key}>
                                                            <b>{label}:</b>{" "}
                                                            <select
                                                                value={value ? String(value) : ""}
                                                                onChange={(e) =>
                                                                    setSelectedReport({ ...selectedReport, [key]: e.target.value })
                                                                }
                                                                className="bg-transparent border-b border-gray-500 focus:border-green-400 outline-none px-1 w-full transition"
                                                            >
                                                                <option className='text-black' value="">Select Mode</option>
                                                                <option className='text-black' value="In Person">In Person</option>
                                                                <option className='text-black' value="Phone Call">Phone Call</option>
                                                                <option className='text-black' value="Online">Online</option>
                                                            </select>
                                                        </div>
                                                    );

                                                case "stageOfFelony":
                                                    return (
                                                        <div key={key}>
                                                            <b>{label}:</b>{" "}
                                                            <select
                                                                value={value ? String(value) : ""}
                                                                onChange={(e) =>
                                                                    setSelectedReport({ ...selectedReport, [key]: e.target.value })
                                                                }
                                                                className="bg-transparent border-b border-gray-500 focus:border-green-400 outline-none px-1 w-full transition"
                                                            >
                                                                <option className='text-black' value="">Select Stage</option>
                                                                <option className='text-black' value="Attempted">Attempted</option>
                                                                <option className='text-black' value="Frustrated">Frustrated</option>
                                                                <option className='text-black' value="Consummated">Consummated</option>
                                                            </select>
                                                        </div>
                                                    );

                                                default:
                                                    return (
                                                        <div key={key}>
                                                            <b>{label}:</b>{" "}
                                                            <input
                                                                type="text"
                                                                value={value ? String(value) : ""}
                                                                onChange={(e) =>
                                                                    setSelectedReport({ ...selectedReport, [key]: e.target.value })
                                                                }
                                                                className="bg-transparent border-b border-gray-500 focus:border-green-400 outline-none px-1 w-full transition"
                                                            />
                                                        </div>
                                                    );
                                            }
                                        }

                                        // view mode
                                        return (
                                            <div key={key}>
                                                <b>{label}:</b> <span>{value ? String(value) : "—"}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Victim Information */}
                            <section className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-100 mb-3 flex items-center gap-2">
                                    🙍‍♂️ Victim Information
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm text-gray-300 bg-[#22263A]/60 p-4 rounded-xl border border-gray-700/50">
                                    {Object.entries(selectedReport.victim || {}).map(([key, value]) => (
                                        <div key={key}>
                                            <b>{key.charAt(0).toUpperCase() + key.slice(1)}:</b>{" "}
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
                                                        className="bg-transparent border-b border-gray-500 focus:border-green-400 outline-none px-1 w-full transition"
                                                    >
                                                        <option value="">Select Gender</option>
                                                        <option>Male</option>
                                                        <option>Female</option>
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
                                                        className="bg-transparent border-b border-gray-500 focus:border-green-400 outline-none px-1 w-full transition"
                                                    >
                                                        <option value="">Select Status</option>
                                                        <option>Harmed</option>
                                                        <option>Unharmed</option>
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
                                                        className="bg-transparent border-b border-gray-500 focus:border-green-400 outline-none px-1 w-full transition"
                                                    />
                                                )
                                            ) : (
                                                <span>{value ? String(value) : "—"}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Suspect Information */}
                            <section className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-100 mb-3 flex items-center gap-2">
                                    🕵️‍♂️ Suspect Information
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm text-gray-300 bg-[#22263A]/60 p-4 rounded-xl border border-gray-700/50">
                                    {Object.entries(selectedReport.suspect || {}).map(([key, value]) => (
                                        <div key={key}>
                                            <b>{key.charAt(0).toUpperCase() + key.slice(1)}:</b>{" "}
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
                                                        className="bg-transparent border-b border-gray-500 focus:border-green-400 outline-none px-1 w-full transition"
                                                    >
                                                        <option value="">Select Gender</option>
                                                        <option>Male</option>
                                                        <option>Female</option>
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
                                                        className="bg-transparent border-b border-gray-500 focus:border-green-400 outline-none px-1 w-full transition"
                                                    >
                                                        <option value="">Select Status</option>
                                                        <option>Arrested</option>
                                                        <option>Detained</option>
                                                        <option>At Large</option>
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
                                                        className="bg-transparent border-b border-gray-500 focus:border-green-400 outline-none px-1 w-full transition"
                                                    />
                                                )
                                            ) : (
                                                <span>{value ? String(value) : "—"}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Narrative */}
                            {selectedReport.narrative && (
                                <section className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-100 mb-3 flex items-center gap-2">
                                        🗒 Narrative
                                    </h3>
                                    <div className="bg-[#22263A]/60 p-4 rounded-xl border border-gray-700/50">
                                        {editMode ? (
                                            <textarea
                                                value={selectedReport.narrative || ""}
                                                onChange={(e) =>
                                                    setSelectedReport({ ...selectedReport, narrative: e.target.value })
                                                }
                                                className="w-full bg-transparent border border-gray-600 focus:border-green-400 outline-none p-2 rounded-md text-sm text-gray-300 resize-none"
                                                rows={4}
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                                                {selectedReport.narrative}
                                            </p>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* Section: Location */}
                            <section>
                                <h3 className="text-lg font-semibold text-gray-100 mb-3 flex items-center gap-2">
                                    📍 Location
                                </h3>
                                <div className="bg-[#22263A]/60 p-4 rounded-xl border border-gray-700/50">
                                    <p className="text-sm text-gray-300 mb-3">
                                        <b>Coordinates:</b>{" "}
                                        {selectedReport.location?.coordinates?.[1]},{" "}
                                        {selectedReport.location?.coordinates?.[0]}
                                    </p>
                                    <iframe
                                        className="rounded-lg border border-gray-700 shadow-lg"
                                        width="100%"
                                        height="250"
                                        loading="lazy"
                                        src={`https://www.google.com/maps?q=${selectedReport.location?.coordinates?.[1]},${selectedReport.location?.coordinates?.[0]}&hl=es;z=14&output=embed`}
                                    ></iframe>
                                </div>
                            </section>

                            {/* Footer */}
                            <div className="flex justify-end mt-8 gap-3 pt-4 border-t border-gray-700/50">
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium transition-all duration-200"
                                >
                                    ✖ Close
                                </button>
                                {!editMode && (
                                    <button
                                        onClick={handlePrint}
                                        className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium shadow-md hover:shadow-green-400/20 transition-all duration-200"
                                    >
                                        🖨 Print Report
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}




            </div>
        </div>
    );
};

export default ReportsPage;
