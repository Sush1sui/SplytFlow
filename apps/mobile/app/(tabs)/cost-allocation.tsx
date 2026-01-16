import {
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
import Colors from "@/constants/Colors";
import { useState, useMemo, useCallback, useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSplitConfigs, useSplitConfigsMutation } from "@/src/hooks/use-api";
import { useAuthContext } from "@/src/hooks/use-auth-context";
import { setUserId } from "@/src/lib/api-client";
import { Loading } from "@/components/Loading";

import { costAllocationGeneralStyles as styles } from "@/components/ui/cost-allocation/cost-allocation-general-styles";
import CostAllocationLoading from "@/components/ui/cost-allocation/cost-allocation-loading";
import CostAllocationError from "@/components/ui/cost-allocation/cost-allocation-error";
import { costAllocationResponsiveStyles } from "@/components/ui/cost-allocation/responsiveStyles";
import CostAllocationMain from "@/components/ui/cost-allocation/cost-allocation-main";
import CostAllocationAddEditModal from "@/components/ui/cost-allocation/cost-allocation-add-edit-modal";

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
    () => costAllocationResponsiveStyles({ isSmallScreen, isLargeScreen }),
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
          <CostAllocationLoading />
        ) : error ? (
          <CostAllocationError error={error} refetch={refetch} />
        ) : (
          <CostAllocationMain
            responsiveStyles={responsiveStyles}
            totalPercentage={totalPercentage}
            handleOpenModal={handleOpenModal}
            splitConfigs={splitConfigs}
            handleDelete={handleDelete}
          />
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <CostAllocationAddEditModal
        modalVisible={modalVisible}
        handleCloseModal={handleCloseModal}
        editingConfig={editingConfig}
        formData={formData}
        setFormData={setFormData}
        handleSave={handleSave}
        mutating={mutating}
      />
    </View>
  );
}
