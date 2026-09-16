/**
 * Per-account SmartInvest data. Synced via /api/sync under key "invest".
 */

import {
  applyPayloadToLocal,
  getLocalPayload,
  isBrowser,
  STORAGE_KEYS,
  touchLocalMeta,
  userStorageKey,
} from "@/lib/storage";
import { scheduleCloudSync } from "@/lib/cloud-sync";
import {
  DEFAULT_INVEST_PREFERENCES,
  generateInvestSchedule,
  type GeneratedInvestSchedule,
  type InvestStudyPreferences,
  type InvestTrackId,
} from "@/lib/investCourse";

export interface SavedInvestSchedule {
  schedule: GeneratedInvestSchedule;
  generatedAt: string;
}

export interface WatchlistItem {
  quoteId: string;
  symbol: string;
  nameZh: string;
  market: "HK" | "US";
  addedAt: string;
  note?: string;
}

export interface PaperTrade {
  id: string;
  quoteId: string;
  symbol: string;
  nameZh: string;
  side: "buy" | "sell";
  shares: number;
  price: number;
  currency: "HKD" | "USD";
  at: string;
  note?: string;
}

export interface PaperPortfolio {
  cashHkd: number;
  cashUsd: number;
  trades: PaperTrade[];
}

export interface PaperHolding {
  quoteId: string;
  symbol: string;
  nameZh: string;
  currency: "HKD" | "USD";
  shares: number;
  avgCost: number;
  costBasis: number;
}

export interface MarkedHolding extends PaperHolding {
  last: number | null;
  marketValue: number | null;
  unrealizedPnl: number | null;
  unrealizedPnlPct: number | null;
}

export type PaperTradeResult =
  | { ok: true; data: InvestData }
  | { ok: false; error: string; data: InvestData };

export interface InvestPreferences {
  nickname: string;
  defaultTrack: InvestTrackId;
  daysPerWeek: number;
  minutesPerDay: number;
  weeklyDays: number[];
  paperCapitalHkd: number;
  paperCapitalUsd: number;
  riskPctPerIdea: number;
  showPennyWarning: boolean;
}

export interface InvestData {
  profile: InvestPreferences | null;
  courseProgress: string[];
  schedule: SavedInvestSchedule | null;
  watchlist: WatchlistItem[];
  paperPortfolio: PaperPortfolio;
  preferences: InvestPreferences | null;
  savedIdeas: string[];
  lastStudiedAt: string | null;
}

const DEFAULT_PAPER: PaperPortfolio = {
  cashHkd: 100000,
  cashUsd: 10000,
  trades: [],
};

function emptyInvestData(): InvestData {
  return {
    profile: null,
    courseProgress: [],
    schedule: null,
    watchlist: [],
    paperPortfolio: { ...DEFAULT_PAPER, trades: [] },
    preferences: null,
    savedIdeas: [],
    lastStudiedAt: null,
  };
}

function normalizePrefs(raw: unknown): InvestPreferences | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Partial<InvestPreferences>;
  const track: InvestTrackId =
    o.defaultTrack === "us_basics" ? "us_basics" : "hk_basics";
  return {
    nickname: typeof o.nickname === "string" ? o.nickname : "",
    defaultTrack: track,
    daysPerWeek: Number(o.daysPerWeek) || DEFAULT_INVEST_PREFERENCES.daysPerWeek,
    minutesPerDay:
      Number(o.minutesPerDay) || DEFAULT_INVEST_PREFERENCES.minutesPerDay,
    weeklyDays: Array.isArray(o.weeklyDays)
      ? o.weeklyDays.filter((d) => typeof d === "number" && d >= 0 && d <= 6)
      : DEFAULT_INVEST_PREFERENCES.weeklyDays,
    paperCapitalHkd:
      Number(o.paperCapitalHkd) || DEFAULT_INVEST_PREFERENCES.paperCapital,
    paperCapitalUsd: Number(o.paperCapitalUsd) || 10000,
    riskPctPerIdea:
      Number(o.riskPctPerIdea) || DEFAULT_INVEST_PREFERENCES.riskPctPerIdea,
    showPennyWarning: o.showPennyWarning !== false,
  };
}

