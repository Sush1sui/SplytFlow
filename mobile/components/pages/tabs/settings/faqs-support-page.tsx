import React from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Linking,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
      "Currently, SplytFlow operates locally on your device for maximum speed and privacy.",
  },
];

export default function FaqsSupportPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={18} color="#64748b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FAQs & Support</Text>
        </View>

        {/* FAQs Section */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        <View style={styles.faqList}>
          {faqs.map((faq, index) => (
            <View
              key={faq.question}
              style={[styles.faqCard, index > 0 && styles.faqCardSpacing]}
            >
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            </View>
          ))}
        </View>

        {/* Still Need Help */}
        <Text style={[styles.sectionTitle, styles.helpTitle]}>
          Still need help?
        </Text>

        <TouchableOpacity
          style={styles.contactButton}
          activeOpacity={0.8}
          onPress={() => Linking.openURL("mailto:support@splytflow.com")}
        >
          <MaterialCommunityIcons
            name="email-outline"
            size={20}
            color="#4f46e5"
          />
          <Text style={styles.contactButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fb",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 12,
  },
  helpTitle: {
    marginTop: 28,
  },
  faqList: {
    gap: 0,
  },
  faqCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
  },
  faqCardSpacing: {
    marginTop: 10,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 13,
    fontWeight: "400",
    color: "#475569",
    lineHeight: 20,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dde4ff",
    backgroundColor: "#eef2ff",
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4f46e5",
  },
});
