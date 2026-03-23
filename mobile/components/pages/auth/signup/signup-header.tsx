import { YStack, H4, Paragraph } from "tamagui";

export default function SignupHeader({
  title = "Create Account",
  subtitle = "Start tracking your sales today.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <YStack gap="$1">
      <H4 style={{ fontSize: 38, lineHeight: 42 }}>{title}</H4>
      <Paragraph style={{ color: "#5f6775", fontSize: 16 }}>
        {subtitle}
      </Paragraph>
    </YStack>
  );
}
