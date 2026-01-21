import { ScrollView, TouchableOpacity } from "react-native";
import { View, Text } from "@/components/Themed";
import { settingsGeneralStyles as styles } from "@/components/ui/settings/settings-general-styles";
import { Card } from "@/components/ui";
import { router } from "expo-router";

export default function AboutSplytflow() {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>About Splytflow</Text>

        <Text style={styles.subtitle}>
          We simplify how small businesses split revenue and track sales —
          reliable allocations, clear reporting, and integrations that save
          time.
        </Text>

        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>What we do</Text>
          <Text style={{ color: "#444" }}>
            Splytflow helps small businesses automate revenue splits and
            reconcile sales so you can pay partners, vendors, and contractors
            without spreadsheets or manual reconciliation.
          </Text>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>
            Key features
          </Text>
          <View style={{ gap: 8 }}>
            <Text style={{ color: "#444" }}>
              • Simple split rules (percentages & priorities)
            </Text>
            <Text style={{ color: "#444" }}>
              • Sales tracking with transaction-level detail
            </Text>
            <Text style={{ color: "#444" }}>
              • Reconciliation reports and exportable data
            </Text>
            <Text style={{ color: "#444" }}>
              • Integrations with payment providers
            </Text>
          </View>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Mission</Text>
          <Text style={{ color: "#444" }}>
            Make financial operations predictable, transparent, and fair so
            small businesses can focus on growth instead of reconciliation.
          </Text>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>
            Who it's for
          </Text>
          <Text style={{ color: "#444" }}>
            Small businesses, marketplaces, and freelance teams that need a
            simple, reliable way to split revenue and keep sales reconciled
            without spreadsheets.
          </Text>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Team</Text>
          <Text style={{ color: "#444", marginBottom: 4 }}>
            John Patrick Mercado — Founder
          </Text>
          <Text style={{ color: "#444" }}>
            (4th year Computer Science student, Pampanga State University)
          </Text>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Contact</Text>
          <Text style={{ color: "#444", marginBottom: 8 }}>
            sush1sui.dev@gmail.com
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/settings/terms")}
          >
            <Text style={{ color: "#0066CC", marginBottom: 4 }}>
              Terms of Service
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/settings/privacy")}
          >
            <Text style={{ color: "#0066CC" }}>Privacy Policy</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </View>
  );
}
