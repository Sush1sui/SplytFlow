import { View, Text } from "react-native";
import { Card } from "@/components/ui";
import SettingsLink from "./settings-link";
import { settingsGeneralStyles as styles } from "./settings-general-styles";

const businessSettingsLinks = [
  {
    icon: "briefcase",
    title: "Business Info",
    subtitle: "Update your business details",
    onPress: () => console.log("Business Info"),
  },
  {
    icon: "file-text",
    title: "Export Data",
    subtitle: "Download sales reports and analytics",
    onPress: () => console.log("Export"),
  },
];

export default function BusinessSettingsView({
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
        BUSINESS
      </Text>
      <Card style={styles.sectionCard}>
        {businessSettingsLinks.map((link, index) => (
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
