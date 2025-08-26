import React, { useEffect, useState } from "react";
import {
  listDonations, listRequests,
  approveDonation, approveRequest
} from "./api.js";

export default function Admin() {
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [auth, setAuth] = useState(false);     // 🔐 track login
  const [password, setPassword] = useState(""); 

  const ADMIN_PASSWORD = "admin123"; // change this as you like

  async function load() {
    const [d, r] = await Promise.all([listDonations(), listRequests()]);
    setDonations(d);
    setRequests(r);
  }

  useEffect(() => {
    if (auth) load();   // only load data if logged in
  }, [auth]);

  async function toggleDonation(d) {
    await approveDonation(d.id, !d.approved);
    load();
  }

  async function toggleRequest(r) {
    await approveRequest(r.id, !r.approved);
    load();
  }

  function handleLogin() {
    if (password === ADMIN_PASSWORD) {
      setAuth(true);
    } else {
      alert("❌ Wrong password!");
    }
  }

  // 🔐 If not logged in → show login form
  if (!auth) {
    return (
      <div className="container card" style={{ maxWidth: "400px", marginTop: "40px" }}>
        <h2>🔐 Admin Login</h2>
        <input
          type="password"
          placeholder="Enter Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
        <button onClick={handleLogin} className="btn" style={{ marginTop: "10px" }}>
          Login
        </button>
      </div>
    );
  }

  // ✅ If logged in → show admin dashboard
  return (
    <div className="grid grid-2">
      <div className="card">
        <h2>Donations (Approve/Reject)</h2>
        <table className="table">
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Donor</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
          {donations.map(d => (
            <tr key={d.id}>
              <td>{d.item}</td>
              <td>{d.qty}</td>
              <td>{d.donorName || "-"}</td>
              <td>{d.approved ? "Approved" : "Pending"}</td>
              <td>
                <button className={`btn ${d.approved ? "danger" : ""}`} onClick={() => toggleDonation(d)}>
                  {d.approved ? "Revoke" : "Approve"}
                </button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
        {!donations.length && <p className="small">No donations yet.</p>}
      </div>

      <div className="card">
        <h2>Requests (Approve/Reject)</h2>
        <table className="table">
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Recipient</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
          {requests.map(r => (
            <tr key={r.id}>
              <td>{r.item}</td>
              <td>{r.qty}</td>
              <td>{r.recipientName || "-"}</td>
              <td>{r.approved ? "Approved" : "Pending"}</td>
              <td>
                <button className={`btn ${r.approved ? "danger" : ""}`} onClick={() => toggleRequest(r)}>
                  {r.approved ? "Revoke" : "Approve"}
                </button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
        {!requests.length && <p className="small">No requests yet.</p>}
      </div>
    </div>
  );
}
