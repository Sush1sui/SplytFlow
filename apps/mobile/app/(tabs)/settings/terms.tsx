import { ScrollView } from "react-native";
import { View, Text } from "@/components/Themed";
import { settingsGeneralStyles as styles } from "@/components/ui/settings/settings-general-styles";
import { Card } from "@/components/ui";

export default function TermsOfService() {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.subtitle}>
          These terms govern your use of Splytflow. By using the app you agree
          to the terms described below.
        </Text>

        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Acceptance</Text>
          <Text style={{ color: "#444" }}>
            By accessing or using Splytflow you accept and agree to these Terms
            of Service and any updates posted in the app.
          </Text>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>
            Permitted Use
          </Text>
          <Text style={{ color: "#444" }}>
            Use Splytflow only for lawful purposes and in accordance with
            applicable laws. Do not attempt to reverse-engineer, interfere with,
            or misuse the service.
          </Text>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Liability</Text>
          <Text style={{ color: "#444" }}>
            Splytflow is provided "as is". To the fullest extent permitted by
            law, we disclaim all warranties and are not liable for indirect,
            incidental, or consequential damages arising from use of the app.
          </Text>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Changes</Text>
          <Text style={{ color: "#444" }}>
            We may update these terms from time to time. Continued use after
            changes constitutes acceptance of the revised terms.
          </Text>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Contact</Text>
          <Text style={{ color: "#444" }}>
            For questions about these terms, contact sush1sui.dev@gmail.com.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}