function normalizePaper(raw: unknown): PaperPortfolio {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_PAPER, trades: [] };
  }
  const o = raw as Partial<PaperPortfolio>;
  const trades = Array.isArray(o.trades)
    ? o.trades.filter(
        (t): t is PaperTrade =>
          !!t &&
          typeof t === "object" &&
          typeof (t as PaperTrade).id === "string" &&
          ((t as PaperTrade).side === "buy" || (t as PaperTrade).side === "sell") &&
          typeof (t as PaperTrade).shares === "number" &&
          typeof (t as PaperTrade).price === "number"
      )
    : [];
  return {
    cashHkd: Number(o.cashHkd) || DEFAULT_PAPER.cashHkd,
    cashUsd: Number(o.cashUsd) || DEFAULT_PAPER.cashUsd,
    trades: trades.slice(-200),
  };
}

function normalizeWatchlist(raw: unknown): WatchlistItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (w): w is WatchlistItem =>
        !!w &&
        typeof w === "object" &&
        typeof (w as WatchlistItem).quoteId === "string" &&
        typeof (w as WatchlistItem).symbol === "string"
    )
    .slice(0, 50);
}

function normalizeInvestData(raw: unknown): InvestData {
  if (!raw || typeof raw !== "object") return emptyInvestData();
  const o = raw as Partial<InvestData>;
  const prefs = normalizePrefs(o.preferences ?? o.profile);
  return {
    profile: prefs,
    preferences: prefs,
    courseProgress: Array.isArray(o.courseProgress)
      ? o.courseProgress.filter((id): id is string => typeof id === "string")
      : [],
    schedule:
      o.schedule &&
      typeof o.schedule === "object" &&
      o.schedule.schedule &&
      typeof o.schedule.generatedAt === "string"
        ? (o.schedule as SavedInvestSchedule)
        : null,
    watchlist: normalizeWatchlist(o.watchlist),
    paperPortfolio: normalizePaper(o.paperPortfolio),
    savedIdeas: Array.isArray(o.savedIdeas)
      ? o.savedIdeas.filter((id): id is string => typeof id === "string")
      : [],
    lastStudiedAt:
      typeof o.lastStudiedAt === "string" ? o.lastStudiedAt : null,
  };
}

export function loadInvestData(accountId: string): InvestData {
  if (!accountId || !isBrowser()) return emptyInvestData();
  const key = userStorageKey(STORAGE_KEYS.INVEST, accountId);
  const payload = getLocalPayload(key);
  if (!payload) return emptyInvestData();
  return normalizeInvestData(payload);
}

export function saveInvestData(accountId: string, data: InvestData): void {
  if (!accountId || !isBrowser()) return;
  const key = userStorageKey(STORAGE_KEYS.INVEST, accountId);
  const prefs = data.preferences ?? data.profile;
  const normalized: InvestData = {
    ...data,
    profile: prefs,
    preferences: prefs,
  };
  applyPayloadToLocal(key, normalized);
  touchLocalMeta(key);
  scheduleCloudSync();
}

export function prefsToStudyPrefs(
  prefs: InvestPreferences
): InvestStudyPreferences {
  return {
    nickname: prefs.nickname,
    track: prefs.defaultTrack,
    daysPerWeek: prefs.daysPerWeek,
    minutesPerDay: prefs.minutesPerDay,
    weeklyDays: prefs.weeklyDays,
    paperCapital:
      prefs.defaultTrack === "us_basics"
        ? prefs.paperCapitalUsd
        : prefs.paperCapitalHkd,
    riskPctPerIdea: prefs.riskPctPerIdea,
  };
}

