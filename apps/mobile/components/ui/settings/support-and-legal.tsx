import { View, Text } from "react-native";
import { Card } from "@/components/ui";
import SettingsLink from "@/components/ui/settings/settings-link";
import { settingsGeneralStyles as styles } from "./settings-general-styles";
import { router } from "expo-router";

const supportAndLegalLinks = [
  {
    icon: "question-circle",
    title: "Help & FAQs",
    subtitle: "Get answers to common questions",
    onPress: () => router.push("/(tabs)/settings/help-faqs"),
  },
  {
    icon: "info-circle",
    title: "About Splytflow",
    subtitle: "Version 1.0.0",
    onPress: () => router.push("/(tabs)/settings/about"),
  },
  {
    icon: "file-text-o",
    title: "Terms of Service",
    onPress: () => router.push("/(tabs)/settings/terms"),
  },
  {
    icon: "shield",
    title: "Privacy Policy",
    onPress: () => router.push("/(tabs)/settings/privacy"),
  },
];

export default function SupportAndLegalSettingsView({
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
        SUPPORT & LEGAL
      </Text>
      <Card style={styles.sectionCard}>
        {supportAndLegalLinks.map((link, index) => (
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
