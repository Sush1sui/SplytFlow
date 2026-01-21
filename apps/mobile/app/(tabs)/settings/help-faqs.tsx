import { ScrollView } from "react-native";
import { View, Text } from "@/components/Themed";
import { settingsGeneralStyles as styles } from "@/components/ui/settings/settings-general-styles";
import { Card } from "@/components/ui";

const faqs = [
  {
    question: "How are splits calculated?",
    answer:
      "Splits follow the configuration you set up in Split Configurations — percentages and priorities determine how amounts are allocated.",
  },
  {
    question: "Still need help?",
    answer: "Email sush1sui.dev@gmail.com and we'll get back to you.",
  },
];

export default function HelpFaqs() {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Help & FAQs</Text>
        <Text style={styles.subtitle}>
          Find answers to common questions about Splytflow.
        </Text>

        {faqs.map((faq, index) => (
          <Card style={{ marginTop: 12 }} key={index}>
            <Text style={{ fontWeight: "700", marginBottom: 8 }}>
              {faq.question}
            </Text>
            <Text style={{ color: "#444" }}>{faq.answer}</Text>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
