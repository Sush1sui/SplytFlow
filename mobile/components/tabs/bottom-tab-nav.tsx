import { Link, usePathname, useSegments, type Href } from "expo-router";
import React, { memo, useMemo } from "react";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Paragraph, XStack, YStack } from "tamagui";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type TabSegment = "(home)" | "(sales)" | "(splits)" | "(settings)";

type TabItem = {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  route: Href;
  segment: TabSegment;
};

const TAB_ITEMS: TabItem[] = [
  {
    label: "Home",
    icon: "home-outline",
    route: "/(tabs)/(home)" as Href,
    segment: "(home)",
  },
  {
    label: "Sales",
    icon: "chart-line-variant",
    route: "/(tabs)/(sales)" as Href,
    segment: "(sales)",
  },
  {
    label: "Splits",
    icon: "layers-outline",
    route: "/(tabs)/(splits)" as Href,
    segment: "(splits)",
  },
  {
    label: "Settings",
    icon: "cog-outline",
    route: "/(tabs)/(settings)" as Href,
    segment: "(settings)",
  },
];

function BottomTabNav() {
  const pathname = usePathname();
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  const activeGroup = segments.find((segment) => {
    return TAB_ITEMS.some((item) => item.segment === segment);
  }) as TabSegment | undefined;

  const isItemActive = useMemo(
    () => (item: TabItem) => {
      if (activeGroup) {
        return activeGroup === item.segment;
      }

      // Fallback for any non-grouped path format.
      if (item.segment === "(home)")
        return pathname.includes("/home") || pathname === "/";
      if (item.segment === "(sales)") return pathname.includes("/sales");
      if (item.segment === "(splits)") return pathname.includes("/splits");
      return pathname.includes("/settings");
    },
    [activeGroup, pathname],
  );

  return (
    <XStack
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        borderTopWidth: 1,
        borderTopColor: "#d8deea",
        paddingTop: 6,
        paddingBottom: Math.max(insets.bottom, 7),
        paddingHorizontal: 8,
        backgroundColor: "#ffffff",
      }}
    >
      {TAB_ITEMS.map((item) => {
        const active = isItemActive(item);

        return (
          <Link key={item.label} href={item.route} asChild>
            <Pressable style={{ flex: 1 }}>
              <YStack
                style={{
                  width: "100%",
                  maxWidth: 82,
                  alignSelf: "center",
                  alignItems: "center",
                  justifyContent: "center",
                  marginHorizontal: 2,
                  paddingTop: 6,
                  paddingBottom: 5,
                  minHeight: 58,
                }}
                gap={2}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={20}
                  color={active ? "#4b57ef" : "#9ca6b6"}
                />
                <Paragraph
                  style={{
                    color: active ? "#4b57ef" : "#8f99aa",
                    fontSize: 12,
                    fontWeight: active ? "700" : "500",
                  }}
                >
                  {item.label}
                </Paragraph>
                {active ? (
                  <YStack
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      marginTop: 1,
                      backgroundColor: "#4b57ef",
                    }}
                  />
                ) : (
                  <YStack style={{ height: 7, marginTop: 1 }} />
                )}
              </YStack>
            </Pressable>
          </Link>
        );
      })}
    </XStack>
  );
}

export default memo(BottomTabNav);
