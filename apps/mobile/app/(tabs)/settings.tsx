import { StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { View, Text } from "@/components/Themed";
import { Card } from "@/components/ui";
import { Typography, Spacing } from "@/constants/Theme";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface SettingsLinkProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showBadge?: boolean;
}

function SettingsLink({
  icon,
  title,
  subtitle,
  onPress,
  showBadge,
}: SettingsLinkProps) {
  const colorScheme = "light";
  const colors = Colors[colorScheme];

  return (
    <TouchableOpacity
      style={[styles.settingsLink, { borderBottomColor: colors.borderLight }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: colors.backgroundTertiary },
        ]}
      >
        <FontAwesome name={icon as any} size={18} color={colors.icon} />
      </View>

      <View style={styles.linkContent}>
        <View style={styles.linkHeader}>
          <Text style={[styles.linkTitle, { color: colors.text }]}>
            {title}
          </Text>
          {showBadge && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.badgeText, { color: colors.textInverse }]}>
                New
              </Text>
            </View>
          )}
        </View>
        {subtitle && (
          <Text style={[styles.linkSubtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>

      <FontAwesome name="chevron-right" size={14} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

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
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: colors.textInverse }]}>
                JD
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                John Doe
              </Text>
              <Text
                style={[styles.profileEmail, { color: colors.textSecondary }]}
              >
                john@example.com
              </Text>
            </View>
          </View>
        </Card>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ACCOUNT
          </Text>
          <Card style={styles.sectionCard}>
            <SettingsLink
              icon="user"
              title="Profile"
              subtitle="Update your personal information"
              onPress={() => console.log("Profile")}
            />
            <SettingsLink
              icon="calculator"
              title="Cost Allocation"
              subtitle="Manage expense categories and splits"
              onPress={() => console.log("Cost Allocation")}
            />
            <SettingsLink
              icon="bell"
              title="Notifications"
              subtitle="Configure alerts and reminders"
              onPress={() => console.log("Notifications")}
            />
          </Card>
        </View>

        {/* Business Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            BUSINESS
          </Text>
          <Card style={styles.sectionCard}>
            <SettingsLink
              icon="briefcase"
              title="Business Info"
              subtitle="Update your business details"
              onPress={() => console.log("Business Info")}
            />
            <SettingsLink
              icon="file-text"
              title="Export Data"
              subtitle="Download sales reports and analytics"
              onPress={() => console.log("Export")}
            />
          </Card>
        </View>

        {/* Support & Legal */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            SUPPORT & LEGAL
          </Text>
          <Card style={styles.sectionCard}>
            <SettingsLink
              icon="question-circle"
              title="Help & FAQs"
              subtitle="Get answers to common questions"
              onPress={() => console.log("FAQs")}
            />
            <SettingsLink
              icon="info-circle"
              title="About Splytflow"
              subtitle="Version 1.0.0"
              onPress={() => console.log("About")}
            />
            <SettingsLink
              icon="file-text-o"
              title="Terms of Service"
              onPress={() => console.log("TOS")}
            />
            <SettingsLink
              icon="shield"
              title="Privacy Policy"
              onPress={() => console.log("Privacy")}
            />
          </Card>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Card style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => console.log("Logout")}
              activeOpacity={0.7}
            >
              <Text style={[styles.logoutText, { color: colors.error }]}>
                Log Out
              </Text>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing["2xl"],
  },
  header: {
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
  },
  title: {
    fontSize: Typography.size["2xl"],
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.size.base,
  },
  profileCard: {
    marginBottom: Spacing.lg,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: Typography.size["2xl"],
    fontWeight: Typography.weight.bold,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.xs,
  },
  profileEmail: {
    fontSize: Typography.size.sm,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
    letterSpacing: 0.5,
  },
  sectionCard: {
    padding: 0,
  },
  settingsLink: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  linkContent: {
    flex: 1,
  },
  linkHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  linkTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
  },
  badge: {
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
  },
  linkSubtitle: {
    fontSize: Typography.size.sm,
    marginTop: 2,
  },
  logoutButton: {
    padding: Spacing.md,
    alignItems: "center",
  },
  logoutText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
});
