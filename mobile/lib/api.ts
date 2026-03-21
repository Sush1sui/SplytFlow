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

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "API request failed");
  }
  return response.json();
}

// ENDPOINTS
export const API_ENDPOINTS = {
  /**
   * AUTH ROUTES
   */
  LOGIN: "/auth/signin",
  OTP_SIGNUP: "/auth/signup",
  REFRESH: "/auth/refresh",
  ME: "/auth/me",
  LOGOUT: "/auth/logout",
  /* --------------------------------- */
  /**
   * OTP ROUTES
   */
  GENERATE_OTP: "/otp",
  VERIFY_OTP: "/otp/verify",
  /* --------------------------------- */
  /**
   * SPLIT CATEGORY ROUTES
   */
  SPLIT_CATEGORIES: "/splits/categories", // GET for list, POST for create
  SPLIT_CATEGORY_BY_ID: (id: string) => `/splits/categories/${id}`, // GET, PUT, DELETE for specific category
  /* --------------------------------- */
  /**
   * SPLIT ROUTES
   */
  SPLITS: "/splits", // GET for list, POST for create
  SPLIT_BY_ID: (id: string) => `/splits/${id}`, // GET, PUT, DELETE for specific split
  /* --------------------------------- */
  /**
   * SALE ROUTES
   */
  SALES: "/sales", // GET for list, POST for create,
  SALE_BY_ID: (id: string) => `/sales/${id}`, // GET, PUT, DELETE for specific sale
  SALES_RANGE: "/sales/range",
};
