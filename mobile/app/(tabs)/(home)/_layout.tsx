import { Slot } from "expo-router";

// No sub-screens under (home) — Slot renders the null-returning index
// without adding any navigation container that would block touches.
export default function HomeLayout() {
  return <Slot />;
}
