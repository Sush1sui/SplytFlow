import { Stack } from "expo-router";
import { TamaguiProvider } from "tamagui";

import tamaguiConfig from "../tamagui.config";
import AuthProvider from "@/lib/providers/auth-provider";
import ToastProvider from "@/lib/providers/toast-provider";

export default function RootLayout() {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <ToastProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(public)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </AuthProvider>
      </ToastProvider>
    </TamaguiProvider>
  );
}
