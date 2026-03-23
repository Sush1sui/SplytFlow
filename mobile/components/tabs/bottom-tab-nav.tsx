import { Link, usePathname, useSegments, type Href } from "expo-router";
import React from "react";
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
    icon: "chart-timeline-variant",
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

export default function BottomTabNav() {
  const pathname = usePathname();
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  const activeGroup = segments.find((segment) => {
    return TAB_ITEMS.some((item) => item.segment === segment);
  }) as TabSegment | undefined;

  const isItemActive = (item: TabItem) => {
    if (activeGroup) {
      return activeGroup === item.segment;
    }

    // Fallback for any non-grouped path format.
    if (item.segment === "(home)")
      return pathname.includes("/home") || pathname === "/";
    if (item.segment === "(sales)") return pathname.includes("/sales");
    if (item.segment === "(splits)") return pathname.includes("/splits");
    return pathname.includes("/settings");
  };

  return (
    <XStack
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        borderTopWidth: 1,
        borderTopColor: "#e3e7ef",
        paddingTop: 5,
        paddingBottom: Math.max(insets.bottom, 6),
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
                  alignItems: "center",
                  justifyContent: "center",
                  marginHorizontal: 4,
                  paddingVertical: 4,
                  borderRadius: 10,
                  backgroundColor: active ? "#e8eeff" : "transparent",
                  borderWidth: active ? 1 : 0,
                  borderColor: active ? "#7a72f1" : "transparent",
                }}
                gap="$1"
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={active ? 20 : 18}
                  color={active ? "#2c5dd8" : "#9aa5b5"}
                />
                <Paragraph
                  style={{
                    color: active ? "#2c5dd8" : "#9aa5b5",
                    fontSize: active ? 11 : 10,
                    fontWeight: active ? "800" : "500",
                  }}
                >
                  {item.label}
                </Paragraph>
                <YStack
                  style={{
                    width: active ? 14 : 0,
                    height: 2,
                    borderRadius: 999,
                    backgroundColor: active ? "#2c5dd8" : "transparent",
                  }}
                />
              </YStack>
            </Pressable>
          </Link>
        );
      })}
    </XStack>
  );
}
