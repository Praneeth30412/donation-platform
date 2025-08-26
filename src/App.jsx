import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./Home.jsx";
import Donor from "./Donor.jsx";
import Recipient from "./Recipient.jsx";
import Admin from "./Admin.jsx";
import Logistics from "./Logistics.jsx";
import "./index.css"; // ensure styles are loaded

export default function App() {
  return (
    <div>
      <nav className="nav">
        <div className="nav-inner">
          <div className="brand">ReliefConnect</div>
          <Link to="/" className="link">Home</Link>
          <Link to="/donor" className="link">Donor</Link>
          <Link to="/recipient" className="link">Recipient</Link>
          <Link to="/admin" className="link">Admin</Link>
          <Link to="/logistics" className="link">Logistics</Link>
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/donor" element={<Donor />} />
          <Route path="/recipient" element={<Recipient />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/logistics" element={<Logistics />} />
        </Routes>
      </div>
    </div>
  );
}
