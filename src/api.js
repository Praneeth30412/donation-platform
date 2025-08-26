const BASE = "http://localhost:5000";

async function http(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  return res.json();
}

/* -------- Donations -------- */
export const addDonation = (data) =>
  http("/api/donations", { method: "POST", body: JSON.stringify(data) });

export const listDonations = () => http("/api/donations");

export const approveDonation = (id, approved = true) =>
  http(`/api/donations/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ approved })
  });

/* -------- Requests -------- */
export const addRequest = (data) =>
  http("/api/requests", { method: "POST", body: JSON.stringify(data) });

export const listRequests = () => http("/api/requests");

export const approveRequest = (id, approved = true) =>
  http(`/api/requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ approved })
  });

/* -------- Deliveries -------- */
export const createDelivery = ({ requestId, donationId, coordinator }) =>
  http("/api/deliveries", {
    method: "POST",
    body: JSON.stringify({ requestId, donationId, coordinator })
  });

export const listDeliveries = () => http("/api/deliveries");

export const updateDeliveryStatus = (id, status) =>
  http(`/api/deliveries/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });

/* -------- Feedback -------- */
export const addFeedback = (data) =>
  http("/api/feedbacks", { method: "POST", body: JSON.stringify(data) });

export const listFeedbacks = () => http("/api/feedbacks");

/* -------- Utilities -------- */
export const resetState = () => http("/api/reset", { method: "POST" });
