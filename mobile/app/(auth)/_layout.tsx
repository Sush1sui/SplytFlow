import NoAuthProtect from "@/components/protect-routes/no-auth-protect";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <NoAuthProtect>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
      </Stack>
    </NoAuthProtect>
  );
}
