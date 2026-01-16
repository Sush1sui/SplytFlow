import { Card } from "@/components/ui";
import { Text, TouchableOpacity, View } from "react-native";
import { costAllocationGeneralStyles as styles } from "./cost-allocation-general-styles";
import Colors from "@/constants/Colors";
import { CostAllocationResponsiveStylesType } from "./responsiveStyles";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { SplitConfig } from "@splytflow/types";

export default function CostAllocationMain({
  responsiveStyles,
  totalPercentage,
  handleOpenModal,
  splitConfigs,
  handleDelete,
}: {
  responsiveStyles: CostAllocationResponsiveStylesType;
  totalPercentage: number;
  handleOpenModal: (config?: any) => void;
  splitConfigs: SplitConfig[];
  handleDelete: (configId: number) => Promise<void>;
}) {
  const colorScheme = "light";
  const colors = Colors[colorScheme];

  return (
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
        <Text style={[styles.summaryLabel, { color: colors.textTertiary }]}>
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
        <Text style={[styles.addButtonText, { color: colors.textInverse }]}>
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
                    <Text style={[styles.configName, { color: colors.text }]}>
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
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Create split categories to automatically allocate your earnings
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
                style={[styles.emptyButtonText, { color: colors.textInverse }]}
              >
                Add Your First Split
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}
    </>
  );
}
