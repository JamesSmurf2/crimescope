"use client";

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix marker icon issue in Leaflet (important for Next.js)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
    iconUrl: markerIcon.src ?? markerIcon,
    iconRetinaUrl: markerIcon2x.src ?? markerIcon2x,
    shadowUrl: markerShadow.src ?? markerShadow,
});

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

// -------------------- Barangays --------------------
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

// -------------------- Offense Hierarchy --------------------
const offenseCategories = [
    {
        label: "Index Crimes",
        color: "text-red-500 font-semibold",
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
        label: "Non-Index Crimes",
        color: "text-yellow-500 font-semibold",
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
        label: "Traffic Violations",
        color: "text-blue-500 font-semibold",
        offenses: [
            "Reckless Driving",
            "Illegal Parking",
            "Overspeeding",
            "Driving Without License",
            "Road Accident",
        ],
    },
    {
        label: "Ordinance Violations",
        color: "text-gray-500 font-semibold",
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

// -------------------- Map Click Handler --------------------
function LocationSelector({
    setForm,
}: {
    setForm: React.Dispatch<React.SetStateAction<CrimeForm>>;
}) {
    useMapEvents({
        click(e) {
            setForm((prev) => ({
                ...prev,
                location: { lat: e.latlng.lat, lng: e.latlng.lng },
            }));
        },
    });
    return null;
}

// -------------------- Main Component --------------------
const CrimeReportForm = () => {
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
        // Default to Las Piñas City center
        location: { lat: 14.4445, lng: 120.9939 },
    });

    // Auto-generate Blotter Number
    useEffect(() => {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 9000) + 1000;
        setForm((prev) => ({ ...prev, blotterNo: `BLTR-${year}-${random}` }));
    }, []);

    // Handlers
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
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

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const parsed = parseFloat(value);

        setForm((prev) => ({
            ...prev,
            location: {
                ...(prev.location ?? { lat: 0, lng: 0 }),
                [name]: parsed,
            },
        }));
    };

    return (
        <div className="p-4 sm:p-6 max-w-6xl mx-auto text-white">
            <h1 className="text-3xl font-bold mb-6 text-center">
                Barangay Crime Report Form
            </h1>

            <form className="grid gap-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-4">
                    <input
                        name="blotterNo"
                        value={form.blotterNo}
                        readOnly
                        placeholder="Blotter No"
                        className="input input-bordered w-full text-black bg-white"
                    />
                    <select
                        name="barangay"
                        value={form.barangay}
                        onChange={handleChange}
                        className="select select-bordered w-full text-black bg-white"
                    >
                        <option value="">Select Barangay</option>
                        {barangays.map((b) => (
                            <option key={b} value={b}>
                                {b}
                            </option>
                        ))}
                    </select>
                    <input
                        name="street"
                        value={form.street}
                        onChange={handleChange}
                        placeholder="Street"
                        className="input input-bordered w-full text-black bg-white"
                    />
                    <select
                        name="typeOfPlace"
                        value={form.typeOfPlace}
                        onChange={handleChange}
                        className="select select-bordered w-full text-black bg-white"
                    >
                        <option value="">Select Type of Place</option>
                        <option value="Along the Street">Along the Street</option>
                        <option value="Residential (House/Condo)">
                            Residential (House/Condo)
                        </option>
                        <option value="Commercial/Business Establishment">
                            Commercial/Business Establishment
                        </option>
                    </select>
                </div>

                {/* Offense */}
                <div>
                    <label className="font-semibold mb-1 block">Select Offense</label>
                    <select
                        name="offense"
                        value={form.offense}
                        onChange={handleChange}
                        className="select select-bordered w-full text-black bg-white"
                    >
                        <option value="">Select an offense</option>
                        {offenseCategories.map((group) => (
                            <optgroup
                                key={group.label}
                                label={group.label}
                                className={group.color}
                            >
                                {group.offenses.map((off) => (
                                    <option key={off}>{off}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>

                {/* Victim */}
                <div>
                    <h2 className="font-bold mt-6">Victim Information</h2>
                    <div className="grid md:grid-cols-6 gap-4">
                        <input
                            name="name"
                            placeholder="Full Name"
                            value={form.victim.name}
                            onChange={(e) => handleNestedChange(e, "victim")}
                            className="input input-bordered text-black bg-white w-full"
                        />
                        <input
                            name="age"
                            placeholder="Age"
                            value={form.victim.age}
                            onChange={(e) => handleNestedChange(e, "victim")}
                            className="input input-bordered text-black bg-white w-full"
                        />
                        <select
                            name="gender"
                            value={form.victim.gender}
                            onChange={(e) => handleNestedChange(e, "victim")}
                            className="select select-bordered text-black bg-white w-full"
                        >
                            <option value="">Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        <select
                            name="harmed"
                            value={form.victim.harmed}
                            onChange={(e) => handleNestedChange(e, "victim")}
                            className="select select-bordered text-black bg-white w-full"
                        >
                            <option value="">Harmed / Unharmed</option>
                            <option value="Harmed">Harmed</option>
                            <option value="Unharmed">Unharmed</option>
                        </select>
                        <input
                            name="nationality"
                            placeholder="Nationality"
                            value={form.victim.nationality}
                            onChange={(e) => handleNestedChange(e, "victim")}
                            className="input input-bordered text-black bg-white w-full"
                        />
                        <input
                            name="occupation"
                            placeholder="Occupation"
                            value={form.victim.occupation}
                            onChange={(e) => handleNestedChange(e, "victim")}
                            className="input input-bordered text-black bg-white w-full"
                        />
                    </div>
                </div>

                {/* Suspect */}
                <div>
                    <h2 className="font-bold mt-6">Suspect Information</h2>
                    <div className="grid md:grid-cols-6 gap-4">
                        <input
                            name="name"
                            placeholder="Full Name"
                            value={form.suspect.name}
                            onChange={(e) => handleNestedChange(e, "suspect")}
                            className="input input-bordered text-black bg-white w-full"
                        /> 
                        <input
                            name="age"
                            placeholder="Age"
                            value={form.suspect.age}
                            onChange={(e) => handleNestedChange(e, "suspect")}
                            className="input input-bordered text-black bg-white w-full"
                        />
                        <select
                            name="gender"
                            value={form.suspect.gender}
                            onChange={(e) => handleNestedChange(e, "suspect")}
                            className="select select-bordered text-black bg-white w-full"
                        >
                            <option value="">Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        <select
                            name="status"
                            value={form.suspect.status}
                            onChange={(e) => handleNestedChange(e, "suspect")}
                            className="select select-bordered text-black bg-white w-full"
                        >
                            <option value="">Status</option>
                            <option value="Arrested">Arrested</option>
                            <option value="Detained">Detained</option>
                            <option value="At Large">At Large</option>
                        </select>
                        <input
                            name="nationality"
                            placeholder="Nationality"
                            value={form.suspect.nationality}
                            onChange={(e) => handleNestedChange(e, "suspect")}
                            className="input input-bordered text-black bg-white w-full"
                        />
                        <input
                            name="occupation"
                            placeholder="Occupation"
                            value={form.suspect.occupation}
                            onChange={(e) => handleNestedChange(e, "suspect")}
                            className="input input-bordered text-black bg-white w-full"
                        />
                    </div>
                </div>

                {/* Motive & Narrative */}
                <div>
                    <label className="font-semibold mb-1 block">Suspect Motive</label>
                    <input
                        name="suspectMotive"
                        placeholder="Enter suspect motive"
                        value={form.suspectMotive}
                        onChange={handleChange}
                        className="input input-bordered w-full text-black bg-white"
                    />
                </div>

                <div>
                    <label className="font-semibold mb-1 block">
                        Narrative / Incident Description
                    </label>
                    <textarea
                        name="narrative"
                        placeholder="Write a brief description of the incident..."
                        value={form.narrative}
                        onChange={handleChange}
                        className="textarea textarea-bordered w-full h-32 text-black bg-white"
                    />
                </div>

                {/* Case Status */}
                <div>
                    <label className="font-semibold mb-1 block">Case Status</label>
                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="select select-bordered w-full text-black bg-white"
                    >
                        <option value="Solved">Solved</option>
                        <option value="Cleared">Cleared</option>
                        <option value="Unsolved">Unsolved</option>
                    </select>
                </div>

                {/* Coordinates + Map Section */}
                <div>
                    <h2 className="font-bold mt-6">Enter Coordinates</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <input
                            name="lat"
                            type="number"
                            placeholder="Latitude"
                            value={form.location?.lat ?? ""}
                            onChange={handleLocationChange}
                            className="input input-bordered text-black bg-white"
                        />
                        <input
                            name="lng"
                            type="number"
                            placeholder="Longitude"
                            value={form.location?.lng ?? ""}
                            onChange={handleLocationChange}
                            className="input input-bordered text-black bg-white"
                        />
                    </div>

                    {/* Leaflet Map */}
                    <MapContainer
                        center={[form.location?.lat ?? 14.4445, form.location?.lng ?? 120.9939]}
                        zoom={13}
                        style={{
                            height: "400px",
                            width: "100%",
                            borderRadius: "12px",
                            overflow: "hidden",
                        }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {form.location && (
                            <Marker position={[form.location.lat, form.location.lng]} />
                        )}
                        <LocationSelector setForm={setForm} />
                    </MapContainer>
                    <p className="mt-2 text-sm text-gray-300">
                        📍 Click anywhere on the map to set the crime location (Las Piñas area).
                    </p>
                </div>

                {/* Submit */}
                <button
                    type="button"
                    onClick={() => console.log(form)}
                    className="btn btn-primary w-full mt-4"
                >
                    Submit Report
                </button>
            </form>
        </div>
    );
};

export default CrimeReportForm;
