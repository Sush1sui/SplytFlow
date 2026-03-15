export type SplitCreateOrUpdateBody = {
  userId: string;
  name: string;
  value: number;
};

export type DeleteSplitBody = {
  userId: string;
  name: string;
};

export type SplitCorrectionBreakdownItem = {
  name: string;
  value: number;
};

export type SplitHistoryCorrectBody = {
  userId: string;
  startAt: string;
  endAt?: string;
  breakdown: SplitCorrectionBreakdownItem[];
  reason?: string;
};
