import axios from "axios";

// For Android emulator use 10.0.2.2, for physical device use your computer's IP
// For iOS simulator, localhost works
// Change this IP to your computer's local IP address (use ipconfig on Windows)
const API_BASE =
  process.env.API_BASE || "https://microcreaditrun.onrender.com/api";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // Increased for Render cold starts
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
