import React, { useEffect, useState } from "react";
import {
  listDonations,
  listRequests,
  approveDonation,
  approveRequest,
} from "./api.js";

// CHARTS
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

export default function Admin() {
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState("");

  const ADMIN_PASSWORD = "admin123";

  useEffect(() => {
    const loggedIn = localStorage.getItem("adminAuth") === "true";
    setAuth(loggedIn);
  }, []);

  async function loadData() {
    const [d, r] = await Promise.all([listDonations(), listRequests()]);
    setDonations(d);
    setRequests(r);
  }

  useEffect(() => {
    if (auth) loadData();
  }, [auth]);

  async function toggleDonation(d) {
    await approveDonation(d.id, !d.approved);
    loadData();
  }

  async function toggleRequest(r) {
    await approveRequest(r.id, !r.approved);
    loadData();
  }

  function handleLogin() {
    if (password === ADMIN_PASSWORD) {
      setAuth(true);
      localStorage.setItem("adminAuth", "true");
    } else {
      alert("❌ Wrong password!");
    }
  }

  function handleLogout() {
    setAuth(false);
    localStorage.removeItem("adminAuth");
  }

  // ---------------------------
  // CHART DATA
  // ---------------------------

  const donationStats = [
    { name: "Approved", value: donations.filter((d) => d.approved).length },
    { name: "Pending", value: donations.filter((d) => !d.approved).length },
  ];

  const barData = [
    { name: "Donations", count: donations.length },
    { name: "Requests", count: requests.length },
  ];

  const CHART_COLORS = ["#10b981", "#ef4444"]; // green, red

  // ---------------------------
  // LOGIN PAGE
  // ---------------------------

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

  // ---------------------------
  // DASHBOARD PAGE
  // ---------------------------

  return (
    <div className="container">
      <button className="btn danger" onClick={handleLogout} style={{ float: "right" }}>
        Logout
      </button>

      <h2>📊 Admin Dashboard</h2>

      {/* Charts section */}
      <div className="grid grid-2" style={{ marginTop: "20px" }}>
        {/* Pie Chart */}
        <div className="card" style={{ height: "350px" }}>
          <h3 style={{ textAlign: "center" }}>Donation Approval Status</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={donationStats}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {donationStats.map((entry, index) => (
                  <Cell key={index} fill={CHART_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart */}
        <div className="card" style={{ height: "350px" }}>
          <h3 style={{ textAlign: "center" }}>Requests vs Donations</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-2" style={{ marginTop: "30px" }}>
        {/* Donations Table */}
        <div className="card">
          <h2>Donations (Approve/Reject)</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Donor</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id}>
                  <td>{d.item}</td>
                  <td>{d.qty}</td>
                  <td>{d.donorName || "-"}</td>
                  <td>{d.approved ? "Approved" : "Pending"}</td>
                  <td>
                    <button
                      className={`btn ${d.approved ? "danger" : ""}`}
                      onClick={() => toggleDonation(d)}
                    >
                      {d.approved ? "Revoke" : "Approve"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!donations.length && <p className="small">No donations yet.</p>}
        </div>

        {/* Requests Table */}
        <div className="card">
          <h2>Requests (Approve/Reject)</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Recipient</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.item}</td>
                  <td>{r.qty}</td>
                  <td>{r.recipientName || "-"}</td>
                  <td>{r.approved ? "Approved" : "Pending"}</td>
                  <td>
                    <button
                      className={`btn ${r.approved ? "danger" : ""}`}
                      onClick={() => toggleRequest(r)}
                    >
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
    </div>
  );
}
