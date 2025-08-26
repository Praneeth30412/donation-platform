// src/store.js

// --- In-memory state (persisted in localStorage) ---
let donations = JSON.parse(localStorage.getItem("donations") || "[]");
let requests = JSON.parse(localStorage.getItem("requests") || "[]");
let deliveries = JSON.parse(localStorage.getItem("deliveries") || "[]");
let feedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");

function save() {
  localStorage.setItem("donations", JSON.stringify(donations));
  localStorage.setItem("requests", JSON.stringify(requests));
  localStorage.setItem("deliveries", JSON.stringify(deliveries));
  localStorage.setItem("feedbacks", JSON.stringify(feedbacks));
}

// --- Helpers ---
function genId(prefix) {
  return prefix + "_" + Math.random().toString(36).substr(2, 9);
}

// --- Donations ---
export function addDonation(item) {
  donations.push({ ...item, id: genId("don"), approved: false, matchedRequestId: null });
  save();
}
export function listDonations() {
  return donations;
}
export function approveDonation(id, approved = true) {
  const d = donations.find(x => x.id === id);
  if (d) d.approved = approved;
  save();
}

// --- Requests ---
export function addRequest(item) {
  requests.push({ ...item, id: genId("req"), approved: false, delivered: false });
  save();
}
export function listRequests() {
  return requests;
}
export function approveRequest(id, approved = true) {
  const r = requests.find(x => x.id === id);
  if (r) r.approved = approved;
  save();
}

// --- Deliveries ---
export function createDelivery({ requestId, donationId, coordinator }) {
  const delivery = {
    id: genId("del"),
    requestId,
    donationId,
    coordinator,
    status: "Assigned",
  };
  deliveries.push(delivery);

  // link donor <-> request
  const d = donations.find(x => x.id === donationId);
  const r = requests.find(x => x.id === requestId);
  if (d) d.matchedRequestId = requestId;
  if (r) r.deliveryId = delivery.id;

  save();
}
export function listDeliveries() {
  return deliveries;
}
export function updateDeliveryStatus(id, status) {
  const d = deliveries.find(x => x.id === id);
  if (d) d.status = status;

  if (status === "Delivered") {
    const r = requests.find(x => x.id === d.requestId);
    if (r) r.delivered = true;
  }
  save();
}

// --- Feedback ---
export function addFeedback({ requestId, message, rating }) {
  feedbacks.push({ id: genId("fb"), requestId, message, rating });
  save();
}
export function listFeedbacks() {
  return feedbacks;
}

// --- Reset state ---
export function resetState() {
  donations = [];
  requests = [];
  deliveries = [];
  feedbacks = [];
  save();
}
