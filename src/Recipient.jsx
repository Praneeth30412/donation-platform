import React, { useEffect, useState } from "react";
import { addRequest, listRequests, addFeedback } from "./api.js";

export default function Recipient() {
  const [form, setForm] = useState({
    item: "",
    qty: 1,
    urgency: "Normal",
    location: "",
    recipientName: "",
    phone: ""
  });
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => setItems(await listRequests()))();
  }, []);

  async function submit(e) {
    e.preventDefault();
    const payload = { ...form, qty: Number(form.qty) || 1 };
    await addRequest(payload);
    setItems(await listRequests());
    setForm({ item: "", qty: 1, urgency: "Normal", location: "", recipientName: "", phone: "" });
    alert("Request submitted! Waiting for admin approval.");
  }

  async function leaveFeedback(id) {
    const message = prompt("Feedback message:");
    const rating = Number(prompt("Rating 1-5:", "5") || 5);
    if (!message) return;
    await addFeedback({ requestId: id, message, rating });
    alert("Thanks for the feedback!");
  }

  return (
    <div className="grid grid-2">
      <div className="card">
        <h2>Request Help</h2>
        <form onSubmit={submit} className="grid">
          <input className="input" placeholder="Item needed" value={form.item}
                 onChange={e => setForm({ ...form, item: e.target.value })} required />
          <input className="input" type="number" min="1" placeholder="Quantity" value={form.qty}
                 onChange={e => setForm({ ...form, qty: e.target.value })} />
          <select className="select" value={form.urgency}
                  onChange={e => setForm({ ...form, urgency: e.target.value })}>
            <option>Normal</option>
            <option>High</option>
            <option>Critical</option>
          </select>
          <input className="input" placeholder="Delivery location" value={form.location}
                 onChange={e => setForm({ ...form, location: e.target.value })} />
          <input className="input" placeholder="Your name" value={form.recipientName}
                 onChange={e => setForm({ ...form, recipientName: e.target.value })} />
          <input className="input" placeholder="Phone" value={form.phone}
                 onChange={e => setForm({ ...form, phone: e.target.value })} />
          <button className="btn" type="submit">Submit Request</button>
        </form>
      </div>

      <div className="card">
        <h2>Requests</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Item</th><th>Qty</th><th>Urgency</th><th>Location</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
        <tbody>
          {items.map(r => (
            <tr key={r.id}>
              <td>{r.item}</td>
              <td>{r.qty}</td>
              <td><span className="badge">{r.urgency}</span></td>
              <td>{r.location}</td>
              <td>{r.delivered ? "Delivered" : r.approved ? "Approved" : "Pending"}</td>
              <td>
                {r.delivered && (
                  <button className="btn secondary" onClick={() => leaveFeedback(r.id)}>
                    Feedback
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        </table>
        {!items.length && <p className="small">No requests yet.</p>}
      </div>
    </div>
  );
}
