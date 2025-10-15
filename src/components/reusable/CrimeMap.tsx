"use client";
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface CrimeMapProps {
    setCoords: (coords: [number, number]) => void;
    coords?: [number, number];
}

const CrimeMap: React.FC<CrimeMapProps> = ({ setCoords, coords = [14.4445, 120.9939] }) => {
    const [position, setPosition] = React.useState<[number, number]>(coords);

    useEffect(() => {
        // update marker when parent (manual input) changes
        setPosition(coords);
    }, [coords]);

    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setPosition([lat, lng]);
                setCoords([lat, lng]);
            },
        });
        return null;
    };

    return (
        <MapContainer
            center={position}
            zoom={15}
            className="h-full w-full"
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickHandler />
            <Marker position={position} icon={markerIcon} />
        </MapContainer>
    );
};

export default CrimeMap;
