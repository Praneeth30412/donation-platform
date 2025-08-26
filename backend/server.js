// backend/server.js
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const app = express();
app.use(express.json());
app.use(cors());

// File setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "data.json");

// --- Helpers to read/write JSON file ---
function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return { donations: [], requests: [], deliveries: [], feedbacks: [] };
  }
}

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ donations, requests, deliveries, feedbacks }, null, 2));
}

// --- Load data at startup ---
let { donations, requests, deliveries, feedbacks } = loadData();

// ---------------- API Routes ----------------

// ---- Donations ----
app.post("/api/donations", (req, res) => {
  const item = { id: "don_" + randomUUID(), approved: false, matchedRequestId: null, ...req.body };
  donations.push(item);
  saveData();
  res.json(item);
});

app.get("/api/donations", (req, res) => res.json(donations));

app.patch("/api/donations/:id", (req, res) => {
  const d = donations.find(x => x.id === req.params.id);
  if (!d) return res.status(404).json({ error: "Not found" });
  if (typeof req.body.approved === "boolean") d.approved = req.body.approved;
  saveData();
  res.json(d);
});

// ---- Requests ----
app.post("/api/requests", (req, res) => {
  const item = { id: "req_" + randomUUID(), approved: false, delivered: false, ...req.body };
  requests.push(item);
  saveData();
  res.json(item);
});

app.get("/api/requests", (req, res) => res.json(requests));

app.patch("/api/requests/:id", (req, res) => {
  const r = requests.find(x => x.id === req.params.id);
  if (!r) return res.status(404).json({ error: "Not found" });
  if (typeof req.body.approved === "boolean") r.approved = req.body.approved;
  if (typeof req.body.delivered === "boolean") r.delivered = req.body.delivered;
  saveData();
  res.json(r);
});

// ---- Deliveries ----
app.post("/api/deliveries", (req, res) => {
  const { requestId, donationId, coordinator } = req.body;
  const delivery = { id: "del_" + randomUUID(), requestId, donationId, coordinator, status: "Assigned" };
  deliveries.push(delivery);
  saveData();
  res.json(delivery);
});

app.get("/api/deliveries", (req, res) => res.json(deliveries));

app.patch("/api/deliveries/:id", (req, res) => {
  const del = deliveries.find(x => x.id === req.params.id);
  if (!del) return res.status(404).json({ error: "Not found" });
  if (req.body.status) del.status = req.body.status;
  if (req.body.status === "Delivered") {
    const r = requests.find(x => x.id === del.requestId);
    if (r) r.delivered = true;
  }
  saveData();
  res.json(del);
});

// ---- Feedback ----
app.post("/api/feedbacks", (req, res) => {
  const fb = { id: "fb_" + randomUUID(), ...req.body };
  feedbacks.push(fb);
  saveData();
  res.json(fb);
});

app.get("/api/feedbacks", (req, res) => res.json(feedbacks));

// ---------------- Start Server ----------------
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Backend API running at http://localhost:${PORT}`));
