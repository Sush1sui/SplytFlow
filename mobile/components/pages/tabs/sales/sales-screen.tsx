import React from "react";
import { RefreshControl, ScrollView } from "react-native";
import { YStack } from "tamagui";
import { useSalesScreen } from "./use-sales-screen";
import SalesAnalyticsSection from "./sales-analytics-section";
import SalesHistorySection from "./sales-history-section";
import SaleRecordModal from "./sale-record-modal";
import AlertDialogModal from "@/components/shared/alert-dialog-modal";
import {
  screenContainerStyle,
  scrollContentStyle,
} from "./sales-screen.styles";

export default function SalesScreen() {
  const {
    router,
    isNarrow,
    font,
    space,
    selectedRange,
    setSelectedRange,
    modalVisible,
    modalMode,
    activeSale,
    mutating,
    handleOpenModal,
    handleCloseModal,
    handleSubmitSale,
    historyRows,
    historyLoading,
    handleDeleteSale,
    alertDialogProps,
    isLoading,
    grossSales,
    netSales,
    grossChange,
    netChange,
    comparisonLabel,
    donutData,
    refreshing,
    handleRefresh,
  } = useSalesScreen();

  return (
    <YStack collapsable={false} style={screenContainerStyle}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        decelerationRate="normal"
        alwaysBounceVertical
        overScrollMode="always"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#4f46e5"
            colors={["#4f46e5"]}
          />
        }
        contentContainerStyle={scrollContentStyle}
      >
        <SalesAnalyticsSection
          isNarrow={isNarrow}
          font={font}
          space={space}
          selectedRange={selectedRange}
          setSelectedRange={setSelectedRange}
          isLoading={isLoading}
          grossSales={grossSales}
          netSales={netSales}
          grossChange={grossChange}
          netChange={netChange}
          comparisonLabel={comparisonLabel}
          donutData={donutData}
        />

        <SalesHistorySection
          font={font}
          space={space}
          router={router}
          historyRows={historyRows}
          historyLoading={historyLoading}
          mutating={mutating}
          modalVisible={modalVisible}
          onOpenModal={handleOpenModal}
          onDelete={handleDeleteSale}
        />
      </ScrollView>

      <SaleRecordModal
        visible={modalVisible}
        mode={modalMode}
        saleCreatedAt={activeSale?.createdAt ?? null}
        initialAmount={activeSale?.amount ?? null}
        onClose={handleCloseModal}
        onSubmit={handleSubmitSale}
        pending={mutating}
      />

      <AlertDialogModal {...alertDialogProps} />
    </YStack>
  );
}
