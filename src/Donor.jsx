import React, { useEffect, useState } from "react";
import { addDonation, listDonations } from "./api.js";
import LocationPicker from "./LocationPicker.jsx";

export default function Donor() {
  const [form, setForm] = useState({
    item: "",
    qty: 1,
    category: "Food",
    location: "",
    donorName: "",
    phone: ""
  });

  const [items, setItems] = useState([]);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    (async () => setItems(await listDonations()))();
  }, []);

  async function submit(e) {
    e.preventDefault();
    const payload = { ...form, qty: Number(form.qty) || 1 };
    await addDonation(payload);
    setItems(await listDonations());
    setForm({ item: "", qty: 1, category: "Food", location: "", donorName: "", phone: "" });
    alert("Donation submitted! Waiting for admin approval.");
  }

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
      <div className="card">
        <h2>Donate Items</h2>
        <p className="small">Fill details to contribute</p>

        <form onSubmit={submit} className="grid">
          <input className="input" placeholder="Item name" value={form.item}
            onChange={e => setForm({ ...form, item: e.target.value })} required />

          <input className="input" type="number" min="1" placeholder="Quantity" value={form.qty}
            onChange={e => setForm({ ...form, qty: e.target.value })} />

          <select className="select" value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}>
            <option>Food</option>
            <option>Clothes</option>
            <option>Medicine</option>
            <option>Hygiene</option>
            <option>Other</option>
          </select>

          {/* Location Input */}
          <input
            className="input"
            placeholder="Pickup location"
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
          />

          {/* Use My Location */}
          <button type="button" className="btn secondary" onClick={useMyLocation}>
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

          {/* Map Picker Component */}
          {showMap && (
            <LocationPicker setLocation={(loc) => setForm({ ...form, location: loc })} />
          )}

          <input className="input" placeholder="Your name" value={form.donorName}
            onChange={e => setForm({ ...form, donorName: e.target.value })} />

          <input className="input" placeholder="Phone" value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })} />

          <button className="btn" type="submit">Submit Donation</button>
        </form>
      </div>

      {/* Donations Table */}
      <div className="card">
        <h2>Your & All Donations</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Item</th><th>Qty</th><th>Category</th><th>Location</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map(d => (
              <tr key={d.id}>
                <td>{d.item}</td>
                <td>{d.qty}</td>
                <td><span className="badge">{d.category}</span></td>
                <td>{d.location}</td>
                <td>{d.approved ? "Approved" : "Pending"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <p className="small">No donations yet.</p>}
      </div>
    </div>
  );
}
