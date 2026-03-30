import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const sections = [
  {
    heading: "1. Data Collection",
    body: "We collect information you provide directly to us when you create an account, such as your name, email, and tracking configurations.",
  },
  {
    heading: "2. Use of Information",
    body: "Your sales records and split configurations are stored securely on our servers. We do not sell your data to third parties.",
  },
  {
    heading: "3. Data Security",
    body: "We implement appropriate technical and organizational measures to protect the security of your personal information.",
  },
  {
    heading: "4. Your Rights",
    body: "You have the right to access, update, or delete your information at any time from the account settings page.",
  },
];

export default function PrivacyPolicyPage() {
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
          <Text style={styles.headerTitle}>Privacy Policy</Text>
        </View>

        {/* Content Card */}
        <View style={styles.card}>
          {sections.map((section, index) => (
            <View key={section.heading} style={index > 0 ? styles.sectionSpacing : undefined}>
              <Text style={styles.sectionHeading}>{section.heading}</Text>
              <Text style={styles.sectionBody}>{section.body}</Text>
            </View>
          ))}
        </View>
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
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 20,
  },
  sectionSpacing: {
    marginTop: 20,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    fontWeight: "400",
    color: "#475569",
    lineHeight: 22,
  },
});