export function saveInvestScheduleForAccount(
  accountId: string,
  prefs: InvestPreferences,
  courseProgress?: string[]
): InvestData {
  const existing = loadInvestData(accountId);
  const completed = courseProgress ?? existing.courseProgress;
  const schedule = generateInvestSchedule(prefsToStudyPrefs(prefs), completed);
  const next: InvestData = {
    ...existing,
    profile: prefs,
    preferences: prefs,
    courseProgress: completed,
    schedule: { schedule, generatedAt: new Date().toISOString() },
  };
  saveInvestData(accountId, next);
  return next;
}

export function toggleInvestLessonComplete(
  accountId: string,
  lessonId: string,
  completed: boolean
): InvestData {
  const existing = loadInvestData(accountId);
  const set = new Set(existing.courseProgress);
  if (completed) set.add(lessonId);
  else set.delete(lessonId);
  const next: InvestData = {
    ...existing,
    courseProgress: [...set],
    lastStudiedAt: completed
      ? new Date().toISOString()
      : existing.lastStudiedAt,
  };
  saveInvestData(accountId, next);
  return next;
}

export function upsertWatchlistItem(
  accountId: string,
  item: Omit<WatchlistItem, "addedAt"> & { addedAt?: string }
): InvestData {
  const existing = loadInvestData(accountId);
  const without = existing.watchlist.filter((w) => w.quoteId !== item.quoteId);
  const nextItem: WatchlistItem = {
    ...item,
    addedAt: item.addedAt ?? new Date().toISOString(),
  };
  const next: InvestData = {
    ...existing,
    watchlist: [nextItem, ...without].slice(0, 50),
  };
  saveInvestData(accountId, next);
  return next;
}

export function removeWatchlistItem(
  accountId: string,
  quoteId: string
): InvestData {
  const existing = loadInvestData(accountId);
  const next: InvestData = {
    ...existing,
    watchlist: existing.watchlist.filter((w) => w.quoteId !== quoteId),
  };
  saveInvestData(accountId, next);
  return next;
}

export function toggleSavedIdea(
  accountId: string,
  ideaId: string,
  saved: boolean
): InvestData {
  const existing = loadInvestData(accountId);
  const set = new Set(existing.savedIdeas);
  if (saved) set.add(ideaId);
  else set.delete(ideaId);
  const next: InvestData = { ...existing, savedIdeas: [...set] };
  saveInvestData(accountId, next);
  return next;
}

/** Average-cost holdings from trade history (buys add, sells reduce). */
export function computeHoldings(trades: PaperTrade[]): PaperHolding[] {
  const map = new Map<
    string,
    {
      quoteId: string;
      symbol: string;
      nameZh: string;
      currency: "HKD" | "USD";
      shares: number;
      costBasis: number;
    }
  >();

  // Process oldest → newest
  const ordered = [...trades].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  );

  for (const t of ordered) {
    const cur = map.get(t.quoteId) ?? {
      quoteId: t.quoteId,
      symbol: t.symbol,
      nameZh: t.nameZh,
      currency: t.currency,
      shares: 0,
      costBasis: 0,
    };
    if (t.side === "buy") {
      cur.shares += t.shares;
      cur.costBasis += t.shares * t.price;
    } else {
      if (cur.shares <= 0) continue;
      const sellShares = Math.min(t.shares, cur.shares);
      const avg = cur.shares > 0 ? cur.costBasis / cur.shares : 0;
      cur.shares -= sellShares;
      cur.costBasis = Math.max(0, cur.costBasis - avg * sellShares);
    }
    cur.symbol = t.symbol;
    cur.nameZh = t.nameZh;
    cur.currency = t.currency;
    map.set(t.quoteId, cur);
  }

  return [...map.values()]
    .filter((h) => h.shares > 1e-9)
    .map((h) => ({
      quoteId: h.quoteId,
      symbol: h.symbol,
      nameZh: h.nameZh,
      currency: h.currency,
      shares: +h.shares.toFixed(4),
      avgCost: h.shares > 0 ? h.costBasis / h.shares : 0,
      costBasis: h.costBasis,
    }));
}

