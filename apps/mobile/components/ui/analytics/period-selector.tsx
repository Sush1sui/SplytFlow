import { View, TouchableOpacity, Text } from "react-native";
import { analyticsGeneralStyles as styles } from "./analytics-general-styles";
import Colors from "@/constants/Colors";
import { Typography } from "@/constants/Theme";

type TimePeriod = "today" | "week" | "month" | "year";

export default function PeriodSelector({
  periods,
  selectedPeriod,
  setSelectedPeriod,
}: {
  periods: {
    value: TimePeriod;
    label: string;
  }[];
  selectedPeriod: TimePeriod;
  setSelectedPeriod: React.Dispatch<React.SetStateAction<TimePeriod>>;
}) {
  const colorScheme = "light";
  const colors = Colors[colorScheme];

  return (
    <View style={styles.periodSelector}>
      {periods.map((period) => (
        <TouchableOpacity
          key={period.value}
          style={[
            styles.periodButton,
            {
              backgroundColor:
                selectedPeriod === period.value
                  ? colors.primary
                  : colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setSelectedPeriod(period.value)}
        >
          <Text
            style={[
              styles.periodText,
              {
                color:
                  selectedPeriod === period.value
                    ? colors.textInverse
                    : colors.textSecondary,
                fontWeight:
                  selectedPeriod === period.value
                    ? Typography.weight.semibold
                    : Typography.weight.medium,
              },
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
