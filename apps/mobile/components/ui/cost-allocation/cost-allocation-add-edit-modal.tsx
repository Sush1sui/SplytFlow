import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { costAllocationGeneralStyles as styles } from "./cost-allocation-general-styles";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Colors from "@/constants/Colors";

export default function CostAllocationAddEditModal({
  modalVisible,
  handleCloseModal,
  editingConfig,
  formData,
  setFormData,
  handleSave,
  mutating,
}: {
  modalVisible: boolean;
  handleCloseModal: () => void;
  editingConfig?: any;
  formData: {
    name: string;
    percentage: string;
    color: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      percentage: string;
      color: string;
    }>
  >;
  handleSave: () => Promise<void>;
  mutating: boolean;
}) {
  const colorScheme = "light";
  const colors = Colors[colorScheme];

  return (
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
                  style={[styles.saveButtonText, { color: colors.textInverse }]}
                >
                  {editingConfig ? "Update" : "Add"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
