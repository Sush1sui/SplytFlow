import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
          <Text style={styles.headerTitle}>Terms of Service</Text>
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
