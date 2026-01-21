import { ScrollView } from "react-native";
import { View, Text } from "@/components/Themed";
import { settingsGeneralStyles as styles } from "@/components/ui/settings/settings-general-styles";
import { Card } from "@/components/ui";

export default function PrivacyPolicy() {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.subtitle}>
          We respect your privacy. This page explains what data we collect, how
          we use it, and the choices you have.
        </Text>

        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Overview</Text>
          <Text style={{ color: "#444" }}>
            Splytflow collects only the data necessary to provide the service —
            account information and transaction data needed to calculate and
            track revenue splits.
          </Text>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>
            Data we collect
          </Text>
          <Text style={{ color: "#444" }}>• Account details (name, email)</Text>
          <Text style={{ color: "#444" }}>
            • Transaction and sales records used for splits and reconciliation
          </Text>
          <Text style={{ color: "#444" }}>
            • Usage and diagnostic data to improve the app
          </Text>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>
            How we use data
          </Text>
          <Text style={{ color: "#444" }}>
            We use collected data to perform split calculations, generate
            reports, integrate with payment providers, and to support and
            improve the service.
          </Text>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Security</Text>
          <Text style={{ color: "#444" }}>
            We take reasonable measures to protect your data. Access is
            restricted and sensitive data is transmitted securely.
          </Text>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Sharing</Text>
          <Text style={{ color: "#444" }}>
            We do not sell personal data. We may share information with payment
            providers and service partners strictly to provide the service, and
            as required by law.
          </Text>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>
            Your choices
          </Text>
          <Text style={{ color: "#444" }}>
            You can request data exports or account deletion by contacting
            sush1sui.dev@gmail.com. We’ll respond to legitimate requests as
            required by applicable law.
          </Text>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Contact</Text>
          <Text style={{ color: "#444" }}>sush1sui.dev@gmail.com</Text>
        </Card>
      </ScrollView>
    </View>
  );
}
