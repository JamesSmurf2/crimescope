'use client'

import React, { useState } from 'react';
import Papa from 'papaparse';

// ✅ Barangay & Offense Lists
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
        offenses: ["Murder", "Homicide", "Rape", "Physical Injury", "Robbery", "Theft", "Carnapping", "Cattle Rustling"],
    },
    {
        label: "⚖️ Non-Index Crimes",
        color: "text-yellow-400 font-semibold",
        offenses: ["Drug Offense", "Illegal Firearms", "Child Abuse", "Cybercrime", "Estafa", "Direct Assault", "Grave Threats", "Other Forms of Trespass", "Violence Against Women & Children (VAWC)", "Illegal Logging"],
    },
    {
        label: "🚗 Traffic Violations",
        color: "text-blue-400 font-semibold",
        offenses: ["Reckless Driving", "Illegal Parking", "Overspeeding", "Driving Without License", "Road Accident"],
    },
    {
        label: "📜 Ordinance Violations",
        color: "text-gray-400 font-semibold",
        offenses: ["Curfew Violation", "Public Disturbance", "Littering", "Noise Complaint", "Illegal Vending", "Drinking in Public", "Alarms and Scandals", "Unjust Vexations", "Light Threats", "Malicious Mischief"],
    },
];

// ✅ Interfaces
interface CrimeForm {
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
    victim: { name: string; age: string; gender: string; harmed: string; nationality: string; occupation: string };
    suspect: { name: string; age: string; gender: string; status: string; nationality: string; occupation: string };
    suspectMotive: string;
    narrative: string;
    status: string;
    location: { lat: number; lng: number };
}

interface RawCrimeReport {
    [key: string]: any;
}

type ReportStatus = 'pending' | 'accepted' | 'rejected';

