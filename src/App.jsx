import React from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./Home.jsx";
import Donor from "./Donor.jsx";
import Recipient from "./Recipient.jsx";
import Admin from "./Admin.jsx";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import Logistics from "./Logistics.jsx";
import "./index.css";

export default function App() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px",
          background: "#181f26",
        }}
      >
        {/* Left: Relief Connect */}
        <div style={{ flex: "1", textAlign: "left", color: "#fff", fontWeight: "bold", fontSize: "24px" }}>
          Relief Connect
        </div>

        {/* Center: Main Navigation Links */}
        <div style={{ flex: "2", textAlign: "center" }}>
          {user ? (
            <>
              <Link to="/" style={{ color: "#fff", margin: "0 12px" }}>Home</Link>
              <Link to="/admin" style={{ color: "#fff", margin: "0 12px" }}>Admin</Link>
              <Link to="/donor" style={{ color: "#fff", margin: "0 12px" }}>Donor</Link>
              <Link to="/recipient" style={{ color: "#fff", margin: "0 12px" }}>Recipient</Link>
              <Link to="/logistics" style={{ color: "#fff", margin: "0 12px" }}>Logistics</Link>
            </>
          ) : null}
        </div>

        {/* Right: Auth Buttons */}
        <div style={{ flex: "1", textAlign: "right" }}>
          {!user ? (
            <>
              <Link to="/login" style={{ color: "#fff", marginRight: "16px", fontWeight: "bold" }}>Login</Link>
              <Link to="/register" style={{ color: "#fff", fontWeight: "bold" }}>Register</Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              style={{
                color: "#fff",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold"
              }}
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      <Routes>
        {user ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/donor" element={<Donor />} />
            <Route path="/recipient" element={<Recipient />} />
            <Route path="/logistics" element={<Logistics />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Login />} />
          </>
        )}
      </Routes>
    </div>
  );
}
