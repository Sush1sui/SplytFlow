import { View, Text } from "react-native";
import { Card } from "@/components/ui";
import SettingsLink from "@/components/ui/settings/settings-link";
import { settingsGeneralStyles as styles } from "./settings-general-styles";
import { navigate } from "expo-router/build/global-state/routing";

const settingsLinks = [
  {
    icon: "user",
    title: "Profile",
    subtitle: "Update your personal information",
    onPress: () => console.log("Profile"),
  },
  {
    icon: "calculator",
    title: "Cost Allocation",
    subtitle: "Manage expense categories and splits",
    onPress: () => navigate("/(tabs)/cost-allocation"),
  },
  {
    icon: "bell",
    title: "Notifications",
    subtitle: "Configure alerts and reminders",
    onPress: () => console.log("Notifications"),
  },
];

export default function AccountSettingsView({
  colors,
}: {
  colors: {
    primary: string;
    text: string;
    textSecondary: string;
    textInverse: string;
  };
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        ACCOUNT
      </Text>
      <Card style={styles.sectionCard}>
        {settingsLinks.map((link, index) => (
          <SettingsLink
            key={index}
            icon={link.icon}
            title={link.title}
            subtitle={link.subtitle}
            onPress={link.onPress}
          />
        ))}
      </Card>
    </View>
  );
}