export function markHoldingsToMarket(
  holdings: PaperHolding[],
  quotes: { id: string; last: number }[]
): MarkedHolding[] {
  const qmap = new Map(quotes.map((q) => [q.id, q.last]));
  return holdings.map((h) => {
    const last = qmap.get(h.quoteId) ?? null;
    if (last == null) {
      return {
        ...h,
        last: null,
        marketValue: null,
        unrealizedPnl: null,
        unrealizedPnlPct: null,
      };
    }
    const marketValue = last * h.shares;
    const unrealizedPnl = marketValue - h.costBasis;
    const unrealizedPnlPct =
      h.costBasis > 0 ? (unrealizedPnl / h.costBasis) * 100 : null;
    return {
      ...h,
      last,
      marketValue,
      unrealizedPnl,
      unrealizedPnlPct,
    };
  });
}

/**
 * Record a simulated trade with cash / holdings checks.
 * Labels should mark 模擬／學習用 at the UI layer.
 */
export function tryRecordPaperTrade(
  accountId: string,
  trade: Omit<PaperTrade, "id" | "at"> & { id?: string; at?: string }
): PaperTradeResult {
  const existing = loadInvestData(accountId);
  if (!(trade.shares > 0) || !(trade.price > 0)) {
    return { ok: false, error: "股數同價格要大於 0。", data: existing };
  }

  const full: PaperTrade = {
    ...trade,
    id: trade.id ?? `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: trade.at ?? new Date().toISOString(),
  };
  const notional = full.shares * full.price;
  const portfolio = {
    ...existing.paperPortfolio,
    trades: [...existing.paperPortfolio.trades],
  };

  if (full.side === "buy") {
    const cash =
      full.currency === "HKD" ? portfolio.cashHkd : portfolio.cashUsd;
    if (cash + 1e-9 < notional) {
      return {
        ok: false,
        error: `虛擬${full.currency}現金不足（需要 ${notional.toFixed(2)}）。`,
        data: existing,
      };
    }
    if (full.currency === "HKD") portfolio.cashHkd -= notional;
    else portfolio.cashUsd -= notional;
  } else {
    const held =
      computeHoldings(portfolio.trades).find((h) => h.quoteId === full.quoteId)
        ?.shares ?? 0;
    if (held + 1e-9 < full.shares) {
      return {
        ok: false,
        error: `持倉不足（現有 ${held}，想賣 ${full.shares}）。`,
        data: existing,
      };
    }
    if (full.currency === "HKD") portfolio.cashHkd += notional;
    else portfolio.cashUsd += notional;
  }

  portfolio.trades = [full, ...portfolio.trades].slice(0, 200);
  const next: InvestData = { ...existing, paperPortfolio: portfolio };
  saveInvestData(accountId, next);
  return { ok: true, data: next };
}

/** @deprecated Prefer tryRecordPaperTrade for validation; kept for simple callers. */
export function recordPaperTrade(
  accountId: string,
  trade: Omit<PaperTrade, "id" | "at"> & { id?: string; at?: string }
): InvestData {
  const result = tryRecordPaperTrade(accountId, trade);
  return result.data;
}

export function resetPaperPortfolio(
  accountId: string,
  cashHkd?: number,
  cashUsd?: number
): InvestData {
  const existing = loadInvestData(accountId);
  const prefs = existing.preferences;
  const next: InvestData = {
    ...existing,
    paperPortfolio: {
      cashHkd: cashHkd ?? prefs?.paperCapitalHkd ?? DEFAULT_PAPER.cashHkd,
      cashUsd: cashUsd ?? prefs?.paperCapitalUsd ?? DEFAULT_PAPER.cashUsd,
      trades: [],
    },
  };
  saveInvestData(accountId, next);
  return next;
}
