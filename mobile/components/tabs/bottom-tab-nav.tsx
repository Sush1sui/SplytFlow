import React, { memo } from "react";
import { Pressable } from "react-native";
import { usePathname, useRouter, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Paragraph, XStack, YStack } from "tamagui";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTabContext, type TabSegment } from "@/lib/context/tab-context";

type TabItem = {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  segment: TabSegment;
  href: Href;
};

const TAB_ITEMS: TabItem[] = [
  {
    label: "Home",
    icon: "home-outline",
    segment: "(home)",
    href: "/(tabs)/(home)",
  },
  {
    label: "Sales",
    icon: "chart-line-variant",
    segment: "(sales)",
    href: "/(tabs)/(sales)",
  },
  {
    label: "Splits",
    icon: "layers-outline",
    segment: "(splits)",
    href: "/(tabs)/(splits)",
  },
  {
    label: "Settings",
    icon: "cog-outline",
    segment: "(settings)",
    href: "/(tabs)/(settings)",
  },
];

function BottomTabNav() {
  const { activeTab, setActiveTab } = useTabContext();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

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
        const active = activeTab === item.segment;

        return (
          <Pressable
            key={item.label}
            style={{ flex: 1 }}
            onPress={() => {
              setActiveTab(item.segment);

              // Route-level navigation ensures nested sub-pages are dismissed
              // when switching tabs (for example from settings/edit-profile).
              if (pathname !== item.href) {
                router.replace(item.href);
              }
            }}
          >
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
        );
      })}
    </XStack>
  );
}

export default memo(BottomTabNav);
