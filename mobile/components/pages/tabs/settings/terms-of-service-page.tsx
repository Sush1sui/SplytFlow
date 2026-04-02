import React from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Paragraph, YStack } from "tamagui";
import useTabResponsive from "../shared/use-tab-responsive";
import SettingsPageHeader from "./settings-page-header";

const sections = [
  {
    heading: "1. Acceptance",
    body: "By accessing and using SplytFlow, you agree to be bound by these Terms of Service and all applicable laws and regulations.",
  },
  {
    heading: "2. Use License",
    body: "Permission is granted to temporarily use SplytFlow for personal, non-commercial transitory viewing only.",
  },
  {
    heading: "3. Disclaimer",
    body: "The materials on SplytFlow are provided on an 'as is' basis. SplytFlow makes no warranties, expressed or implied.",
  },
  {
    heading: "4. Limitations",
    body: "In no event shall SplytFlow be liable for any damages arising out of the use or inability to use the application.",
  },
];

export default function TermsOfServicePage() {
  const insets = useSafeAreaInsets();
  const { font, space } = useTabResponsive();

  return (
    <YStack
      style={{ flex: 1, backgroundColor: "#f4f6fb", paddingTop: insets.top }}
    >
      <ScrollView
        contentContainerStyle={[
          {
            paddingHorizontal: 20,
            paddingTop: 16,
          },
          { paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <YStack gap="$4">
          <SettingsPageHeader title="Terms of Service" />

          <YStack
            style={{
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#e2e8f0",
              backgroundColor: "#ffffff",
              padding: 20,
            }}
            gap="$1"
          >
            {sections.map((section, index) => (
              <YStack
                key={section.heading}
                style={{ marginTop: index === 0 ? 0 : space(14) }}
                gap="$1.5"
              >
                <Paragraph
                  style={{
                    color: "#0f172a",
                    fontWeight: "800",
                    fontSize: font(15, 14, 16),
                  }}
                >
                  {section.heading}
                </Paragraph>
                <Paragraph
                  style={{
                    color: "#475569",
                    fontSize: font(15, 14, 16),
                    lineHeight: font(22, 21, 23),
                  }}
                >
                  {section.body}
                </Paragraph>
              </YStack>
            ))}
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
