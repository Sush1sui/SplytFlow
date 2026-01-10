import { ScrollView } from "react-native";
import { View, Text } from "@/components/Themed";
import { settingsGeneralStyles as styles } from "@/components/ui/settings/settings-general-styles";
import Colors from "@/constants/Colors";

import LogoutButton from "@/components/ui/settings/LogoutButton";
import ProfileSectionSettings from "@/components/ui/settings/profile-section";
import AccountSettingsView from "@/components/ui/settings/account-settings";
import BusinessSettingsView from "@/components/ui/settings/business-settings";
import SupportAndLegalSettingsView from "@/components/ui/settings/support-and-legal";
import { useAuthContext } from "@/src/hooks/use-auth-context";
import { Redirect } from "expo-router";
import extractBefore from "@/src/utils/extractBefore";
import { Loading } from "@/components/Loading";

export default function SettingsScreen() {
  console.log("Rendering SettingsScreen");
  const colorScheme = "light";
  const colors = Colors[colorScheme];

  const { profile, isLoading } = useAuthContext();

  console.log("User Profile on SettingsScreen:", profile);

  if (isLoading) return <Loading message="Fetching Profile..." />;
  if (!profile) return <Redirect href="/(auth)" />;

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
          name={profile.display_name || `${extractBefore(profile.email, "@")}`}
          email={profile.email}
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
