// src/api/chatbot.js
// Django chatbot backend base URL (fallback to localhost:8000 in dev)
const CHATBOT_BASE = (import.meta?.env?.VITE_CHATBOT_BASE && String(import.meta.env.VITE_CHATBOT_BASE).trim()) || "http://localhost:8000";
// Debug: uncomment if you need to verify at runtime
// console.log('[chatbot api] CHATBOT_BASE =', CHATBOT_BASE);

const jsonHeaders = () => ({
  "Content-Type": "application/json",
});

// POST /api/chat/
export async function chat({ message }) {
  const res = await fetch(`${CHATBOT_BASE}/api/chat/`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ message }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || "Chat request failed");
  return data; // { normalized_symptoms, possible_diseases, recommended_herbs, precautions }
}

// GET /api/herbs/{disease}/
export async function getHerbs(disease) {
  const res = await fetch(`${CHATBOT_BASE}/api/herbs/${encodeURIComponent(disease)}/`);
  if (!res.ok) throw new Error("Failed to fetch herbs");
  return res.json(); // { disease, herbs }
}

// GET /api/precautions/{disease}/
export async function getPrecautions(disease) {
  const res = await fetch(`${CHATBOT_BASE}/api/precautions/${encodeURIComponent(disease)}/`);
  if (!res.ok) throw new Error("Failed to fetch precautions");
  return res.json(); // { disease, precautions }
}
