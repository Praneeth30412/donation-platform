import React, { useEffect, useMemo, useState } from "react";
import {
  listRequests, listDonations, listDeliveries,
  createDelivery, updateDeliveryStatus
} from "./api.js";

export default function Logistics() {
  const [requests, setRequests] = useState([]);
  const [donations, setDonations] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [assign, setAssign] = useState({ requestId: "", donationId: "", coordinator: "" });

  async function load() {
    const [r, d, dl] = await Promise.all([listRequests(), listDonations(), listDeliveries()]);
    setRequests(r);
    setDonations(d);
    setDeliveries(dl);
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
    if (!assign.requestId || !assign.donationId || !assign.coordinator) return alert("Fill all fields");
    await createDelivery(assign);
    setAssign({ requestId: "", donationId: "", coordinator: "" });
    await load();
    alert("Delivery assigned!");
  }

  async function progress(del, status) {
    await updateDeliveryStatus(del.id, status);
    await load();
  }

  return (
    <div className="grid grid-2">
      <div className="card">
        <h2>Create Delivery Assignment</h2>
        <form onSubmit={assignDelivery} className="grid">
          <select className="select" value={assign.requestId}
                  onChange={e => setAssign(a => ({ ...a, requestId: e.target.value }))}>
            <option value="">Select Approved Request</option>
            {availableRequests.map(r => (
              <option key={r.id} value={r.id}>{r.item} x{r.qty} — {r.location}</option>
            ))}
          </select>

          <select className="select" value={assign.donationId}
                  onChange={e => setAssign(a => ({ ...a, donationId: e.target.value }))}>
            <option value="">Select Approved Donation</option>
            {availableDonations.map(d => (
              <option key={d.id} value={d.id}>{d.item} x{d.qty} — {d.location}</option>
            ))}
          </select>

          <input className="input" placeholder="Coordinator name"
                 value={assign.coordinator}
                 onChange={e => setAssign(a => ({ ...a, coordinator: e.target.value }))} />

          <button className="btn" type="submit">Assign Delivery</button>
        </form>
      </div>

      <div className="card">
        <h2>Deliveries</h2>
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Request</th><th>Donation</th><th>Coordinator</th><th>Status</th><th>Update</th></tr>
          </thead>
          <tbody>
          {deliveries.map(del => {
            const r = requests.find(x => x.id === del.requestId);
            const d = donations.find(x => x.id === del.donationId);
            return (
              <tr key={del.id}>
                <td>{del.id.slice(0, 8)}…</td>
                <td>{r ? `${r.item} x${r.qty}` : "-"}</td>
                <td>{d ? `${d.item} x${d.qty}` : "-"}</td>
                <td>{del.coordinator}</td>
                <td><span className="badge">{del.status}</span></td>
                <td>
                  <div className="grid">
                    <button className="btn secondary" onClick={() => progress(del, "Out for Delivery")}>
                      Out for Delivery
                    </button>
                    <button className="btn" onClick={() => progress(del, "Delivered")}>
                      Mark Delivered
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
        {!deliveries.length && <p className="small">No deliveries yet.</p>}
      </div>
    </div>
  );
}
