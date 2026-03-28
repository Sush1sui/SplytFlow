import { Stack } from "expo-router";

export default function SalesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="index"
        options={{ contentStyle: { backgroundColor: "transparent" } }}
      />
      <Stack.Screen name="sale-history-page" />
    </Stack>
  );
}
