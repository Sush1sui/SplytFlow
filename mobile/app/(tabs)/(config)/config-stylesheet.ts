import { StyleSheet } from "react-native";

export default function useConfigStyles() {
  return StyleSheet.create({
    scroll: {
      paddingBottom: 32,
      gap: 20,
    },
    header: {
      marginBottom: 8,
    },
    logoCircle: {
      width: 48,
      height: 48,
      borderRadius: 14,
    },
    configIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      marginRight: 12,
    },
    configLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: "500",
    },
  });
}
