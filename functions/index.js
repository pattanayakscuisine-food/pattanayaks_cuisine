/* ===================================================
   PATTANAYAK'S CUISINE — Gemini AI Proxy
   Cloud Function that keeps the API key server-side.
   The frontend calls /api/gemini (via Hosting rewrite)
   instead of hitting the Gemini API directly.
   =================================================== */

const { onRequest } = require("firebase-functions/v2/https");

// CORS origins allowed to call this function
const ALLOWED_ORIGINS = [
  "https://pattanayakcuisine.web.app",
  "https://pattanayakcuisine.firebaseapp.com",
  "http://localhost:5000",   // local emulator
  "http://localhost:5500",   // VS Code Live Server
  "http://127.0.0.1:5500",
];

exports.geminiProxy = onRequest(
  { region: "us-central1", timeoutSeconds: 30 },
  async (req, res) => {
    // ── CORS ────────────────────────────────────────
    const origin = req.headers.origin;
    if (ALLOWED_ORIGINS.includes(origin)) {
      res.set("Access-Control-Allow-Origin", origin);
    }
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: { message: "Method Not Allowed" } });
      return;
    }

    // ── API key lives only here, never in the browser ──
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: { message: "API key not configured on server." } });
      return;
    }

    const GEMINI_URL =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (err) {
      res.status(500).json({ error: { message: err.message } });
    }
  }
);
