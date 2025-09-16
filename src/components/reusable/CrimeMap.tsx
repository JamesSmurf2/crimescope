"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// ✅ Custom marker (fixes broken default icon in Next.js)
const customIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// ✅ Handles map clicks & updates coordinates
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

export default function CrimeMap({ setCoords }: { setCoords: (coords: [number, number]) => void }) {
    return (
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
    );
}
