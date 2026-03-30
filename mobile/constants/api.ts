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
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
    UPDATE_PROFILE: "/auth/me",
    UPDATE_PASSWORD: "/auth/me/password",
    LOGOUT: "/auth/logout",
  },
  OTP: {
    GENERATE: "/otp",
    VERIFY: "/otp/verify",
  },
  SPLIT_CATEGORY: {
    LIST: "/splits/categories",
    CREATE: "/splits/categories",
    BY_ID: (id: string) => `/splits/categories/${id}`, // GET, PUT, DELETE for specific category
  },
  SPLIT: {
    LIST: "/splits",
    CREATE: "/splits",
    BY_ID: (id: string) => `/splits/${id}`, // GET, PUT, DELETE for specific split
  },
  SALE: {
    LIST: "/sales",
    CREATE: "/sales",
    BY_ID: (id: string) => `/sales/${id}`, // GET, PUT, DELETE for specific sale
    RANGE: "/sales/range",
  },
};
