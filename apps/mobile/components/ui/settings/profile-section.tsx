import { Card } from "@/components/ui";
import { View, Text } from "react-native";
import { profileSectionStyles as styles } from "./profile-section-styles";

export default function ProfileSectionSettings({
  name,
  email,
  colors,
}: {
  name: string;
  email: string;
  colors: {
    primary: string;
    text: string;
    textSecondary: string;
    textInverse: string;
  };
}) {
  return (
    <Card style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.textInverse }]}>
            {name[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text }]}>
            {name}
          </Text>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
            {email}
          </Text>
        </View>
      </View>
    </Card>
  );
}
