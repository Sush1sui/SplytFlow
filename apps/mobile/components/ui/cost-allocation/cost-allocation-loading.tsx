import { Card } from "@/components/ui";
import { ActivityIndicator, Text } from "react-native";
import { costAllocationGeneralStyles as styles } from "./cost-allocation-general-styles";
import Colors from "@/constants/Colors";

export default function CostAllocationLoading() {
  const colorScheme = "light";
  const colors = Colors[colorScheme];

  return (
    <Card style={styles.loadingCard}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
        Loading split configurations...
      </Text>
    </Card>
  );
}