export default function CrimeReportViewer() {
    const [crimeData, setCrimeData] = useState<CrimeForm[]>([]);
    const [reportStatuses, setReportStatuses] = useState<Map<number, ReportStatus>>(new Map());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState<number | null>(null);

    // ✅ Utility: Update dropdown values for each report
    const handleDropdownChange = (index: number, field: keyof CrimeForm, value: string) => {
        setCrimeData(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const parseVictimDetails = (personStr: string): { name: string; age: string; gender: string; harmed: string; nationality: string; occupation: string } => {
        if (!personStr || personStr === '-') {
            return { name: 'N/A', age: 'N/A', gender: 'N/A', harmed: 'N/A', nationality: 'N/A', occupation: 'N/A' };
        }

        const match = personStr.match(/^(.+?)\s*\(([^)]+)\)/);

        if (match) {
            const name = match[1].trim();
            const details = match[2].split('/').map(d => d.trim());

            return {
                name: name || 'N/A',
                age: details[0] || 'N/A',
                gender: details[1] || 'N/A',
                harmed: details[2] || 'N/A',
                nationality: details[3] || 'N/A',
                occupation: details[4] || 'N/A'
            };
        }

        return { name: personStr, age: 'N/A', gender: 'N/A', harmed: 'N/A', nationality: 'N/A', occupation: 'N/A' };
    };

    const parseSuspectDetails = (personStr: string): { name: string; age: string; gender: string; status: string; nationality: string; occupation: string } => {
        if (!personStr || personStr === '-') {
            return { name: 'N/A', age: 'N/A', gender: 'N/A', status: 'N/A', nationality: 'N/A', occupation: 'N/A' };
        }

        const match = personStr.match(/^(.+?)\s*\(([^)]+)\)/);

        if (match) {
            const name = match[1].trim();
            const details = match[2].split('/').map(d => d.trim());

            return {
                name: name || 'N/A',
                age: details[0] || 'N/A',
                gender: details[1] || 'N/A',
                status: details[2] || 'N/A',
                nationality: details[3] || 'N/A',
                occupation: details[4] || 'N/A'
            };
        }

        return { name: personStr, age: 'N/A', gender: 'N/A', status: 'N/A', nationality: 'N/A', occupation: 'N/A' };
    };

    const toCamelCase = (str: string): string => {
        if (!str) return '';
        if (str.toUpperCase().includes('CAA')) return 'B.F. CAA International Village'; // exception

        return str
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const transformToFormData = (rawData: RawCrimeReport[]): CrimeForm[] => {
        return rawData
            .filter(row => row && typeof row === 'object')
            .map((row, index) => {
                const victimStr = row.victim || row.Victim || '';
                const firstVictim = victimStr.split(',')[0];

                const suspectStr = row.suspect || row.Suspect || '';
                const firstSuspect = suspectStr.split(',')[0];

                return {
                    barangay: toCamelCase(row.barangay || row.Barangay || 'N/A'),
                    street: row.street || row.Street || 'N/A',
                    typeOfPlace: row.typeofPlace || row.typeOfPlace || row.TypeofPlace || 'N/A',
                    dateReported: row.dateReported || row.datereported || new Date().toISOString().split('T')[0],
                    timeReported: row.timeReported || row.timereported || '00:00',
                    dateCommitted: row.dateCommitted || row.datecommitted || new Date().toISOString().split('T')[0],
                    timeCommitted: row.timeCommitted || row.timecommitted || '00:00',
                    modeOfReporting: row.mode_reporting || row.modeOfReporting || row.mode_Reporting || 'N/A',
                    stageOfFelony: row.stageoffelony || row.stageOfFelony || row.stageofFelony || 'N/A',
                    offense: row.offense || row.Offense || 'N/A',
                    victim: parseVictimDetails(firstVictim),
                    suspect: parseSuspectDetails(firstSuspect),
                    suspectMotive: row.suspectMotive || row.suspectmotive || 'N/A',
                    narrative: row.narrative || row.Narrative || 'N/A',
                    status: row.casestatus || row.caseStatus || row.status || 'Solved',
                    location: {
                        lat: parseFloat(row.lat || row.Lat) || 14.4445,
                        lng: parseFloat(row.lng || row.Lng) || 120.9939,
                    },
                };
            });
    };


    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            delimitersToGuess: ['\t', ',', '|', ';'],
            transformHeader: (header: string) => header.trim(),
            complete: (results) => {
                if (!results.data || results.data.length === 0) {
                    setError('No data found in file');
                    setLoading(false);
                    return;
                }

                const cleanData = results.data.filter((row: any) => {
                    return Object.values(row).some(val =>
                        val !== '' && val !== null && val !== undefined
                    );
                });

                const transformed = transformToFormData(cleanData as RawCrimeReport[]);
                setCrimeData(transformed);
                setReportStatuses(new Map());
                setLoading(false);
            },
            error: (err) => {
                console.error('Parse error:', err);
                setError(`Failed to parse file: ${err.message}`);
                setLoading(false);
            }
        });
    };

    const handleAccept = async (report: CrimeForm, index: number) => {
        setSubmitting(index);
        try {
            const response = await fetch('/api/report/addReport', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ report })
            });

            const data = await response.json();

            if (response.ok) {
                setReportStatuses(prev => new Map(prev).set(index, 'accepted'));
            } else {
                alert(`Failed to submit report: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Error submitting report:', err);
            alert('Failed to submit report. Please check console for details.');
        } finally {
            setSubmitting(null);
        }
    };

    const handleReject = (index: number) => {
        setReportStatuses(prev => new Map(prev).set(index, 'rejected'));
    };

    const exportAsJSON = () => {
        const json = JSON.stringify(crimeData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'crime-reports.json';
        a.click();
    };

    const getStatusBadge = (status: ReportStatus) => {
        switch (status) {
            case 'accepted':
                return <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">✓ Accepted</span>;
            case 'rejected':
                return <span className="px-3 py-1 bg-red-600 text-white text-sm rounded-full">✗ Rejected</span>;
            default:
                return null;
        }
    };

    const pendingCount = crimeData.length - reportStatuses.size;
    const acceptedCount = Array.from(reportStatuses.values()).filter(s => s === 'accepted').length;
    const rejectedCount = Array.from(reportStatuses.values()).filter(s => s === 'rejected').length;

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Crime Report Data Transformer</h1>

                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
                    <label className="block text-lg mb-3">Upload Crime Report (TSV/CSV)</label>
                    <input
                        type="file"
                        accept=".csv,.tsv,.txt"
                        onChange={handleFileUpload}
                        className="block w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-slate-700 file:text-white hover:file:bg-slate-600 cursor-pointer"
                    />
                    {error && (
                        <p className="mt-3 text-red-400">{error}</p>
                    )}

                    <details className="mt-4">
                        <summary className="cursor-pointer text-slate-300 hover:text-white font-semibold">
                            📋 View Expected CSV Format
                        </summary>
                        <div className="mt-3 bg-slate-900 p-4 rounded border border-slate-600 overflow-x-auto">
                            <p className="text-sm text-slate-400 mb-2">Your CSV file should contain these columns:</p>
                            <div className="text-xs font-mono bg-slate-950 p-3 rounded mb-3 overflow-x-auto">
                                <div className="text-green-400 mb-2">Required Columns:</div>
                                <div className="text-slate-300 space-y-1">
                                    <div>• <span className="text-blue-400">barangay</span> - Name of the barangay</div>
                                    <div>• <span className="text-blue-400">street</span> - Street address</div>
                                    <div>• <span className="text-blue-400">typeofPlace</span> - Type of location</div>
                                    <div>• <span className="text-blue-400">dateReported</span> - Date reported (YYYY-MM-DD)</div>
                                    <div>• <span className="text-blue-400">timeReported</span> - Time reported (HH:MM)</div>
                                    <div>• <span className="text-blue-400">dateCommitted</span> - Date committed (YYYY-MM-DD)</div>
                                    <div>• <span className="text-blue-400">timeCommitted</span> - Time committed (HH:MM)</div>
                                    <div>• <span className="text-blue-400">mode_reporting</span> - How it was reported</div>
                                    <div>• <span className="text-blue-400">stageoffelony</span> - Stage of felony</div>
                                    <div>• <span className="text-blue-400">offense</span> - Type of offense</div>
                                    <div>• <span className="text-blue-400">victim</span> - Format: Name (age/gender/harmed/nationality/occupation)</div>
                                    <div>• <span className="text-blue-400">suspect</span> - Format: Name (age/gender/status/nationality/occupation)</div>
                                    <div>• <span className="text-blue-400">suspectMotive</span> - Motive of suspect</div>
                                    <div>• <span className="text-blue-400">narrative</span> - Incident description</div>
                                    <div>• <span className="text-blue-400">casestatus</span> or <span className="text-blue-400">status</span> - Status of the case</div>
                                    <div>• <span className="text-blue-400">lat</span> - Latitude coordinate</div>
                                    <div>• <span className="text-blue-400">lng</span> - Longitude coordinate</div>
                                </div>
                            </div>

                            <div className="text-xs font-mono bg-slate-950 p-3 rounded">
                                <div className="text-amber-400 mb-2">Example Row:</div>
                                <div className="text-slate-300 whitespace-pre overflow-x-auto">
                                    {`barangay,street,typeofPlace,dateReported,timeReported,dateCommitted,timeCommitted,mode_reporting,stageoffelony,offense,victim,suspect,suspectMotive,narrative,casestatus,lat,lng
Almanza Uno,Main St,Residential,2024-01-15,14:30,2024-01-15,13:00,Walk-in,Consummated,Theft,Juan Dela Cruz (35/Male/Minor/Filipino/Driver),Unknown (N/A/Male/At Large/Filipino/Unemployed),Robbery,Motorcycle theft incident,Under Investigation,14.4445,120.9939`}
                                </div>
                            </div>

                            <div className="mt-3 text-xs text-slate-400">
                                <p className="font-semibold text-yellow-400 mb-1">Notes:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Column names are case-insensitive</li>
                                    <li>Victim/Suspect format: Name (age/gender/harmed or status/nationality/occupation)</li>
                                    <li>Dates should be in YYYY-MM-DD format</li>
                                    <li>Times should be in HH:MM format (24-hour)</li>
                                </ul>
                            </div>
                        </div>
                    </details>
                </div>

                {loading && (
                    <div className="text-center py-12">
                        <p className="text-xl">Loading data...</p>
                    </div>
                )}

                {!loading && crimeData.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <div className="flex gap-4 text-sm">
                                <span className="text-slate-400">Total: <span className="text-white font-semibold">{crimeData.length}</span></span>
                                <span className="text-slate-400">Pending: <span className="text-yellow-400 font-semibold">{pendingCount}</span></span>
                                <span className="text-slate-400">Accepted: <span className="text-green-400 font-semibold">{acceptedCount}</span></span>
                                <span className="text-slate-400">Rejected: <span className="text-red-400 font-semibold">{rejectedCount}</span></span>
                            </div>
                            <button
                                onClick={exportAsJSON}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            >
                                Export as JSON
                            </button>
                        </div>

                        {crimeData.map((report, index) => {
                            const status = reportStatuses.get(index);
                            const isProcessed = status === 'accepted' || status === 'rejected';

                            return (
                                <div key={index} className={`bg-slate-800 border rounded-lg p-6 transition-all ${status === 'accepted' ? 'border-green-600' :
                                    status === 'rejected' ? 'border-red-600' :
                                        'border-slate-700 hover:border-slate-600'
                                    }`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <h2 className="text-xl font-semibold text-slate-100">Report #{index + 1}</h2>
                                        <div className="flex gap-2 items-center">
                                            {getStatusBadge(status || 'pending')}
                                            {!isProcessed && (
                                                <>
                                                    <button
                                                        onClick={() => handleAccept(report, index)}
                                                        disabled={submitting === index}
                                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {submitting === index ? 'Submitting...' : 'Accept'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(index)}
                                                        disabled={submitting === index}
                                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* Barangay Dropdown */}
                                        <div>
                                            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-1">Barangay</h3>
                                            <p className="text-slate-100">{report.barangay}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-1">Street</h3>
                                            <p className="text-slate-100">{report.street}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-1">Type of Place</h3>
                                            <p className="text-slate-100">{report.typeOfPlace}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-1">Date Reported</h3>
                                            <p className="text-slate-100">{report.dateReported}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-1">Time Reported</h3>
                                            <p className="text-slate-100">{report.timeReported}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-1">Date Committed</h3>
                                            <p className="text-slate-100">{report.dateCommitted}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-1">Time Committed</h3>
                                            <p className="text-slate-100">{report.timeCommitted}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-1">Mode of Reporting</h3>
                                            <p className="text-slate-100">{report.modeOfReporting}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-1">Stage of Felony</h3>
                                            <p className="text-slate-100">{report.stageOfFelony}</p>
                                        </div>

                                        {/* Offense Dropdown */}
                                        <div className="md:col-span-2 lg:col-span-3">
                                            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-1">Offense</h3>
                                            <div className="text-xs text-slate-500 mb-1">Original: {report.offense}</div>
                                            <select
                                                value={report.offense}
                                                onChange={(e) => handleDropdownChange(index, 'offense', e.target.value)}
                                                className="bg-slate-700 text-white rounded p-2 w-full"
                                            >
                                                <option value="">Select Offense</option>
                                                {offenseCategories.map((cat, i) => (
                                                    <optgroup key={i} label={cat.label}>
                                                        {cat.offenses.map((offense, j) => (
                                                            <option key={j} value={offense}>{offense}</option>
                                                        ))}
                                                    </optgroup>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="md:col-span-2 lg:col-span-3 bg-slate-700/50 p-4 rounded">
                                            <h3 className="text-sm font-semibold text-amber-400 uppercase mb-2">Victim Details</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                                <div>
                                                    <span className="text-slate-400">Name:</span>
                                                    <p className="text-slate-100">{report.victim.name}</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400">Age:</span>
                                                    <p className="text-slate-100">{report.victim.age}</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400">Gender:</span>
                                                    <p className="text-slate-100">{report.victim.gender}</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400">Harmed:</span>
                                                    <p className="text-slate-100">{report.victim.harmed}</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400">Nationality:</span>
                                                    <p className="text-slate-100">{report.victim.nationality}</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400">Occupation:</span>
                                                    <p className="text-slate-100">{report.victim.occupation}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 lg:col-span-3 bg-slate-700/50 p-4 rounded">
                                            <h3 className="text-sm font-semibold text-red-400 uppercase mb-2">Suspect Details</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                                <div>
                                                    <span className="text-slate-400">Name:</span>
                                                    <p className="text-slate-100">{report.suspect.name}</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400">Age:</span>
                                                    <p className="text-slate-100">{report.suspect.age}</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400">Gender:</span>
                                                    <p className="text-slate-100">{report.suspect.gender}</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400">Status:</span>
                                                    <p className="text-slate-100">{report.suspect.status}</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400">Nationality:</span>
                                                    <p className="text-slate-100">{report.suspect.nationality}</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400">Occupation:</span>
                                                    <p className="text-slate-100">{report.suspect.occupation}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-1">Suspect Motive</h3>
                                            <p className="text-slate-100">{report.suspectMotive}</p>
                                        </div>

                                        <div className="md:col-span-2 lg:col-span-3">
                                            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-1">Narrative</h3>
                                            <p className="text-slate-100 text-sm leading-relaxed">{report.narrative}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-1">Status</h3>
                                            <p className="text-slate-100">{report.status}</p>
                                        </div>

                                        <div className="md:col-span-2">
                                            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-1">Location</h3>
                                            <p className="text-slate-100">Lat: {report.location.lat}, Lng: {report.location.lng}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!loading && crimeData.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        <p className="text-xl">No data loaded. Please upload a file.</p>
                    </div>
                )}
            </div>
        </div>
    );
}