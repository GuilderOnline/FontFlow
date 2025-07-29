// src/api/api.js
import axios from "axios";

// Detect API base depending on environment
const API_BASE_URL =
  import.meta.env?.VITE_API_BASE || // ✅ Vite-style env var (works on Vercel)
  process.env?.REACT_APP_API_BASE || // ✅ CRA-style env var (works locally)
  "http://localhost:4000/api"; // ✅ fallback for local dev

// Create an axios instance so we don't repeat headers/baseURL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "x-api-key": "fontflow-API-123", // static API key if required
  },
});
// redeploy trigger

export const getFonts = async (token) => {
  const res = await api.get("/fonts", {
    headers: {
      Authorization: `Bearer ${token}`, // JWT if logged in
    },
  });
  return res.data;
};

export const login = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};
