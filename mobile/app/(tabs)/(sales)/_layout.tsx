import { View } from "react-native";
import { Slot } from "expo-router";

export default function SalesLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
}
