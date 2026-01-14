import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { View, Text } from "@/components/Themed";
import { Card } from "@/components/ui";
import { Typography, Spacing, BorderRadius } from "@/constants/Theme";
import Colors from "@/constants/Colors";
import { useState, useMemo, useCallback, useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSplitConfigs, useSplitConfigsMutation } from "@/src/hooks/use-api";
import { useAuthContext } from "@/src/hooks/use-auth-context";
import { setUserId } from "@/src/lib/api-client";
import { Loading } from "@/components/Loading";

export default function CostAllocationScreen() {
  const colorScheme = "light";
  const colors = Colors[colorScheme];
  const { width: windowWidth } = useWindowDimensions();
  const [refreshing, setRefreshing] = useState(false);
  const { profile } = useAuthContext();
  const [userIdSet, setUserIdSet] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    percentage: "",
    color: "#0066FF",
  });

  // Responsive breakpoints
  const isSmallScreen = windowWidth < 380;
  const isMediumScreen = windowWidth >= 380 && windowWidth < 768;
  const isLargeScreen = windowWidth >= 768;

  // Set user ID for API calls
  useEffect(() => {
    if (profile?.id) {
      setUserId(profile.id);
      setUserIdSet(true);
    }
  }, [profile]);

  // Fetch split configs from API
  const {
    data: splitConfigs,
    loading,
    error,
    refetch,
  } = useSplitConfigs(false);

  const {
    createConfig,
    updateConfig,
    deleteConfig,
    loading: mutating,
  } = useSplitConfigsMutation();

  // Calculate total percentage
  const totalPercentage = splitConfigs.reduce(
    (sum, config) => sum + parseFloat(config.percentage),
    0
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleOpenModal = useCallback((config?: any) => {
    if (config) {
      setEditingConfig(config);
      setFormData({
        name: config.name,
        percentage: config.percentage,
        color: config.color || "#0066FF",
      });
    } else {
      setEditingConfig(null);
      setFormData({
        name: "",
        percentage: "",
        color: "#0066FF",
      });
    }
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setEditingConfig(null);
    setFormData({
      name: "",
      percentage: "",
      color: "#0066FF",
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }

    const percentage = parseFloat(formData.percentage);
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      Alert.alert("Error", "Please enter a valid percentage between 0 and 100");
      return;
    }

    // Check for duplicate color (excluding the config being edited)
    const colorExists = splitConfigs?.some(
      (config) =>
        config.color?.toLowerCase() === formData.color.toLowerCase() &&
        config.id !== editingConfig?.id
    );
    if (colorExists) {
      Alert.alert(
        "Duplicate Color",
        "This color is already used by another category. Please choose a different color for better visual distinction."
      );
      return;
    }

    try {
      if (editingConfig) {
        await updateConfig(editingConfig.id, {
          name: formData.name,
          percentage,
          color: formData.color,
        });
      } else {
        await createConfig({
          name: formData.name,
          percentage,
          color: formData.color,
        });
      }
      handleCloseModal();
      await refetch();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save split configuration");
    }
  }, [
    formData,
    editingConfig,
    createConfig,
    updateConfig,
    refetch,
    handleCloseModal,
    splitConfigs,
  ]);

  const handleDelete = useCallback(
    async (configId: number) => {
      Alert.alert(
        "Delete Split Category",
        "Are you sure you want to delete this split category?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteConfig(configId, false);
                await refetch();
              } catch (err: any) {
                Alert.alert(
                  "Error",
                  err.message || "Failed to delete split category"
                );
              }
            },
          },
        ]
      );
    },
    [deleteConfig, refetch]
  );

  // Responsive styles
  const responsiveStyles = useMemo(
    () => ({
      scrollContent: {
        padding: isSmallScreen ? Spacing.sm : Spacing.md,
      },
      title: {
        fontSize: isSmallScreen ? Typography.size.xl : Typography.size["2xl"],
      },
      summaryAmount: {
        fontSize: isSmallScreen
          ? Typography.size["2xl"]
          : Typography.size["3xl"],
      },
      actionsRow: {
        flexDirection: (isSmallScreen ? "column" : "row") as "column" | "row",
        gap: Spacing.sm,
      },
      itemHeader: {
        flexDirection: (isSmallScreen ? "column" : "row") as "column" | "row",
        gap: isSmallScreen ? Spacing.xs : 0,
      },
      itemAmount: {
        fontSize: isSmallScreen ? Typography.size.lg : Typography.size.xl,
        alignSelf: isSmallScreen
          ? "flex-start"
          : ("flex-end" as "flex-start" | "flex-end"),
      },
      recipientTags: {
        gap: Spacing.xs,
        maxWidth: (isLargeScreen ? "80%" : "100%") as any,
      },
    }),
    [isSmallScreen, isLargeScreen]
  );

  // Don't render until user ID is set
  if (!userIdSet) {
    return <Loading message="Fetching allocations..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          responsiveStyles.scrollContent,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              responsiveStyles.title,
              { color: colors.text },
            ]}
          >
            Split Configuration
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Set percentage allocation for all earnings
          </Text>
        </View>

        {loading && !refreshing ? (
          <Card style={styles.loadingCard}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading split configurations...
            </Text>
          </Card>
        ) : error ? (
          <Card style={styles.errorCard}>
            <FontAwesome
              name="exclamation-circle"
              size={48}
              color={colors.error}
            />
            <Text style={[styles.errorTitle, { color: colors.error }]}>
              Error loading configurations
            </Text>
            <Text style={[styles.errorText, { color: colors.textSecondary }]}>
              {error.message}
            </Text>
            <TouchableOpacity
              style={[
                styles.retryButton,
                {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={refetch}
            >
              <Text
                style={[styles.retryButtonText, { color: colors.textInverse }]}
              >
                Retry
              </Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <>
            {/* Summary Card */}
            <Card style={styles.summaryCard}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Total Allocation
              </Text>
              <Text
                style={[
                  styles.summaryAmount,
                  responsiveStyles.summaryAmount,
                  {
                    color:
                      totalPercentage === 100
                        ? colors.success
                        : totalPercentage > 100
                        ? colors.error
                        : colors.warning,
                  },
                ]}
              >
                {totalPercentage.toFixed(1)}%
              </Text>
              <Text
                style={[styles.summaryLabel, { color: colors.textTertiary }]}
              >
                {totalPercentage === 100
                  ? "Perfectly balanced ✓"
                  : totalPercentage > 100
                  ? "Over 100% - please adjust"
                  : `${(100 - totalPercentage).toFixed(1)}% remaining`}
              </Text>
            </Card>

            {/* Quick Actions */}
            <TouchableOpacity
              style={[
                styles.addButton,
                {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => handleOpenModal()}
            >
              <FontAwesome name="plus" size={20} color={colors.textInverse} />
              <Text
                style={[styles.addButtonText, { color: colors.textInverse }]}
              >
                Add Split Category
              </Text>
            </TouchableOpacity>

            {/* Split Configurations */}
            {splitConfigs.length > 0 ? (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Split Categories
                </Text>

                {splitConfigs.map((config) => {
                  const percentage = parseFloat(config.percentage);
                  return (
                    <Card key={config.id} style={styles.configCard}>
                      <View style={styles.configHeader}>
                        <View
                          style={[
                            styles.colorIndicator,
                            { backgroundColor: config.color || colors.primary },
                          ]}
                        />
                        <View style={styles.configInfo}>
                          <Text
                            style={[styles.configName, { color: colors.text }]}
                          >
                            {config.name}
                          </Text>
                          <Text
                            style={[
                              styles.configPercentage,
                              { color: colors.primary },
                            ]}
                          >
                            {percentage.toFixed(1)}%
                          </Text>
                        </View>
                      </View>

                      {/* Progress Bar */}
                      <View style={styles.progressBarContainer}>
                        <View
                          style={[
                            styles.progressBarBg,
                            { backgroundColor: colors.borderLight },
                          ]}
                        >
                          <View
                            style={[
                              styles.progressBarFill,
                              {
                                backgroundColor: config.color || colors.primary,
                                width: `${Math.min(percentage, 100)}%`,
                              },
                            ]}
                          />
                        </View>
                      </View>

                      {/* Actions */}
                      <View style={styles.configActions}>
                        <TouchableOpacity
                          style={styles.actionIcon}
                          onPress={() => handleOpenModal(config)}
                        >
                          <FontAwesome
                            name="edit"
                            size={18}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionIcon}
                          onPress={() => handleDelete(config.id)}
                        >
                          <FontAwesome
                            name="trash-o"
                            size={18}
                            color={colors.error}
                          />
                        </TouchableOpacity>
                      </View>
                    </Card>
                  );
                })}
              </View>
            ) : (
              <Card style={styles.emptyCard}>
                <View style={styles.emptyState}>
                  <FontAwesome
                    name="pie-chart"
                    size={48}
                    color={colors.textTertiary}
                  />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>
                    No split configurations yet
                  </Text>
                  <Text
                    style={[styles.emptyText, { color: colors.textSecondary }]}
                  >
                    Create split categories to automatically allocate your
                    earnings
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.emptyButton,
                      {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => handleOpenModal()}
                  >
                    <Text
                      style={[
                        styles.emptyButtonText,
                        { color: colors.textInverse },
                      ]}
                    >
                      Add Your First Split
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            )}
          </>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingConfig ? "Edit Split Category" : "Add Split Category"}
              </Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <FontAwesome
                  name="times"
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Category Name *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                  placeholder="e.g., Savings, Rent, Food"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              {/* Percentage Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Percentage *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  value={formData.percentage}
                  onChangeText={(text) =>
                    setFormData({ ...formData, percentage: text })
                  }
                  placeholder="0.0"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Color Picker (Simple) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Color
                </Text>
                <View style={styles.colorOptions}>
                  {[
                    "#0066FF",
                    "#10B981",
                    "#F59E0B",
                    "#EF4444",
                    "#8B5CF6",
                    "#EC4899",
                  ].map((colorOption) => (
                    <TouchableOpacity
                      key={colorOption}
                      style={[
                        styles.colorOption,
                        { backgroundColor: colorOption },
                        formData.color === colorOption &&
                          styles.colorOptionSelected,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, color: colorOption })
                      }
                    >
                      {formData.color === colorOption && (
                        <FontAwesome name="check" size={16} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  { borderColor: colors.border },
                ]}
                onPress={handleCloseModal}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.saveButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleSave}
                disabled={mutating}
              >
                {mutating ? (
                  <ActivityIndicator color={colors.textInverse} />
                ) : (
                  <Text
                    style={[
                      styles.saveButtonText,
                      { color: colors.textInverse },
                    ]}
                  >
                    {editingConfig ? "Update" : "Add"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing["2xl"],
  },
  header: {
    marginBottom: Spacing.lg,
    marginTop: Spacing["2xl"],
    paddingHorizontal: Spacing.xs,
  },
  title: {
    fontSize: Typography.size["2xl"],
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.size.base,
  },
  summaryCard: {
    marginBottom: Spacing.lg,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    marginBottom: Spacing.xs,
  },
  summaryAmount: {
    fontSize: Typography.size["3xl"],
    fontWeight: Typography.weight.bold,
    marginVertical: Spacing.xs,
  },
  summaryLabel: {
    fontSize: Typography.size.sm,
  },
  loadingCard: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.size.base,
  },
  errorCard: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
  },
  errorTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  errorText: {
    fontSize: Typography.size.base,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  retryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  retryButtonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    minHeight: 48,
  },
  addButtonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.md,
  },
  configCard: {
    marginBottom: Spacing.md,
  },
  configHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  configInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  configName: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    flex: 1,
  },
  configPercentage: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  progressBarContainer: {
    marginBottom: Spacing.md,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  configActions: {
    flexDirection: "row",
    gap: Spacing.md,
    justifyContent: "flex-end",
  },
  actionIcon: {
    padding: Spacing.xs,
  },
  emptyCard: {
    marginTop: Spacing.xl,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
  },
  emptyTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.semibold,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    fontSize: Typography.size.base,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  emptyButtonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  modalBody: {
    padding: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.size.base,
  },
  colorOptions: {
    flexDirection: "row",
    gap: Spacing.md,
    flexWrap: "wrap",
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalFooter: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  saveButton: {},
  saveButtonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
});
