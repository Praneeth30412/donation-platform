/* Logistics.jsx — Live map tracking enabled (Leaflet + fallback) */
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  listRequests, listDonations, listDeliveries,
  createDelivery, updateDeliveryStatus
} from "./api.js";
import { updateDeliveryLocation } from "./api.js";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

/* small helper marker icon fix for Leaflet's default marker path issues */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Logistics() {
  const [requests, setRequests] = useState([]);
  const [donations, setDonations] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [assign, setAssign] = useState({ requestId: "", donationId: "", coordinator: "" });

  // map modal / selected delivery
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  // track watchId per delivery (for coordinator sharing)
  const watchIdsRef = useRef({}); // { deliveryId: watchId }

  async function load() {
    try {
      const [r, d, dl] = await Promise.all([listRequests(), listDonations(), listDeliveries()]);
      setRequests(r || []);
      setDonations(d || []);
      setDeliveries(dl || []);
    } catch (err) {
      console.error("Failed to load logistics data", err);
    }
  }

  useEffect(() => { load(); }, []);

  const availableRequests = useMemo(
    () => requests.filter(r => r.approved && !r.delivered && !r.deliveryId),
    [requests]
  );

  const availableDonations = useMemo(
    () => donations.filter(d => d.approved && !d.matchedRequestId),
    [donations]
  );

  async function assignDelivery(e) {
    e.preventDefault();
    if (!assign.requestId || !assign.donationId || !assign.coordinator) {
      return alert("Fill all fields");
    }
    await createDelivery(assign);
    setAssign({ requestId: "", donationId: "", coordinator: "" });
    await load();
    alert("Delivery assigned!");
  }

  async function progress(del, nextStatus) {
    await updateDeliveryStatus(del.id, nextStatus);
    await load();
  }

  // -------------------------
  // Location helpers (backend + fallback via localStorage)
  // -------------------------

  // Save location fallback
  function saveLocationLocal(deliveryId, lat, lon) {
    const key = `delivery_loc_${deliveryId}`;
    const payload = { lat, lon, ts: Date.now() };
    localStorage.setItem(key, JSON.stringify(payload));
  }

  // Read location fallback
  function readLocationLocal(deliveryId) {
    try {
      const raw = localStorage.getItem(`delivery_loc_${deliveryId}`);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  // Start sharing location for a delivery (coordinator device)
  async function startSharing(deliveryId) {
    if (!("geolocation" in navigator)) {
      alert("Geolocation not supported in this browser.");
      return;
    }

    // avoid double-watch
    if (watchIdsRef.current[deliveryId]) {
      alert("Already sharing location for this delivery.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      // try server endpoint first
      try {
        await updateDeliveryLocation(deliveryId, lat, lon);
      } catch (err) {
        // fallback to localStorage
        saveLocationLocal(deliveryId, lat, lon);
      }
    }, (err) => {
      console.error("Geolocation error", err);
    }, {
      enableHighAccuracy: true,
      maximumAge: 2000,
      timeout: 10000,
    });

    watchIdsRef.current[deliveryId] = watchId;
    alert("Started sharing location for delivery " + deliveryId.slice(0,8));
  }

  // Stop sharing location for a delivery
  function stopSharing(deliveryId) {
    const id = watchIdsRef.current[deliveryId];
    if (id) {
      navigator.geolocation.clearWatch(id);
      delete watchIdsRef.current[deliveryId];
      alert("Stopped sharing location for delivery " + deliveryId.slice(0,8));
    } else {
      alert("Not currently sharing for this delivery.");
    }
  }

  // Get best-known location for a delivery (server field or fallback)
  function getDeliveryLocation(del) {
    // prefer latitude/longitude fields on delivery object if present
    if (del && del.location && typeof del.location === "object" && del.location.lat) {
      return { lat: del.location.lat, lon: del.location.lon, ts: del.location.ts || null };
    }
    // fallback to localStorage saved by coordinator device
    const local = readLocationLocal(del.id);
    if (local) return { lat: local.lat, lon: local.lon, ts: local.ts };
    return null;
  }

  // Polling: refresh locations every 4s by reloading deliveries (server) and reading localStorage
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        // try to refresh deliveries from backend (so we can get server-stored location if available)
        const dl = await listDeliveries();
        if (dl) setDeliveries(dl);
      } catch {
        // ignore
      }
      // also nothing else needed because map reads localStorage and deliveries state
    }, 4000);
    return () => clearInterval(t);
  }, []);

  // badge color helper
  const badgeColor = (status) => {
    switch (status) {
      case "Assigned": return "#3b82f6";
      case "Out for Delivery": return "#f59e0b";
      case "Reached Area": return "#a855f7";
      case "Delivered": return "#10b981";
      default: return "#64748b";
    }
  };

  // default center (India) if no coordinates
  const defaultCenter = [20.5937, 78.9629];

  // Render
  return (
    <div className="grid grid-2">
      {/* Assignment Form */}
      <div className="card">
        <h2>Create Delivery Assignment</h2>
        <form onSubmit={assignDelivery} className="grid">
          <select className="select" value={assign.requestId}
            onChange={e => setAssign(a => ({ ...a, requestId: e.target.value }))}>
            <option value="">Select Approved Request</option>
            {availableRequests.map(r => (
              <option key={r.id} value={r.id}>
                {r.item} x{r.qty} — {r.location}
              </option>
            ))}
          </select>

          <select className="select" value={assign.donationId}
            onChange={e => setAssign(a => ({ ...a, donationId: e.target.value }))}>
            <option value="">Select Approved Donation</option>
            {availableDonations.map(d => (
              <option key={d.id} value={d.id}>
                {d.item} x{d.qty} — {d.location}
              </option>
            ))}
          </select>

          <input
            className="input"
            placeholder="Coordinator name"
            value={assign.coordinator}
            onChange={e => setAssign(a => ({ ...a, coordinator: e.target.value }))}
          />

          <button className="btn" type="submit">Assign Delivery</button>
        </form>
      </div>

      {/* Delivery Tracking & Map */}
      <div className="card">
        <h2>Live Delivery Tracking (Map)</h2>

        <div style={{ marginBottom: 12 }} className="small">
          Click <strong>View Map</strong> for a delivery to see live location.
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Request</th>
              <th>Donation</th>
              <th>Coordinator</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {deliveries.map(del => {
              const r = requests.find(x => x.id === del.requestId);
              const d = donations.find(x => x.id === del.donationId);
              const loc = getDeliveryLocation(del);

              return (
                <tr key={del.id}>
                  <td>{del.id.slice(0,8)}…</td>
                  <td>{r ? `${r.item} x${r.qty}` : "-"}</td>
                  <td>{d ? `${d.item} x${d.qty}` : "-"}</td>
                  <td>{del.coordinator}</td>
                  <td>
                    <span className="badge" style={{ background: badgeColor(del.status), color: "#fff" }}>
                      {del.status}
                    </span>
                    {loc && <div className="small" style={{ marginTop: 6 }}>
                      Last seen: {new Date(loc.ts || Date.now()).toLocaleTimeString()}
                    </div>}
                  </td>

                  <td>
                    <div className="grid">
                      {/* Map viewer */}
                      <button className="btn secondary" onClick={() => setSelectedDelivery(del)}>
                        View Map
                      </button>

                      {/* Coordinator: start/stop sharing */}
                      <button
                        className="btn"
                        onClick={() => {
                          // coordinator device: toggle sharing
                          if (!watchIdsRef.current[del.id]) startSharing(del.id);
                          else stopSharing(del.id);
                        }}
                      >
                        {watchIdsRef.current[del.id] ? "Stop Sharing" : "Share Location"}
                      </button>

                      {/* Status progress buttons */}
                      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                        {del.status !== "Out for Delivery" && (
                          <button className="btn secondary" onClick={() => progress(del, "Out for Delivery")}>Out for Delivery</button>
                        )}
                        {del.status !== "Reached Area" && (
                          <button className="btn" onClick={() => progress(del, "Reached Area")}>Reached Area</button>
                        )}
                        {del.status !== "Delivered" && (
                          <button className="btn" onClick={() => progress(del, "Delivered")}>Delivered</button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!deliveries.length && <p className="small">No deliveries yet.</p>}

        {/* Map view area */}
        {selectedDelivery && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>Live map — {selectedDelivery.id.slice(0,8)}…</h3>
              <div>
                <button className="btn ghost" onClick={() => setSelectedDelivery(null)}>Close Map</button>
              </div>
            </div>

            <div style={{ height: 360, marginTop: 10 }}>
              <LiveDeliveryMap
                delivery={selectedDelivery}
                getDeliveryLocation={getDeliveryLocation}
                defaultCenter={defaultCenter}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Map component (read-only view for a delivery) */
function LiveDeliveryMap({ delivery, getDeliveryLocation, defaultCenter }) {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function tick() {
      if (!mounted) return;
      const loc = getDeliveryLocation(delivery);
      if (loc) setPos([loc.lat, loc.lon]);
      else setPos(null);
    }
    tick();
    const t = setInterval(tick, 3000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, [delivery, getDeliveryLocation]);

  return (
    <MapContainer center={pos || defaultCenter} zoom={pos ? 14 : 5} style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {pos ? (
        <Marker position={pos}>
          <Popup>
            Delivery {delivery.id.slice(0,8)}<br/> Last update: {new Date().toLocaleTimeString()}
          </Popup>
        </Marker>
      ) : null}
    </MapContainer>
  );
}
