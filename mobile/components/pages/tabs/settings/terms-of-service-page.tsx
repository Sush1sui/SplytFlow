import React from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Paragraph, YStack } from "tamagui";
import useTabResponsive from "../shared/use-tab-responsive";
import SettingsPageHeader from "./settings-page-header";

const sections = [
  {
    heading: "1. Acceptance",
    body: "By using SplytFlow, you agree to these Terms and to follow applicable laws.",
  },
  {
    heading: "2. Responsible Use",
    body: "You are responsible for the information you enter in the app and for keeping your account credentials secure.",
  },
  {
    heading: "3. Service Availability",
    body: "We work to keep SplytFlow stable and available, but temporary outages, bugs, or maintenance can happen.",
  },
  {
    heading: "4. Limits of Liability",
    body: "To the extent allowed by law, SplytFlow is not liable for indirect or consequential damages from using or being unable to use the app.",
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
