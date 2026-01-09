import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, TouchableOpacity, View } from "react-native";
import Colors from "@/constants/Colors";
import { settingsStyles as styles } from "./settings-link-styles";

interface SettingsLinkProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showBadge?: boolean;
}

export default function SettingsLink({
  icon,
  title,
  subtitle,
  onPress,
  showBadge,
}: SettingsLinkProps) {
  const colorScheme = "light";
  const colors = Colors[colorScheme];

  return (
    <TouchableOpacity
      style={[styles.settingsLink, { borderBottomColor: colors.borderLight }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: colors.backgroundTertiary },
        ]}
      >
        <FontAwesome name={icon as any} size={18} color={colors.icon} />
      </View>

      <View style={styles.linkContent}>
        <View style={styles.linkHeader}>
          <Text style={[styles.linkTitle, { color: colors.text }]}>
            {title}
          </Text>
          {showBadge && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.badgeText, { color: colors.textInverse }]}>
                New
              </Text>
            </View>
          )}
        </View>
        {subtitle && (
          <Text style={[styles.linkSubtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>

      <FontAwesome name="chevron-right" size={14} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}
