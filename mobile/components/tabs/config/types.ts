export type SplitRule = {
  id: string;
  userId: string;
  name: string;
  value: number;
  createdAt?: string;
  updatedAt?: string;
};

export type SplitFeedback = {
  type: "success" | "error";
  text: string;
} | null;

export type SplitRuleFieldErrors = {
  name?: string;
  value?: string;
};

export type SplitHistorySource =
  | "live"
  | "correction_start"
  | "correction_restore";

export type SplitHistoryBreakdownItem = {
  name: string;
  value: number;
};

export type SplitCorrectionHistoryEntry = {
  id: string;
  userId: string;
  effectiveFrom: string;
  totalSplitPct: number;
  breakdownJson: unknown;
  source: SplitHistorySource;
  correctionBatchId: string | null;
  reason: string | null;
  createdAt: string;
};
