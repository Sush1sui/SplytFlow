import { Slot } from "expo-router";

// No sub-screens under (splits) — Slot renders the null-returning index.
export default function SplitsLayout() {
  return <Slot />;
}
