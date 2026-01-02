import { hc } from "hono/client";
import type { AppType } from "@splytflow/api";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

if (!BASE_URL)
  throw new Error("Missing EXPO_PUBLIC_API_URL environment variable");

export const api = hc<AppType>(BASE_URL);
