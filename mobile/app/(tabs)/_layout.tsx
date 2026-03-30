import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Slot, usePathname } from "expo-router";
import { TabContext, type TabSegment } from "@/lib/context/tab-context";
import BottomTabNav from "@/components/tabs/bottom-tab-nav";
import HomeScreen from "@/components/pages/tabs/home/home-screen";
import SalesScreen from "@/components/pages/tabs/sales/sales-screen";
import SplitsScreen from "@/components/pages/tabs/splits/splits-screen";
import SettingsScreen from "@/components/pages/tabs/settings/settings-screen";

// ─── Kept-alive tab screen ──────────────────────────────────────────────────
// Mounted once. Toggled visible/invisible via `display` — zero remount cost.

function KeptAliveTab({
  segment,
  activeTab,
  children,
}: {
  segment: TabSegment;
  activeTab: TabSegment;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        { display: segment === activeTab ? "flex" : "none" },
      ]}
    >
      {children}
    </View>
  );
}

// ─── Layout ─────────────────────────────────────────────────────────────────

export default function TabsLayout() {
  const [activeTab, setActiveTab] = useState<TabSegment>("(home)");
  const pathname = usePathname();

  // Detect when a real sub-screen is active (e.g. sale-history-page).
  // Only then should the Slot layer receive touches; otherwise it must
  // be fully transparent to let the kept-alive screens underneath handle input.
  const isSubScreen =
    pathname.includes("sale-history") ||
    pathname.includes("edit-profile") ||
    pathname.includes("change-password") ||
    pathname.includes("privacy-policy") ||
    pathname.includes("terms-of-service") ||
    pathname.includes("faqs-support") ||
    (!pathname.endsWith("/(home)") &&
      !pathname.endsWith("/(sales)") &&
      !pathname.endsWith("/(splits)") &&
      !pathname.endsWith("/(settings)") &&
      pathname !== "/" &&
      pathname !== "/(tabs)");

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      <View style={{ flex: 1, backgroundColor: "#f4f6fb" }}>

        {/* Layer 0 — kept-alive screens, always mounted, toggled by display */}
        <View style={StyleSheet.absoluteFillObject}>
          <KeptAliveTab segment="(home)" activeTab={activeTab}>
            <HomeScreen />
          </KeptAliveTab>
          <KeptAliveTab segment="(sales)" activeTab={activeTab}>
            <SalesScreen />
          </KeptAliveTab>
          <KeptAliveTab segment="(splits)" activeTab={activeTab}>
            <SplitsScreen />
          </KeptAliveTab>
          <KeptAliveTab segment="(settings)" activeTab={activeTab}>
            <SettingsScreen />
          </KeptAliveTab>
        </View>

        {/*
         * Layer 1 — Slot renders sub-screens (sale-history-page etc.).
         * pointerEvents="none"  → touches fall through to the kept-alive layer
         *   when index files return null (no interactable content here).
         * pointerEvents="auto"  → sub-screen is active and must be interactive.
         *
         * Using <Slot> instead of <Stack> avoids a full navigation container
         * that would block all touches even when rendering nothing.
         */}
        <View
          style={StyleSheet.absoluteFillObject}
          pointerEvents={isSubScreen ? "auto" : "none"}
        >
          <Slot />
        </View>

        {/* Bottom nav floats above all layers */}
        <BottomTabNav />
      </View>
    </TabContext.Provider>
  );
}
