import React, { useCallback, useState } from "react";
import {
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthState, useAuthActions } from "@/lib/context/auth-context";

export default function EditProfilePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthState();
  const { updateProfile } = useAuthActions();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFirst || !trimmedLast) {
      Alert.alert("Validation Error", "First and last name are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert("Validation Error", "Please enter a valid email address.");
      return;
    }

    setSaving(true);
    try {
      await updateProfile(trimmedFirst, trimmedLast, trimmedEmail);
      Alert.alert("Success", "Profile updated successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      const message =
        error?.body?.error ?? error?.message ?? "Failed to update profile.";
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  }, [firstName, lastName, email, updateProfile, router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={saving}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={18}
              color="#64748b"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons
              name="account-outline"
              size={52}
              color="#4f46e5"
            />
          </View>
          <View style={styles.editBadge}>
            <MaterialCommunityIcons name="pencil" size={13} color="#ffffff" />
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* First & Last Name row */}
          <View style={styles.nameRow}>
            <View style={styles.halfField}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First Name"
                placeholderTextColor="#94a3b8"
                autoCapitalize="words"
                editable={!saving}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last Name"
                placeholderTextColor="#94a3b8"
                autoCapitalize="words"
                editable={!saving}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!saving}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          activeOpacity={0.85}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
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
    marginBottom: 32,
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
  avatarContainer: {
    alignSelf: "center",
    marginBottom: 32,
    position: "relative",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#dde4ff",
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#f4f6fb",
  },
  form: {
    gap: 16,
    marginBottom: 40,
  },
  nameRow: {
    flexDirection: "row",
    gap: 12,
  },
  halfField: {
    flex: 1,
    gap: 6,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#0f172a",
  },
  saveButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
});
