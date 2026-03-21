import { Stack } from "expo-router";
import { TamaguiProvider } from "tamagui";

import tamaguiConfig from "../tamagui.config";
import AuthProvider from "@/lib/providers/auth-provider";

export default function RootLayout() {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
        </Stack>
      </AuthProvider>
    </TamaguiProvider>
  );
}
