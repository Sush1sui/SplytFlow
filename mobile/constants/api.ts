/**
 * API Configuration
 *
 * For development:
 * - iOS Simulator: Use 'localhost'
 * - Android Emulator: Use '10.0.2.2'
 * - Physical device: Use your computer's local IP address
 */

// Update this to your computer's IP address when testing on a physical device
// Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to find your local IP
import Constants from "expo-constants";

// expo will merge these extras from app.config.js (or app.json if you set manually)
// during runtime. For local development you can keep a .env file and load it
// into expo.extra via app.config.js/ts using dotenv.
const LOCAL_IP = (Constants.expoConfig?.extra as any)?.LOCAL_IP || "localhost"; // or "192.168.x.x" for physical devices
const LOCAL_PORT =
  Number((Constants.expoConfig?.extra as any)?.LOCAL_PORT) || 3000;

export const API_BASE_URL = __DEV__
  ? `http://${LOCAL_IP}:${LOCAL_PORT}`
  : "https://your-production-api.com";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/signin",
    SIGNUP: "/auth/signup",
    LOGOUT: "/auth/logout",
    LOGOUT_ALL: "/auth/logout-all",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
    OTP: "/otp",
    OTP_VERIFY: "/otp/verify",
  },
  SALES: {
    CREATE: "/sales",
    ADJUST: "/sales/adjust",
    SET_DAY: "/sales/set-day",
    BY_USER: (userId: string) => `/sales/${userId}`,
  },
  SPLIT: {
    UPSERT: "/split",
    DELETE: "/split",
    DELETE_ALL_BY_USER: (userId: string) => `/split/all/${userId}`,
    BY_USER: (userId: string) => `/split/${userId}`,
    HISTORY_CORRECT: "/split/history/correct",
    CORRECTION_HISTORY_BY_USER: (userId: string, limit = 25) =>
      `/split/history/${userId}/corrections?limit=${limit}`,
  },
} as const;
