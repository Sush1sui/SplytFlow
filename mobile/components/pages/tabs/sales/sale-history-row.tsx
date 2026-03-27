import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SaleRow } from "@/types/sale.types";
import { Button, Paragraph, XStack, YStack } from "tamagui";
import { formatDateTime } from "@/lib/utils/sale";

type SaleHistoryRowProps = {
  sale: SaleRow;
  currency?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
};

export default function SaleHistoryRow({
  sale,
  currency = "$",
  onEdit,
  onDelete,
  disabled = false,
}: SaleHistoryRowProps) {
  return (
    <XStack
      style={{
        alignItems: "center",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        backgroundColor: "#ffffff",
        paddingVertical: 14,
        paddingHorizontal: 14,
      }}
      gap="$3"
    >
      <YStack
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: "#e8edff",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons
          name="file-document-outline"
          size={18}
          color="#5b5ce2"
        />
      </YStack>

      <YStack style={{ flex: 1 }}>
        <Paragraph
          style={{ color: "#0f172a", fontWeight: "800", fontSize: 16 }}
        >
          {currency}
          {sale.amount.toFixed(2)}
        </Paragraph>
        <Paragraph style={{ color: "#64748b", fontSize: 12 }}>
          {formatDateTime(sale.createdAt)}
        </Paragraph>
      </YStack>

      {(onEdit || onDelete) && (
        <XStack style={{ alignItems: "center" }} gap="$1.5">
          {onEdit && (
            <Button
              unstyled
              chromeless
              onPress={onEdit}
              disabled={disabled}
              pressStyle={{ opacity: 0.7, background: "transparent" }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                opacity: disabled ? 0.45 : 1,
              }}
            >
              <MaterialCommunityIcons
                name="pencil-outline"
                size={16}
                color="#94a3b8"
              />
            </Button>
          )}

          {onDelete && (
            <Button
              unstyled
              chromeless
              onPress={onDelete}
              disabled={disabled}
              pressStyle={{ opacity: 0.7, background: "transparent" }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                opacity: disabled ? 0.45 : 1,
              }}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={16}
                color="#94a3b8"
              />
            </Button>
          )}
        </XStack>
      )}
    </XStack>
  );
}
