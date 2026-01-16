import { Card } from "@/components/ui";
import { Text, TouchableOpacity } from "react-native";
import { costAllocationGeneralStyles as styles } from "./cost-allocation-general-styles";
import FontAwesome from "@expo/vector-icons/build/FontAwesome";
import Colors from "@/constants/Colors";

export default function CostAllocationError({
  error,
  refetch,
}: {
  error: Error;
  refetch: () => Promise<void>;
}) {
  const colorScheme = "light";
  const colors = Colors[colorScheme];

  return (
    <Card style={styles.errorCard}>
      <FontAwesome name="exclamation-circle" size={48} color={colors.error} />
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
        <Text style={[styles.retryButtonText, { color: colors.textInverse }]}>
          Retry
        </Text>
      </TouchableOpacity>
    </Card>
  );
}
