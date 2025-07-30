// src/lib/api.ts
import axios from "axios";

// ✅ Base URL from .env (e.g. https://crypto-backend-trk5.vercel.app)
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// ✅ Create a reusable Axios instance
export const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Optional helper for GET requests
export const getFromBackend = async (path: string) => {
  const res = await API.get(path);
  return res.data;
};

// ✅ Optional helper for POST requests
export const postToBackend = async (path: string, data: any) => {
  const res = await API.post(path, data);
  return res.data;
};
