import type {
  SaleRow,
  SalesPreset,
  SplitBreakdownTimelineItem,
  SplitItem,
} from "@/components/tabs/sales/types";

const SALES_CACHE_TTL_MS = 45_000;

type UserId = string;

type CacheKey = `${UserId}:${SalesPreset}`;

export type SalesAnalyticsCacheEntry = {
  salesRows: SaleRow[];
  splitRows: SplitItem[];
  splitTimelineRows: SplitBreakdownTimelineItem[];
  netSales: number;
  fetchedAt: number;
  version: number;
};

const cache = new Map<CacheKey, SalesAnalyticsCacheEntry>();
const userVersions = new Map<UserId, number>();

const buildKey = (userId: UserId, preset: SalesPreset): CacheKey =>
  `${userId}:${preset}`;

const getUserVersion = (userId: UserId): number =>
  userVersions.get(userId) ?? 0;

export const markSalesAnalyticsDirty = (userId?: string) => {
  if (!userId) return;
  userVersions.set(userId, getUserVersion(userId) + 1);
};

export const readSalesAnalyticsCache = (
  userId: string,
  preset: SalesPreset,
): SalesAnalyticsCacheEntry | null => {
  const entry = cache.get(buildKey(userId, preset));
  if (!entry) return null;

  const isFresh = Date.now() - entry.fetchedAt <= SALES_CACHE_TTL_MS;
  const isCurrent = entry.version === getUserVersion(userId);

  if (!isFresh || !isCurrent) return null;

  return entry;
};

export const writeSalesAnalyticsCache = (
  userId: string,
  preset: SalesPreset,
  entry: Omit<SalesAnalyticsCacheEntry, "fetchedAt" | "version">,
) => {
  cache.set(buildKey(userId, preset), {
    ...entry,
    fetchedAt: Date.now(),
    version: getUserVersion(userId),
  });
};
