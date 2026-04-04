import React from "react";
import { Linking, ScrollView } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Paragraph, XStack, YStack } from "tamagui";
import useToast from "@/lib/context/toast-context";
import useTabResponsive from "../shared/use-tab-responsive";
import SettingsPageHeader from "./settings-page-header";

const SUPPORT_EMAIL = "splytflow.whatsbakin@gmail.com";

const faqs = [
  {
    question: "How do I add a new split group?",
    answer:
      "Go to the Splits page and tap the + icon in the top right corner to create a new configuration.",
  },
  {
    question: "Can I edit past sales records?",
    answer:
      "Yes, go to Sales History, find your record, and tap the pencil icon to edit.",
  },
  {
    question: "Is my data synced to the cloud?",
    answer:
      "Your account data is stored securely and synced when your device is online.",
  },
];

export default function FaqsSupportPage() {
  const insets = useSafeAreaInsets();
  const { font, space } = useTabResponsive();
  const { showToast } = useToast();

  const handleContactSupport = async () => {
    const subject = encodeURIComponent("SplytFlow Support Request");
    const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${subject}`;
    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);

      if (!canOpen) {
        showToast({
          message: `Could not open your email app. Please email ${SUPPORT_EMAIL}.`,
          type: "warning",
        });
        return;
      }

      await Linking.openURL(mailtoUrl);
    } catch {
      showToast({
        message: `Could not open your email app. Please email ${SUPPORT_EMAIL}.`,
        type: "danger",
      });
    }
  };

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
          <SettingsPageHeader title="FAQs & Support" />

          <YStack gap="$2.5">
            <Paragraph
              style={{
                color: "#0f172a",
                fontWeight: "800",
                fontSize: font(17, 15, 18),
              }}
            >
              Frequently Asked Questions
            </Paragraph>

            <YStack>
              {faqs.map((faq, index) => (
                <YStack
                  key={faq.question}
                  style={{
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#e2e8f0",
                    backgroundColor: "#ffffff",
                    padding: 16,
                    marginTop: index === 0 ? 0 : 10,
                  }}
                  gap="$1.5"
                >
                  <Paragraph
                    style={{
                      color: "#0f172a",
                      fontWeight: "700",
                      fontSize: font(16, 14, 17),
                    }}
                  >
                    {faq.question}
                  </Paragraph>
                  <Paragraph
                    style={{
                      color: "#475569",
                      fontSize: font(15, 13, 16),
                      lineHeight: font(22, 20, 23),
                    }}
                  >
                    {faq.answer}
                  </Paragraph>
                </YStack>
              ))}
            </YStack>
          </YStack>

          <YStack gap="$2.5" style={{ marginTop: space(8) }}>
            <Paragraph
              style={{
                color: "#0f172a",
                fontWeight: "800",
                fontSize: font(17, 15, 18),
              }}
            >
              Still need help?
            </Paragraph>

            <Button
              onPress={handleContactSupport}
              style={{
                height: 52,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#dde4ff",
                backgroundColor: "#eef2ff",
              }}
            >
              <XStack style={{ alignItems: "center" }} gap="$2">
                <MaterialCommunityIcons
                  name="email-outline"
                  size={20}
                  color="#4f46e5"
                />
                <Paragraph
                  style={{
                    color: "#4f46e5",
                    fontWeight: "700",
                    fontSize: font(16, 14, 17),
                  }}
                >
                  Contact Support
                </Paragraph>
              </XStack>
            </Button>

            <Paragraph
              style={{
                color: "#64748b",
                fontSize: font(13, 12, 14),
                textAlign: "center",
              }}
            >
              {SUPPORT_EMAIL}
            </Paragraph>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
