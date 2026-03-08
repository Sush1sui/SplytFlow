import React, { useRef, useEffect } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthContext } from "@/lib/context/auth-context";

// ─── Module-level: defined outside parent so React never remounts it ─────────
function SettingsRow({
  icon,
  label,
  last = false,
  tint,
  iconColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  last?: boolean;
  tint: string;
  iconColor: string;
}) {
  return (
    <>
      <TouchableOpacity style={styles.settingsRow} activeOpacity={0.6}>
        <View
          style={[styles.settingsIconWrap, { backgroundColor: `${tint}18` }]}
        >
          <Ionicons name={icon} size={18} color={tint} />
        </View>
        <ThemedText style={styles.settingsLabel}>{label}</ThemedText>
        <Ionicons name="chevron-forward" size={16} color={iconColor} />
      </TouchableOpacity>
      {!last && <View style={styles.divider} />}
    </>
  );
}
// ────────────────────────────────────────────────────────────────────────────

export default function SettingsIndex() {
  const insets = useSafeAreaInsets();
  const tint = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");
  const { logout } = useAuthContext();

  const headerAnim = useRef(new Animated.Value(0)).current;
  const profileAnim = useRef(new Animated.Value(0)).current;
  const section1Anim = useRef(new Animated.Value(0)).current;
  const section2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(80, [
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(profileAnim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(section1Anim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(section2Anim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
    ],
  });

  // thin helper so call sites stay readable
  const row = (
    props: Omit<Parameters<typeof SettingsRow>[0], "tint" | "iconColor">,
  ) => <SettingsRow {...props} tint={tint} iconColor={iconColor} />;

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24 }]}
      >
        {/* Header */}
        <Animated.View style={[styles.header, animStyle(headerAnim)]}>
          <View style={[styles.logoCircle, { backgroundColor: `${tint}18` }]}>
            <Ionicons name="settings-outline" size={28} color={tint} />
          </View>
          <ThemedText type="title" style={styles.title}>
            Settings
          </ThemedText>
        </Animated.View>

        {/* Profile card */}
        <Animated.View style={animStyle(profileAnim)}>
          <Card style={styles.profileCard}>
            <View style={[styles.avatar, { backgroundColor: `${tint}22` }]}>
              <Ionicons name="person" size={28} color={tint} />
            </View>
            <View style={styles.profileInfo}>
              <ThemedText style={styles.profileName}>Your Name</ThemedText>
              <ThemedText style={[styles.profileEmail, { color: iconColor }]}>
                your@email.com
              </ThemedText>
            </View>
            <Ionicons name="pencil-outline" size={18} color={iconColor} />
          </Card>
        </Animated.View>

        {/* Account */}
        <Animated.View style={animStyle(section1Anim)}>
          <ThemedText style={[styles.sectionTitle, { color: iconColor }]}>
            ACCOUNT
          </ThemedText>
          <Card>
            {row({ icon: "person-outline", label: "Edit Profile" })}
            {row({ icon: "lock-closed-outline", label: "Change Password" })}
            {row({
              icon: "notifications-outline",
              label: "Notifications",
              last: true,
            })}
          </Card>
        </Animated.View>

        {/* App */}
        <Animated.View style={animStyle(section2Anim)}>
          <ThemedText style={[styles.sectionTitle, { color: iconColor }]}>
            APP
          </ThemedText>
          <Card>
            {row({ icon: "color-palette-outline", label: "Appearance" })}
            {row({ icon: "help-circle-outline", label: "Help & Support" })}
            {row({
              icon: "information-circle-outline",
              label: "About SplytFlow",
              last: true,
            })}
          </Card>
          <View style={styles.logoutWrap}>
            <Button
              variant="outline"
              onPress={handleLogout}
              leftIcon="log-out-outline"
            >
              Sign Out
            </Button>
          </View>
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingBottom: 40, gap: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 8,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 26, fontWeight: "700" },
  profileCard: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: "600" },
  profileEmail: { fontSize: 13, marginTop: 2 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  settingsIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingsLabel: { flex: 1, fontSize: 15, fontWeight: "500" },
  divider: {
    height: 1,
    backgroundColor: "rgba(150,150,150,0.12)",
    marginVertical: 10,
  },
  logoutWrap: { marginTop: 8 },
});
