'use client'

import React, { useState } from "react";

const ReportForm = () => {
    const [crime, setCrime] = useState("");
    const [description, setDescription] = useState("");
    const [barangay, setBarangay] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [complainantName, setComplainantName] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [address, setAddress] = useState("");
    const [suspectName, setSuspectName] = useState("");
    const [witnessName, setWitnessName] = useState("");

    const barangays = [
        "Almanza Dos",
        "Almanza Uno",
        "B.F. CAA International Village",
        "Aldana",
        "Manuyo Dos",
        "Manuyo Uno",
        "Pamplona Dos",
        "Pamplona Tres",
        "Pamplona Uno",
        "Pilar",
        "Pulang Lupa Dos",
        "Pulang Lupa Uno",
        "Talon Dos",
        "Talon Kuatro",
        "Talon Singko",
        "Talon Tres",
        "Talon Uno",
        "Zapote"
    ];

    const crimes = {
        serious: [
            "Theft / Robbery",
            "Physical Assault",
            "Domestic Violence",
            "Illegal Drugs",
            "Sexual Harassment",
            "Murder / Homicide",
            "Human Trafficking",
            "Kidnapping",
            "Fraud / Scam",
        ],
        moderate: [
            "Vandalism",
            "Trespassing",
            "Illegal Gambling",
            "Public Disturbance / Fighting",
            "Threats / Verbal Harassment",
            "Cybercrime / Online Harassment",
            "Stalking",
            "Animal Cruelty",
        ],
        minor: [
            "Noise Complaint",
            "Curfew Violation",
            "Littering / Illegal Dumping",
            "Drinking in Public",
            "Smoking in Prohibited Areas",
            "Jaywalking",
            "Loitering",
            "Minor Traffic Violation",
            "Unleashed Pets / Stray Animals",
            "Illegal Parking",
        ],
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({
            complainantName,
            contactNumber,
            address,
            crime,
            description,
            barangay,
            date,
            suspectName,
            witnessName,
        });
        alert("Report submitted successfully!");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#0F1120] text-white p-6">
            <div className="w-full max-w-2xl bg-[#1C1E2E] p-6 rounded-2xl shadow-lg">
                <h1 className="text-2xl font-bold mb-6">Crime Report Form</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Complainant Info */}
                    <div>
                        <label className="block mb-2 text-sm font-medium">Complainant Name</label>
                        <input
                            type="text"
                            value={complainantName}
                            onChange={(e) => setComplainantName(e.target.value)}
                            className="w-full p-3 rounded-lg bg-[#2A2C3F] text-white focus:outline-none"
                            placeholder="Full name"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Contact Number</label>
                        <input
                            type="tel"
                            value={contactNumber}
                            onChange={(e) => {
                                const value = e.target.value;
                                // only allow numbers & max 11 chars
                                if (/^\d{0,11}$/.test(value)) {
                                    setContactNumber(value);
                                }
                            }}
                            maxLength={11}
                            className="w-full p-3 rounded-lg bg-[#2A2C3F] text-white focus:outline-none"
                            placeholder="09XXXXXXXXX"
                            required
                        />
                        {contactNumber.length > 0 && contactNumber.length !== 11 && (
                            <p className="text-red-400 text-xs mt-1">Contact number must be exactly 11 digits</p>
                        )}
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Address</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full p-3 rounded-lg bg-[#2A2C3F] text-white focus:outline-none"
                            placeholder="House No. / Street / Barangay"
                            required
                        />
                    </div>

                    {/* Crime Type */}
                    <div>
                        <label className="block mb-2 text-sm font-medium">Crime Type</label>
                        <select
                            value={crime}
                            onChange={(e) => setCrime(e.target.value)}
                            className="w-full p-3 rounded-lg bg-[#2A2C3F] text-white focus:outline-none"
                            required
                        >
                            <option value="">Select a crime</option>

                            {/* Serious Crimes */}
                            <optgroup label="🚨 Serious Crimes">
                                {crimes.serious.map((c, idx) => (
                                    <option key={idx} value={c} className="text-red-500">
                                        {c}
                                    </option>
                                ))}
                            </optgroup>

                            {/* Moderate Offenses */}
                            <optgroup label="⚖️ Moderate Offenses">
                                {crimes.moderate.map((c, idx) => (
                                    <option key={idx} value={c} className="text-yellow-400">
                                        {c}
                                    </option>
                                ))}
                            </optgroup>

                            {/* Minor Violations */}
                            <optgroup label="📝 Minor Violations">
                                {crimes.minor.map((c, idx) => (
                                    <option key={idx} value={c} className="text-green-400">
                                        {c}
                                    </option>
                                ))}
                            </optgroup>

                            <option value="Other" className="text-gray-300">Other</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block mb-2 text-sm font-medium">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full p-3 rounded-lg bg-[#2A2C3F] text-white focus:outline-none resize-none"
                            placeholder="Describe the incident..."
                            required
                        />
                    </div>

                    {/* Barangay */}
                    <div>
                        <label className="block mb-2 text-sm font-medium">Barangay</label>
                        <select
                            value={barangay}
                            onChange={(e) => setBarangay(e.target.value)}
                            className="w-full p-3 rounded-lg bg-[#2A2C3F] text-white focus:outline-none"
                            required
                        >
                            <option value="">Select a barangay</option>
                            {barangays.map((b, idx) => (
                                <option key={idx} value={b}>
                                    {b}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date & Time */}
                    {/* Date */}
                    <div>
                        <label className="block mb-2 text-sm font-medium">Date of Incident</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-3 rounded-lg bg-[#2A2C3F] text-white focus:outline-none"
                            required
                        />
                    </div>

                    {/* Time */}
                    <div>
                        <label className="block mb-2 text-sm font-medium">Time of Incident</label>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full p-3 rounded-lg bg-[#2A2C3F] text-white focus:outline-none"
                            required
                        />
                    </div>


                    {/* Suspect / Witness Info */}
                    <div>
                        <label className="block mb-2 text-sm font-medium">Suspect Name (if known)</label>
                        <input
                            type="text"
                            value={suspectName}
                            onChange={(e) => setSuspectName(e.target.value)}
                            className="w-full p-3 rounded-lg bg-[#2A2C3F] text-white focus:outline-none"
                            placeholder="Name of suspect"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Witness Name (if any)</label>
                        <input
                            type="text"
                            value={witnessName}
                            onChange={(e) => setWitnessName(e.target.value)}
                            className="w-full p-3 rounded-lg bg-[#2A2C3F] text-white focus:outline-none"
                            placeholder="Name of witness"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
                    >
                        Submit Report
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReportForm;
