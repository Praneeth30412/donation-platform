import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LocationMarker({ setLocation }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      reverseGeocode(lat, lng, setLocation);
    },
  });

  return position ? <Marker position={position} /> : null;
}

// Convert GPS → Human readable address
async function reverseGeocode(lat, lon, setLocation) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  const data = await fetch(url).then((res) => res.json());
  setLocation(data.display_name);
}

export default function LocationPicker({ setLocation }) {
  return (
    <div style={{ height: "300px", marginTop: "10px" }}>
      <MapContainer
        center={[16.5062, 80.6480]} // center at Vijayawada (or India)
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker setLocation={setLocation} />
      </MapContainer>
    </div>
  );
}
