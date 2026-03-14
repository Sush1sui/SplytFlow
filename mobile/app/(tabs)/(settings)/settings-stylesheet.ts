import { StyleSheet } from "react-native";

export default function useSettingsStyles() {
  return StyleSheet.create({
    scroll: {
      paddingBottom: 40,
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
    settingsIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      marginRight: 12,
    },
    profileCard: {
      flexDirection: "row",
      alignItems: "center",
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 16,
      fontWeight: "600",
    },
    profileEmail: {
      fontSize: 13,
      marginTop: 2,
    },
    settingsLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: "500",
    },
    logoutWrap: {
      marginTop: 8,
    },
  });
}
