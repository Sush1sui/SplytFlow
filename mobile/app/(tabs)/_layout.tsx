import { Stack } from "expo-router";
import { YStack } from "tamagui";
import BottomTabNav from "@/components/tabs/bottom-tab-nav";

export default function TabsLayout() {
  return (
    <YStack style={{ flex: 1, backgroundColor: "#f4f6fb" }}>
      <Stack screenOptions={{ headerShown: false, animation: "none" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(home)" />
        <Stack.Screen name="(sales)" />
        <Stack.Screen name="(splits)" />
        <Stack.Screen name="(settings)" />
      </Stack>
      <BottomTabNav />
    </YStack>
  );
}
