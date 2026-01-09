import { ScrollView } from "react-native";
import { View, Text } from "@/components/Themed";
import { settingsGeneralStyles as styles } from "@/components/ui/settings/settings-general-styles";
import Colors from "@/constants/Colors";

import LogoutButton from "@/components/ui/settings/LogoutButton";
import ProfileSectionSettings from "@/components/ui/settings/profile-section";
import AccountSettingsView from "@/components/ui/settings/account-settings";
import BusinessSettingsView from "@/components/ui/settings/business-settings";
import SupportAndLegalSettingsView from "@/components/ui/settings/support-and-legal";

export default function SettingsScreen() {
  const colorScheme = "light";
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Manage your account and preferences
          </Text>
        </View>

        {/* Profile Section */}
        <ProfileSectionSettings
          name="John Doe"
          email="johndoegmail.com"
          colors={colors}
        />

        {/* Account Settings */}
        <AccountSettingsView colors={colors} />

        {/* Business Settings */}
        <BusinessSettingsView colors={colors} />

        {/* Support & Legal */}
        <SupportAndLegalSettingsView colors={colors} />

        {/* Danger Zone */}
        <View style={styles.section}>
          <LogoutButton />
        </View>
      </ScrollView>
    </View>
  );
}
