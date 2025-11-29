import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./index.css";

// Generate random captcha
function generateCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let text = "";
  for (let i = 0; i < 6; i++) {
    text += chars[Math.floor(Math.random() * chars.length)];
  }
  return text;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Captcha check
    if (captchaInput !== captcha) {
      alert("❌ Captcha does not match!");
      setCaptcha(generateCaptcha()); // Refresh captcha
      setCaptchaInput("");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("✅ Login successful");
        navigate("/");
      } else {
        alert(data.message || "❌ Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Server error");
    }
  };

  return (
    <div className="auth-container card page">

      <h2>Login</h2>

      <form onSubmit={handleLogin} className="auth-form">

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="input"
          required
        />

        {/* CAPTCHA BOX */}
        <div
          style={{
            padding: "10px",
            margin: "10px 0",
            borderRadius: "8px",
            background: "#0f172a",
            color: "white",
            fontSize: "22px",
            letterSpacing: "4px",
            textAlign: "center",
            fontWeight: "700",
            userSelect: "none",
          }}
        >
          {captcha}
        </div>

        {/* CAPTCHA INPUT */}
        <input
          type="text"
          className="input"
          placeholder="Enter the captcha above"
          value={captchaInput}
          onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
          required
        />

        {/* Refresh captcha */}
        <button
          type="button"
          className="btn ghost"
          onClick={() => setCaptcha(generateCaptcha())}
        >
          Refresh Captcha
        </button>

        <button type="submit" className="btn">
          Login
        </button>
      </form>

      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>

    </div>
  );
}
