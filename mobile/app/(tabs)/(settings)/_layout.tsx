import { Slot } from "expo-router";

// No sub-screens under (settings) — Slot renders the null-returning index.
export default function SettingsLayout() {
  return <Slot />;
}
