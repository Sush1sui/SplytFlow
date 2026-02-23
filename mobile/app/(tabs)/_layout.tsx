import AuthProtect from "@/components/protect-routes/auth-protect";
import { Stack } from "expo-router";

export default function TabsLayout() {
  return (
    <AuthProtect>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
      </Stack>
    </AuthProtect>
  );
}
