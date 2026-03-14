import React, { useRef, useEffect } from "react";
import {
  ScrollView,
  View,
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
import useTabsStyles from "../tabs-stylesheet";
import useSettingsStyles from "./settings-stylesheet";

// ─── Module-level: defined outside parent so React never remounts it ─────────
function SettingsRow({
  icon,
  label,
  last = false,
  tint,
  iconColor,
  tabsStyles,
  settingsStyles,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  last?: boolean;
  tint: string;
  iconColor: string;
  tabsStyles: ReturnType<typeof useTabsStyles>;
  settingsStyles: ReturnType<typeof useSettingsStyles>;
}) {
  return (
    <>
      <TouchableOpacity style={tabsStyles.rowItem} activeOpacity={0.6}>
        <View
          style={[
            tabsStyles.centerContent,
            settingsStyles.settingsIconWrap,
            { backgroundColor: `${tint}18` },
          ]}
        >
          <Ionicons name={icon} size={18} color={tint} />
        </View>
        <ThemedText style={settingsStyles.settingsLabel}>{label}</ThemedText>
        <Ionicons name="chevron-forward" size={16} color={iconColor} />
      </TouchableOpacity>
      {!last && <View style={tabsStyles.divider} />}
    </>
  );
}
// ────────────────────────────────────────────────────────────────────────────

export default function SettingsIndex() {
  const insets = useSafeAreaInsets();
  const tint = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");
  const { logout } = useAuthContext();
  const tabsStyles = useTabsStyles();
  const settingsStyles = useSettingsStyles();

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
    props: Omit<
      Parameters<typeof SettingsRow>[0],
      "tint" | "iconColor" | "tabsStyles" | "settingsStyles"
    >,
  ) => (
    <SettingsRow
      {...props}
      tint={tint}
      iconColor={iconColor}
      tabsStyles={tabsStyles}
      settingsStyles={settingsStyles}
    />
  );

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <ThemedView style={tabsStyles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          tabsStyles.scroll,
          settingsStyles.scroll,
          { paddingTop: insets.top + 24 },
        ]}
      >
        {/* Header */}
        <Animated.View
          style={[
            tabsStyles.headerRow,
            settingsStyles.header,
            animStyle(headerAnim),
          ]}
        >
          <View
            style={[
              tabsStyles.centerContent,
              settingsStyles.logoCircle,
              { backgroundColor: `${tint}18` },
            ]}
          >
            <Ionicons name="settings-outline" size={28} color={tint} />
          </View>
          <ThemedText type="title" style={tabsStyles.title}>
            Settings
          </ThemedText>
        </Animated.View>

        {/* Profile card */}
        <Animated.View style={animStyle(profileAnim)}>
          <Card style={settingsStyles.profileCard}>
            <View
              style={[
                tabsStyles.centerContent,
                settingsStyles.avatar,
                { backgroundColor: `${tint}22` },
              ]}
            >
              <Ionicons name="person" size={28} color={tint} />
            </View>
            <View style={settingsStyles.profileInfo}>
              <ThemedText style={settingsStyles.profileName}>
                Your Name
              </ThemedText>
              <ThemedText
                style={[settingsStyles.profileEmail, { color: iconColor }]}
              >
                your@email.com
              </ThemedText>
            </View>
            <Ionicons name="pencil-outline" size={18} color={iconColor} />
          </Card>
        </Animated.View>

        {/* Account */}
        <Animated.View style={animStyle(section1Anim)}>
          <ThemedText style={[tabsStyles.sectionTitle, { color: iconColor }]}>
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
          <ThemedText style={[tabsStyles.sectionTitle, { color: iconColor }]}>
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
          <View style={settingsStyles.logoutWrap}>
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
