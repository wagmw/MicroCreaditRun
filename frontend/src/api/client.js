import axios from "axios";

// For Android emulator use 10.0.2.2, for physical device use your computer's IP
// For iOS simulator, localhost works
// For Expo Go on physical device, use your computer's IP (run 'ipconfig' on Windows)
//const API_BASE =
//  process.env.API_BASE || "https://microcreaditrun.onrender.com/api";

// LOCAL DEVELOPMENT:
// Android Emulator: use 10.0.2.2
// iOS Simulator: use localhost
// Physical Device: use your computer's IP address (find it using 'ipconfig' command)
//const API_BASE =
//  process.env.API_BASE || "https://microcreaditrun.onrender.com/api";
const API_BASE = process.env.API_BASE || "http://192.168.1.2:4000/api";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // Increased for Render cold starts
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
