'use client'

import React, { useState } from "react";
import useReportStore from "@/utils/zustand/ReportStore";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// ✅ Custom marker (fixes broken default icon in Next.js)
const customIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// ✅ Component that handles map clicks
function LocationMarker({ setCoords }: { setCoords: (coords: [number, number]) => void }) {
    const [position, setPosition] = React.useState<[number, number] | null>(null);

    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            setCoords([lat, lng]);
            alert(`Coordinates selected: ${lat}, ${lng}`);
        },
    });

    return position ? <Marker position={position} icon={customIcon} /> : null;
}

const ReportForm = () => {
    const { addReports } = useReportStore();

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
    const [coords, setCoords] = useState<[number, number] | null>(null);

    const barangays = [
        "Almanza Dos", "Almanza Uno", "B.F. CAA International Village", "Aldana",
        "Manuyo Dos", "Manuyo Uno", "Pamplona Dos", "Pamplona Tres", "Pamplona Uno",
        "Pilar", "Pulang Lupa Dos", "Pulang Lupa Uno", "Talon Dos", "Talon Kuatro",
        "Talon Singko", "Talon Tres", "Talon Uno", "Zapote"
    ];

    const crimes = {
        serious: ["Theft / Robbery", "Physical Assault", "Domestic Violence", "Illegal Drugs", "Sexual Harassment", "Murder / Homicide", "Human Trafficking", "Kidnapping", "Fraud / Scam"],
        moderate: ["Vandalism", "Trespassing", "Illegal Gambling", "Public Disturbance / Fighting", "Threats / Verbal Harassment", "Cybercrime / Online Harassment", "Stalking", "Animal Cruelty"],
        minor: ["Noise Complaint", "Curfew Violation", "Littering / Illegal Dumping", "Drinking in Public", "Smoking in Prohibited Areas", "Jaywalking", "Loitering", "Minor Traffic Violation", "Unleashed Pets / Stray Animals", "Illegal Parking"]
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let report: any = {
            complainantName,
            contactNumber,
            address,
            crime,
            description,
            barangay,
            time,
            date,
            suspectName,
            witnessName,
        };

        // ✅ Add coordinates if selected
        if (coords) {
            report.location = {
                type: "Point",
                coordinates: [coords[1], coords[0]], // [lng, lat]
            };
        }

        await addReports(report);
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
                            <optgroup label="🚨 Serious Crimes">
                                {crimes.serious.map((c, idx) => (
                                    <option key={idx} value={c} className="text-red-500">{c}</option>
                                ))}
                            </optgroup>
                            <optgroup label="⚖️ Moderate Offenses">
                                {crimes.moderate.map((c, idx) => (
                                    <option key={idx} value={c} className="text-yellow-500">{c}</option>
                                ))}
                            </optgroup>
                            <optgroup label="📝 Minor Violations">
                                {crimes.minor.map((c, idx) => (
                                    <option key={idx} value={c} className="text-green-500">{c}</option>
                                ))}
                            </optgroup>
                            <option value="Other">Other</option>
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
                                <option key={idx} value={b}>{b}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date & Time */}
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

                    {/* Suspect / Witness */}
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

                    {/* 📍 Map Section */}
                    <div className="mt-8">
                        <h2 className="text-lg font-semibold mb-2">Select Incident Location</h2>
                        <div className="h-[400px] w-full rounded-lg overflow-hidden">
                            <MapContainer
                                center={[14.45, 120.98]} // 📍 Las Piñas
                                zoom={13}
                                style={{ height: "100%", width: "100%" }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="&copy; OpenStreetMap contributors"
                                />
                                <LocationMarker setCoords={setCoords} />
                            </MapContainer>
                        </div>
                        {coords && (
                            <p className="mt-2 text-sm text-green-400">
                                Selected Location: {coords[0].toFixed(5)}, {coords[1].toFixed(5)}
                            </p>
                        )}
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
