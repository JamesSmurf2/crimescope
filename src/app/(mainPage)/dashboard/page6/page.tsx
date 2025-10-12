"use client";

import React, { useState, useEffect } from "react";
import useReportStore from "@/utils/zustand/ReportStore";

// 🗺️ React Leaflet imports
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ✅ Fix default marker icon for React Leaflet (no import errors)
const DefaultIcon = new L.Icon({
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;


const ReportsPage = () => {
    const { changeReportStatus } = useReportStore();

    const [reports, setReports] = useState<any[]>([]);
    const [filteredReports, setFilteredReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<any | null>(null);

    const [filters, setFilters] = useState({
        search: "",
        offense: "",
        barangay: "",
        status: "",
    });

    const barangays = [
        "Almanza Dos",
        "Almanza Uno",
        "Daniel Fajardo",
        "Elias Aldana",
        "Ilaya",
        "Manuyo Uno",
        "Manuyo Dos",
        "Pamplona Uno",
        "Pamplona Dos",
        "Pamplona Tres",
        "Pilar",
        "Pulang Lupa Uno",
        "Pulang Lupa Dos",
        "Talon Uno",
        "Talon Dos",
        "Talon Tres",
        "Talon Cuatro",
        "Talon Singko",
        "Zapote",
    ];

    // ✅ Mock reports data
    useEffect(() => {
        const mockReports = [
            {
                blotterNo: "BLTR-2025-4821",
                dateEncoded: "2025-10-12T08:45:00",
                barangay: "Pulang Lupa Uno",
                street: "Almanza Street",
                typeOfPlace: "Residential",
                dateReported: "2025-10-12",
                timeReported: "08:45 AM",
                offense: "Physical Injury",
                victim: {
                    name: "Juan Dela Cruz",
                    age: "29",
                    gender: "Male",
                    harmed: "Harmed",
                    nationality: "Filipino",
                    occupation: "Construction Worker",
                },
                suspect: {
                    name: "Pedro Santos",
                    age: "32",
                    gender: "Male",
                    status: "At Large",
                    nationality: "Filipino",
                    occupation: "Tricycle Driver",
                },
                suspectMotive: "Personal misunderstanding after an argument.",
                narrative:
                    "The victim was physically assaulted by the suspect during a heated argument in front of a sari-sari store.",
                status: "Unsolved",
                location: { lat: 14.4445, lng: 120.9939 },
            },
        ];

        setReports(mockReports);
        setFilteredReports(mockReports);
        setLoading(false);
    }, []);

    // Filtering logic
    useEffect(() => {
        if (!reports.length) return;

        let filtered = [...reports];

        if (filters.offense) {
            filtered = filtered.filter((r) => r.offense === filters.offense);
        }
        if (filters.barangay) {
            filtered = filtered.filter((r) => r.barangay === filters.barangay);
        }
        if (filters.status) {
            filtered = filtered.filter(
                (r) =>
                    (r.status || "Pending").toLowerCase() === filters.status.toLowerCase()
            );
        }
        if (filters.search.trim()) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(
                (r) =>
                    r.victim?.name?.toLowerCase().includes(searchLower) ||
                    r.offense?.toLowerCase().includes(searchLower)
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

    const offenseFrequency = filteredReports.reduce<Record<string, number>>(
        (acc, r) => {
            acc[r.offense] = (acc[r.offense] || 0) + 1;
            return acc;
        },
        {}
    );
    const mostCommonOffense = Object.entries(offenseFrequency).reduce(
        (max, entry) => (entry[1] > max[1] ? entry : max),
        ["N/A", 0]
    )[0];

    function handleFilterChange(
        e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
    ) {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value || "" }));
    }

    function resetFilters() {
        setFilters({ search: "", offense: "", barangay: "", status: "" });
    }

    function handlePrint() {
        if (!selectedReport) return;

        const printContent = `
      <html>
        <head>
          <title>Case Report - ${selectedReport.blotterNo}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            .section { margin-bottom: 15px; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Case Report</h1>
          <div class="section">
            <p><span class="label">Blotter No:</span> ${selectedReport.blotterNo}</p>
            <p><span class="label">Status:</span> ${selectedReport.status}</p>
            <p><span class="label">Victim:</span> ${selectedReport.victim.name}</p>
            <p><span class="label">Barangay:</span> ${selectedReport.barangay}</p>
            <p><span class="label">Offense:</span> ${selectedReport.offense}</p>
            <p><span class="label">Narrative:</span> ${selectedReport.narrative}</p>
            <p><span class="label">Suspect:</span> ${selectedReport.suspect.name || "N/A"}</p>
          </div>
        </body>
      </html>
    `;

        const newWindow = window.open("", "_blank", "width=800,height=600");
        newWindow?.document.write(printContent);
        newWindow?.document.close();
        newWindow?.print();
    }

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-start bg-[#0F1120] text-white p-6 overflow-x-hidden">
            <div className="w-full max-w-[1200px] space-y-6">
                <h1 className="text-2xl font-bold">Crime Reports Dashboard</h1>

                {/* Filters */}
                <div className="flex gap-4 flex-wrap items-center">
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="🔍 Search by victim or offense"
                        className="bg-[#1C1E2E] px-3 py-2 rounded-lg text-sm w-64"
                    />
                    <select
                        name="offense"
                        value={filters.offense}
                        onChange={handleFilterChange}
                        className="bg-[#1C1E2E] px-3 py-2 rounded-lg text-sm cursor-pointer"
                    >
                        <option value="">Offense Type</option>
                        {Array.from(new Set(reports.map((r) => r.offense))).map((offense) => (
                            <option key={offense} value={offense}>
                                {offense}
                            </option>
                        ))}
                    </select>
                    <select
                        name="barangay"
                        value={filters.barangay}
                        onChange={handleFilterChange}
                        className="bg-[#1C1E2E] px-3 py-2 rounded-lg text-sm cursor-pointer"
                    >
                        <option value="">Barangay</option>
                        {barangays.map((b) => (
                            <option key={b} value={b}>
                                {b}
                            </option>
                        ))}
                    </select>
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="bg-[#1C1E2E] px-3 py-2 rounded-lg text-sm cursor-pointer"
                    >
                        <option value="">Status</option>
                        <option value="Solved">Solved</option>
                        <option value="Unsolved">Unsolved</option>
                        <option value="Cleared">Cleared</option>
                    </select>
                    <button
                        onClick={resetFilters}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-medium cursor-pointer"
                    >
                        Reset Filters
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#1C1E2E] p-4 rounded-xl shadow">
                        <h2 className="text-sm text-gray-400">Total Reports</h2>
                        <p className="text-xl font-bold">{loading ? "Loading..." : totalReports}</p>
                    </div>
                    <div className="bg-[#1C1E2E] p-4 rounded-xl shadow">
                        <h2 className="text-sm text-gray-400">Most Common Offense</h2>
                        <p className="text-xl font-bold">
                            {loading ? "Loading..." : mostCommonOffense}
                        </p>
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

                {/* Reports Table */}
                <div className="bg-[#1C1E2E] rounded-xl p-4 overflow-x-auto">
                    {loading ? (
                        <p className="text-center text-gray-400">Loading reports...</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left border-b border-gray-700">
                                    <th className="p-2">Blotter No</th>
                                    <th className="p-2">Victim</th>
                                    <th className="p-2">Offense</th>
                                    <th className="p-2">Barangay</th>
                                    <th className="p-2">Date Reported</th>
                                    <th className="p-2">Status</th>
                                    <th className="p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-4 text-center text-gray-400">
                                            No reports found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReports.map((report) => (
                                        <tr key={report.blotterNo} className="border-b border-gray-800">
                                            <td className="p-2">{report.blotterNo}</td>
                                            <td className="p-2">{report.victim.name}</td>
                                            <td className="p-2">{report.offense}</td>
                                            <td className="p-2">{report.barangay}</td>
                                            <td className="p-2">{report.dateReported}</td>
                                            <td className="p-2">
                                                <select
                                                    value={report.status}
                                                    onChange={(e) => {
                                                        const newStatus = e.target.value;
                                                        setReports((prev) =>
                                                            prev.map((r) =>
                                                                r.blotterNo === report.blotterNo
                                                                    ? { ...r, status: newStatus }
                                                                    : r
                                                            )
                                                        );
                                                        changeReportStatus(report.blotterNo, newStatus);
                                                    }}
                                                    className="bg-[#2A2C3E] text-sm px-2 py-1 rounded-lg border border-gray-600 cursor-pointer"
                                                >
                                                    <option value="Solved">🟢 Solved</option>
                                                    <option value="Unsolved">🔴 Unsolved</option>
                                                    <option value="Cleared">🟡 Cleared</option>
                                                </select>
                                            </td>
                                            <td className="p-2">
                                                <button
                                                    onClick={() => setSelectedReport(report)}
                                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs cursor-pointer"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* View Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1C1E2E] p-6 rounded-xl w-full max-w-3xl shadow-2xl overflow-y-auto max-h-[90vh]">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-4">
                            <h2 className="text-2xl font-bold text-white">Case Report Details</h2>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="text-gray-400 hover:text-white text-xl transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Case Summary */}
                        <div className="space-y-2 mb-4">
                            <p>
                                <span className="text-gray-400">Blotter No:</span> {selectedReport.blotterNo}
                            </p>
                            <p>
                                <span className="text-gray-400">Date Encoded:</span>{" "}
                                {new Date(selectedReport.dateEncoded).toLocaleString()}
                            </p>
                            <p>
                                <span className="text-gray-400">Status:</span>{" "}
                                <span className="font-semibold text-yellow-400">
                                    {selectedReport.status}
                                </span>
                            </p>
                            <p>
                                <span className="text-gray-400">Date Reported:</span>{" "}
                                {selectedReport.dateReported} at {selectedReport.timeReported}
                            </p>
                        </div>

                        {/* Location Details */}
                        <div className="bg-[#25273A] p-4 rounded-lg space-y-2 mb-4">
                            <h3 className="font-semibold text-lg border-b border-gray-600 pb-1">
                                Location Details
                            </h3>
                            <p>
                                <span className="text-gray-400">Barangay:</span>{" "}
                                {selectedReport.barangay}
                            </p>
                            <p>
                                <span className="text-gray-400">Street:</span> {selectedReport.street}
                            </p>
                            <p>
                                <span className="text-gray-400">Type of Place:</span>{" "}
                                {selectedReport.typeOfPlace}
                            </p>
                            <p>
                                <span className="text-gray-400">Latitude:</span>{" "}
                                {selectedReport.location?.lat}
                            </p>
                            <p>
                                <span className="text-gray-400">Longitude:</span>{" "}
                                {selectedReport.location?.lng}
                            </p>
                        </div>

                        {/* Victim Section */}
                        <div className="bg-[#25273A] p-4 rounded-lg space-y-2 mb-4">
                            <h3 className="font-semibold text-lg border-b border-gray-600 pb-1">
                                Victim Information
                            </h3>
                            <p>
                                <span className="text-gray-400">Name:</span>{" "}
                                {selectedReport.victim.name}
                            </p>
                            <p>
                                <span className="text-gray-400">Age:</span>{" "}
                                {selectedReport.victim.age}
                            </p>
                            <p>
                                <span className="text-gray-400">Gender:</span>{" "}
                                {selectedReport.victim.gender}
                            </p>
                            <p>
                                <span className="text-gray-400">Harmed:</span>{" "}
                                {selectedReport.victim.harmed}
                            </p>
                            <p>
                                <span className="text-gray-400">Nationality:</span>{" "}
                                {selectedReport.victim.nationality}
                            </p>
                            <p>
                                <span className="text-gray-400">Occupation:</span>{" "}
                                {selectedReport.victim.occupation}
                            </p>
                        </div>

                        {/* Suspect Section */}
                        <div className="bg-[#25273A] p-4 rounded-lg space-y-2 mb-4">
                            <h3 className="font-semibold text-lg border-b border-gray-600 pb-1">
                                Suspect Information
                            </h3>
                            <p>
                                <span className="text-gray-400">Name:</span>{" "}
                                {selectedReport.suspect.name || "N/A"}
                            </p>
                            <p>
                                <span className="text-gray-400">Age:</span>{" "}
                                {selectedReport.suspect.age || "N/A"}
                            </p>
                            <p>
                                <span className="text-gray-400">Gender:</span>{" "}
                                {selectedReport.suspect.gender || "N/A"}
                            </p>
                            <p>
                                <span className="text-gray-400">Status:</span>{" "}
                                {selectedReport.suspect.status || "N/A"}
                            </p>
                            <p>
                                <span className="text-gray-400">Motive:</span>{" "}
                                {selectedReport.suspectMotive || "N/A"}
                            </p>
                        </div>

                        {/* Narrative */}
                        <div className="bg-[#25273A] p-4 rounded-lg space-y-2 mb-4">
                            <h3 className="font-semibold text-lg border-b border-gray-600 pb-1">
                                Incident Narrative
                            </h3>
                            <p className="text-gray-300 text-sm">{selectedReport.narrative}</p>
                        </div>

                        {/* 🗺️ Map Section */}
                        {selectedReport.location && (
                            <div className="bg-[#25273A] p-4 rounded-lg mb-4">
                                <h3 className="font-semibold text-lg border-b border-gray-600 pb-2 mb-2">
                                    Incident Location Map
                                </h3>
                                <MapContainer
                                    center={[
                                        selectedReport.location.lat,
                                        selectedReport.location.lng,
                                    ]}
                                    zoom={16}
                                    style={{ height: "300px", width: "100%", borderRadius: "10px" }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <Marker
                                        position={[
                                            selectedReport.location.lat,
                                            selectedReport.location.lng,
                                        ]}
                                    >
                                        <Popup>
                                            {selectedReport.barangay}, {selectedReport.street}
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                        )}

                        {/* Footer Buttons */}
                        <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
                            <button
                                onClick={handlePrint}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
                            >
                                🖨️ Print
                            </button>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
