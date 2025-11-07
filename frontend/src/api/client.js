import axios from "axios";

// For Android emulator use 10.0.2.2, for physical device use your computer's IP
// For iOS simulator, localhost works
// Change this IP to your computer's local IP address (use ipconfig on Windows)
const API_BASE = process.env.API_BASE || "http://192.168.1.2:4000/api";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
