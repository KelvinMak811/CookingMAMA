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

export function recordPaperTrade(
  accountId: string,
  trade: Omit<PaperTrade, "id" | "at"> & { id?: string; at?: string }
): InvestData {
  const existing = loadInvestData(accountId);
  const full: PaperTrade = {
    ...trade,
    id: trade.id ?? `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: trade.at ?? new Date().toISOString(),
  };
  const portfolio = { ...existing.paperPortfolio };
  const notional = full.shares * full.price;
  if (full.currency === "HKD") {
    portfolio.cashHkd =
      full.side === "buy"
        ? portfolio.cashHkd - notional
        : portfolio.cashHkd + notional;
  } else {
    portfolio.cashUsd =
      full.side === "buy"
        ? portfolio.cashUsd - notional
        : portfolio.cashUsd + notional;
  }
  portfolio.trades = [full, ...portfolio.trades].slice(0, 200);
  const next: InvestData = { ...existing, paperPortfolio: portfolio };
  saveInvestData(accountId, next);
  return next;
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
