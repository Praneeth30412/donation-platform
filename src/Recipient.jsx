import React, { useEffect, useState } from "react";
import { addRequest, listRequests } from "./api.js";
import LocationPicker from "./LocationPicker.jsx";

export default function Recipient() {
  const [form, setForm] = useState({
    item: "",
    qty: 1,
    location: "",
    recipientName: "",
    phone: "",
  });

  const [requests, setRequests] = useState([]);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    (async () => setRequests(await listRequests()))();
  }, []);

  async function submit(e) {
    e.preventDefault();
    const payload = { ...form, qty: Number(form.qty) || 1 };
    await addRequest(payload);
    setRequests(await listRequests());
    setForm({ item: "", qty: 1, location: "", recipientName: "", phone: "" });
    alert("Request submitted! Waiting for admin approval.");
  }

  // ✔ Use GPS (autofill location)
  async function useMyLocation() {
    if (!navigator.geolocation) return alert("GPS not available");

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
      const data = await fetch(url).then((r) => r.json());
      setForm({ ...form, location: data.display_name });
    });
  }

  return (
    <div className="grid grid-2">
      
      {/* Request Form */}
      <div className="card">
        <h2>Request Items</h2>
        <p className="small">Fill details to request help</p>

        <form onSubmit={submit} className="grid">
          
          <input
            className="input"
            placeholder="Item name"
            value={form.item}
            onChange={(e) => setForm({ ...form, item: e.target.value })}
            required
          />

          <input
            className="input"
            type="number"
            min="1"
            placeholder="Quantity"
            value={form.qty}
            onChange={(e) => setForm({ ...form, qty: e.target.value })}
          />

          {/* Location Input */}
          <input
            className="input"
            placeholder="Your location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          {/* Use My Location */}
          <button
            type="button"
            className="btn secondary"
            onClick={useMyLocation}
          >
            Use My Current Location
          </button>

          {/* Toggle Map */}
          <button
            type="button"
            className="btn ghost"
            onClick={() => setShowMap(!showMap)}
          >
            {showMap ? "Hide Map" : "Select from Map"}
          </button>

          {/* Map Picker */}
          {showMap && (
            <LocationPicker
              setLocation={(loc) => setForm({ ...form, location: loc })}
            />
          )}

          <input
            className="input"
            placeholder="Your name"
            value={form.recipientName}
            onChange={(e) =>
              setForm({ ...form, recipientName: e.target.value })
            }
          />

          <input
            className="input"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <button className="btn" type="submit">
            Submit Request
          </button>
        </form>
      </div>

      {/* Requests Table */}
      <div className="card">
        <h2>Your & All Requests</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td>{r.item}</td>
                <td>{r.qty}</td>
                <td>{r.location}</td>
                <td>{r.approved ? "Approved" : "Pending"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!requests.length && <p className="small">No requests yet.</p>}
      </div>
    </div>
  );
}
