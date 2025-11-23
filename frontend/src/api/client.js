import axios from "axios";
import logger from "../utils/logger";

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
//process.env.API_BASE || "http://truecinnamonceylon.com:4000/api";
const API_BASE = process.env.API_BASE || "http://192.168.1.2:4000/api";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60 seconds for Render cold starts
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only log errors in development
    if (__DEV__) {
      if (error.code === "ECONNABORTED") {
        logger.error("Request timeout - server may be cold starting");
      } else if (
        error.response?.status === 502 ||
        error.response?.status === 503
      ) {
        logger.error("Server unavailable - may be starting up or deploying");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
