import React from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Paragraph, YStack } from "tamagui";
import useTabResponsive from "../shared/use-tab-responsive";
import SettingsPageHeader from "./settings-page-header";

const sections = [
  {
    heading: "1. What We Collect",
    body: "We collect the details you enter in the app, such as your name, email, sales records, and split settings.",
  },
  {
    heading: "2. How We Use Your Data",
    body: "We use this data to run your account, sync your records, and show your analytics in SplytFlow. We do not sell your personal data.",
  },
  {
    heading: "3. Security and Encryption",
    body: "Sensitive data is encrypted in transit and at rest where supported by our infrastructure and providers.",
  },
  {
    heading: "4. Open-Source Transparency",
    body: "SplytFlow code is open source so you can review how data is handled and reported.",
  },
  {
    heading: "5. Your Controls",
    body: "You can access and update your account information in settings. In-app account deletion is not available yet; for deletion requests, please contact support.",
  },
];

export default function PrivacyPolicyPage() {
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
          <SettingsPageHeader title="Privacy Policy" />

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
