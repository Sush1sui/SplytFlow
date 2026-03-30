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
import { useAuthActions } from "@/lib/context/auth-context";

export default function ChangePasswordPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updatePassword } = useAuthActions();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleUpdate = useCallback(async () => {
    if (!currentPassword) {
      Alert.alert("Validation Error", "Please enter your current password.");
      return;
    }
    if (!newPassword) {
      Alert.alert("Validation Error", "Please enter a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Validation Error", "New passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      await updatePassword(currentPassword, newPassword, confirmPassword);
      Alert.alert("Success", "Password updated successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      const message =
        error?.body?.error ?? error?.message ?? "Failed to update password.";
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  }, [currentPassword, newPassword, confirmPassword, updatePassword, router]);

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
            <MaterialCommunityIcons name="arrow-left" size={18} color="#64748b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Current Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showCurrent}
                autoCapitalize="none"
                editable={!saving}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowCurrent((v) => !v)}
              >
                <MaterialCommunityIcons
                  name={showCurrent ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#94a3b8"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Create new password"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showNew}
                autoCapitalize="none"
                editable={!saving}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNew((v) => !v)}
              >
                <MaterialCommunityIcons
                  name={showNew ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#94a3b8"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm New Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                editable={!saving}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirm((v) => !v)}
              >
                <MaterialCommunityIcons
                  name={showConfirm ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#94a3b8"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={[styles.updateButton, saving && styles.updateButtonDisabled]}
          activeOpacity={0.85}
          onPress={handleUpdate}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.updateButtonText}>Update Password</Text>
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
  form: {
    gap: 20,
    marginBottom: 40,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingRight: 48,
    fontSize: 15,
    color: "#0f172a",
  },
  eyeIcon: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  updateButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
});
