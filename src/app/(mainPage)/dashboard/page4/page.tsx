"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const CrimeMap = dynamic(() => import("@/components/reusable/CrimeMap"), { ssr: false });

import useReportStore from "@/utils/zustand/ReportStore";

// -------------------- Types --------------------
type VictimInfo = {
    name: string;
    age: string;
    gender: string;
    harmed: string;
    nationality: string;
    occupation: string;
};

type SuspectInfo = {
    name: string;
    age: string;
    gender: string;
    status: string;
    nationality: string;
    occupation: string;
};

type CrimeForm = {
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
    victim: VictimInfo;
    suspect: SuspectInfo;
    suspectMotive: string;
    narrative: string;
    status: string;
    location: { lat: number; lng: number } | null;
};

// -------------------- Data Lists --------------------
const barangays = [
    "Almanza Dos",
    "Almanza Uno",
    "B.F. CAA International Village",
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
const CrimeReportForm = () => {
    const { addReports } = useReportStore()

    const [form, setForm] = useState<CrimeForm>({
        blotterNo: "",
        dateEncoded: new Date().toLocaleString(),
        barangay: "",
        street: "",
        typeOfPlace: "",
        dateReported: "",
        timeReported: "",
        dateCommitted: "",
        timeCommitted: "",
        modeOfReporting: "",
        stageOfFelony: "",
        offense: "",
        victim: {
            name: "",
            age: "",
            gender: "",
            harmed: "",
            nationality: "",
            occupation: "",
        },
        suspect: {
            name: "",
            age: "",
            gender: "",
            status: "",
            nationality: "",
            occupation: "",
        },
        suspectMotive: "",
        narrative: "",
        status: "Solved",
        location: { lat: 14.4445, lng: 120.9939 },
    });

    const handleSubmit = () => {
        const {
            blotterNo,
            dateEncoded,
            barangay,
            street,
            typeOfPlace,
            dateReported,
            timeReported,
            dateCommitted,
            timeCommitted,
            modeOfReporting,
            stageOfFelony,
            offense,
            victim,
            suspect,
            suspectMotive,
            narrative,
            status,
            location,
        } = form;

        // 🛑 Basic validation
        if (!blotterNo.trim()) return alert("Please enter the blotter number.");
        if (!dateEncoded.trim()) return alert("Date encoded is missing.");
        if (!barangay.trim()) return alert("Please select a Barangay.");
        if (!street.trim()) return alert("Please enter the Street.");
        if (!typeOfPlace.trim()) return alert("Please specify the Type of Place.");
        if (!dateReported.trim()) return alert("Please enter the Date Reported.");
        if (!timeReported.trim()) return alert("Please enter the Time Reported.");
        if (!dateCommitted.trim()) return alert("Please enter the Date Committed.");
        if (!timeCommitted.trim()) return alert("Please enter the Time Committed.");
        if (!modeOfReporting.trim()) return alert("Please select a Mode of Reporting.");
        if (!stageOfFelony.trim()) return alert("Please select a Stage of Felony.");
        if (!offense.trim()) return alert("Please select an Offense.");



        // 🗺️ Location validation
        if (!location || !location.lat || !location.lng)
            return alert("Please select a location on the map.");

        // 📝 Optional narrative check
        if (!narrative.trim()) return alert("Please enter the Narrative or Case Details.");

        // ✅ If all good, submit form
        addReports(form);
        console.log(form);

        alert("Form Submitted!")
        // Clear the form after
        // setForm({
        //     blotterNo: "",
        //     dateEncoded: new Date().toLocaleString(),
        //     barangay: "",
        //     street: "",
        //     typeOfPlace: "",
        //     dateReported: "",
        //     timeReported: "",
        //     dateCommitted: "",
        //     timeCommitted: "",
        //     modeOfReporting: "",
        //     stageOfFelony: "",
        //     offense: "",
        //     victim: {
        //         name: "",
        //         age: "",
        //         gender: "",
        //         harmed: "",
        //         nationality: "",
        //         occupation: "",
        //     },
        //     suspect: {
        //         name: "",
        //         age: "",
        //         gender: "",
        //         status: "",
        //         nationality: "",
        //         occupation: "",
        //     },
        //     suspectMotive: "",
        //     narrative: "",
        //     status: "Solved",
        //     location: { lat: 14.4445, lng: 120.9939 },
        // });
    };


    // Auto-generate blotter number
    useEffect(() => {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 9000) + 1000;
        setForm((prev) => ({ ...prev, blotterNo: `BLTR-${year}-${random}` }));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleNestedChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        category: "victim" | "suspect"
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [category]: { ...prev[category], [name]: value },
        }));
    };

    const handleSetCoords = (coords: [number, number]) => {
        setForm((prev) => ({ ...prev, location: { lat: coords[0], lng: coords[1] } }));
    };

    const inputClass =
        "bg-[#1C1E2E] text-white px-3 py-2 rounded-lg w-full focus:outline-none border border-gray-700";
    const labelClass = "font-semibold text-gray-300 mb-1 block";

    return (
        <div className="min-h-screen bg-[#0F1120] text-white p-6 flex justify-center">
            <div className="w-full max-w-[1100px] space-y-6">
                <h1 className="text-3xl font-bold text-center border-b border-gray-700 pb-3">
                    Barangay Crime Report Form
                </h1>

                <form className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Blotter Number</label>
                            <input name="blotterNo" value={form.blotterNo} readOnly className={inputClass} />
                        </div>

                        <div>
                            <label className={labelClass}>Barangay</label>
                            <select name="barangay" value={form.barangay} onChange={handleChange} className={inputClass}>
                                <option value="">Select Barangay</option>
                                {barangays.map((b) => (
                                    <option key={b}>{b}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>Street</label>
                            <input name="street" value={form.street} onChange={handleChange} className={inputClass} />
                        </div>

                        <div>
                            <label className={labelClass}>Type of Place</label>
                            <select name="typeOfPlace" value={form.typeOfPlace} onChange={handleChange} className={inputClass}>
                                <option value="">Select Type</option>
                                <option value="Along the Street">Along the Street</option>
                                <option value="Residential">Residential</option>
                                <option value="Commercial">Commercial</option>
                            </select>
                        </div>
                    </div>

                    {/* Offense */}
                    <div>
                        <label className={labelClass}>Offense</label>
                        <select name="offense" value={form.offense} onChange={handleChange} className={inputClass}>
                            <option value="">Select an offense</option>
                            {offenseCategories.map((group) => (
                                <optgroup key={group.label} label={group.label} className={group.color}>
                                    {group.offenses.map((off) => (
                                        <option key={off}>{off}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>

                    {/* Report & Incident Dates */}
                    <div className="bg-[#1C1E2E] p-4 rounded-xl space-y-3">
                        <h2 className="text-lg font-bold border-b border-gray-700 pb-2">Date and Time Information</h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Date Reported</label>
                                <input
                                    type="date"
                                    name="dateReported"
                                    value={form.dateReported}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Time Reported</label>
                                <input
                                    type="time"
                                    name="timeReported"
                                    value={form.timeReported}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Date Committed</label>
                                <input
                                    type="date"
                                    name="dateCommitted"
                                    value={form.dateCommitted}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Time Committed</label>
                                <input
                                    type="time"
                                    name="timeCommitted"
                                    value={form.timeCommitted}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mode of Reporting & Stage of Felony */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Mode of Reporting</label>
                            <select
                                name="modeOfReporting"
                                value={form.modeOfReporting}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="">Select Mode</option>
                                <option value="N/A">N/A</option>
                                <option value="In Person">In Person</option>
                                <option value="Phone Call">Phone Call</option>
                                <option value="Online">Online</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>Stage of Felony</label>
                            <select
                                name="stageOfFelony"
                                value={form.stageOfFelony}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="">Select Stage</option>
                                <option>N/A</option>
                                <option value="Attempted">Attempted</option>
                                <option value="Frustrated">Frustrated</option>
                                <option value="Consummated">Consummated</option>
                            </select>
                        </div>
                    </div>


                    {/* Victim Info */}
                    <div className="bg-[#1C1E2E] p-4 rounded-xl space-y-3">
                        <h2 className="text-lg font-bold border-b border-gray-700 pb-2">Victim Information</h2>
                        <div className="grid md:grid-cols-6 gap-3">
                            {Object.keys(form.victim).map((key) => {
                                if (key === "gender" || key === "harmed") {
                                    return (
                                        <select
                                            key={key}
                                            name={key}
                                            value={(form.victim as any)[key]}
                                            onChange={(e) => handleNestedChange(e, "victim")}
                                            className={inputClass}
                                        >
                                            <option value="">{key}</option>
                                            {key === "gender" && (
                                                <>
                                                    <option>N/A</option>
                                                    <option>Male</option>
                                                    <option>Female</option>
                                                </>
                                            )}
                                            {key === "harmed" && (
                                                <>
                                                    <option>N/A</option>
                                                    <option>Harmed</option>
                                                    <option>Unharmed</option>
                                                </>
                                            )}
                                        </select>
                                    );
                                }
                                return (
                                    <input
                                        key={key}
                                        name={key}
                                        placeholder={key}
                                        value={(form.victim as any)[key]}
                                        onChange={(e) => handleNestedChange(e, "victim")}
                                        className={inputClass}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Suspect Info */}
                    <div className="bg-[#1C1E2E] p-4 rounded-xl space-y-3">
                        <h2 className="text-lg font-bold border-b border-gray-700 pb-2">Suspect Information</h2>
                        <div className="grid md:grid-cols-6 gap-3">
                            {Object.keys(form.suspect).map((key) => {
                                if (key === "gender" || key === "status") {
                                    return (
                                        <select
                                            key={key}
                                            name={key}
                                            value={(form.suspect as any)[key]}
                                            onChange={(e) => handleNestedChange(e, "suspect")}
                                            className={inputClass}
                                        >
                                            <option value="">{key}</option>
                                            {key === "gender" && (
                                                <>
                                                    <option>N/A</option>
                                                    <option>Male</option>
                                                    <option>Female</option>
                                                </>
                                            )}
                                            {key === "status" && (
                                                <>
                                                    <option>N/A</option>
                                                    <option>Arrested</option>
                                                    <option>Detained</option>
                                                    <option>At Large</option>
                                                </>
                                            )}
                                        </select>
                                    );
                                }
                                return (
                                    <input
                                        key={key}
                                        name={key}
                                        placeholder={key}
                                        value={(form.suspect as any)[key]}
                                        onChange={(e) => handleNestedChange(e, "suspect")}
                                        className={inputClass}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Motive & Narrative */}
                    <div>
                        <label className={labelClass}>Suspect Motive</label>
                        <input
                            name="suspectMotive"
                            value={form.suspectMotive}
                            onChange={handleChange}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Narrative</label>
                        <textarea
                            name="narrative"
                            value={form.narrative}
                            onChange={handleChange}
                            className={`${inputClass} h-28`}
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className={labelClass}>Case Status</label>
                        <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                            <option value="Solved">Solved</option>
                            <option value="Cleared">Cleared</option>
                            <option value="Unsolved">Unsolved</option>
                        </select>
                    </div>

                    {/* Map */}
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Select Incident Location</h2>
                        <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-700">
                            <CrimeMap setCoords={handleSetCoords} />
                        </div>
                        {form.location && (
                            <p className="mt-2 text-sm text-green-400">
                                Selected Location: {form.location.lat.toFixed(5)}, {form.location.lng.toFixed(5)}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => handleSubmit()}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold mt-4"
                    >
                        Submit Report
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CrimeReportForm;