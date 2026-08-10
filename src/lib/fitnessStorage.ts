/**
 * Per-account fitness data: profile, BMI history, saved training plan.
 * Synced via /api/sync under key "fitness".
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
  computeBmi,
  DEFAULT_PROFILE,
  type GeneratedPlan,
  type WorkoutProfile,
} from "@/lib/workoutPlanner";

const LEGACY_WORKOUT_PROFILES_KEY = "smartcook_workout_profiles";

export interface BmiHistoryEntry {
  date: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
}

export interface SavedFitnessPlan {
  plan: GeneratedPlan;
  generatedAt: string;
}

export interface FitnessData {
  profile: WorkoutProfile | null;
  bmiHistory: BmiHistoryEntry[];
  savedPlan: SavedFitnessPlan | null;
}

function emptyFitnessData(): FitnessData {
  return { profile: null, bmiHistory: [], savedPlan: null };
}

function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function normalizeFitnessData(raw: unknown): FitnessData {
  if (!raw || typeof raw !== "object") return emptyFitnessData();
  const obj = raw as Partial<FitnessData>;
  return {
    profile: obj.profile
      ? ({
          ...DEFAULT_PROFILE,
          ...obj.profile,
          activityFocus: obj.profile.activityFocus || "general",
        } as WorkoutProfile)
      : null,
    bmiHistory: Array.isArray(obj.bmiHistory)
      ? obj.bmiHistory.filter(
          (e): e is BmiHistoryEntry =>
            !!e &&
            typeof e === "object" &&
            typeof e.date === "string" &&
            typeof e.bmi === "number"
        )
      : [],
    savedPlan:
      obj.savedPlan &&
      typeof obj.savedPlan === "object" &&
      obj.savedPlan.plan &&
      typeof obj.savedPlan.generatedAt === "string"
        ? (obj.savedPlan as SavedFitnessPlan)
        : null,
  };
}

function migrateLegacyProfile(accountId: string): WorkoutProfile | null {
  if (!isBrowser()) return null;
  try {
    const all = JSON.parse(
      localStorage.getItem(LEGACY_WORKOUT_PROFILES_KEY) || "{}"
    ) as Record<string, WorkoutProfile>;
    return all[accountId] || all.guest || null;
  } catch {
    return null;
  }
}

export function loadFitnessData(accountId: string): FitnessData {
  if (!accountId || !isBrowser()) return emptyFitnessData();
  const key = userStorageKey(STORAGE_KEYS.FITNESS, accountId);
  const payload = getLocalPayload(key);
  if (payload) return normalizeFitnessData(payload);

  const legacy = migrateLegacyProfile(accountId);
  if (!legacy) return emptyFitnessData();

  const data: FitnessData = {
    profile: { ...DEFAULT_PROFILE, ...legacy },
    bmiHistory: [],
    savedPlan: null,
  };
  const bmi = computeBmi(legacy.heightCm, legacy.weightKg);
  if (bmi) {
    data.bmiHistory = [
      {
        date: todayKey(),
        heightCm: legacy.heightCm,
        weightKg: legacy.weightKg,
        bmi: Number(bmi.toFixed(1)),
      },
    ];
  }
  applyPayloadToLocal(key, data);
  return data;
}

export function saveFitnessData(accountId: string, data: FitnessData): void {
  if (!accountId || !isBrowser()) return;
  const key = userStorageKey(STORAGE_KEYS.FITNESS, accountId);
  applyPayloadToLocal(key, data);
  touchLocalMeta(key);
  scheduleCloudSync();
}

export function appendBmiHistory(
  history: BmiHistoryEntry[],
  profile: WorkoutProfile
): BmiHistoryEntry[] {
  const bmi = computeBmi(profile.heightCm, profile.weightKg);
  if (!bmi) return history;
  const entry: BmiHistoryEntry = {
    date: todayKey(),
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    bmi: Number(bmi.toFixed(1)),
  };
  const withoutToday = history.filter((h) => h.date !== entry.date);
  const next = [...withoutToday, entry].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  return next.slice(-60);
}

export function saveWorkoutPlanForAccount(
  accountId: string,
  profile: WorkoutProfile,
  plan: GeneratedPlan
): FitnessData {
  const existing = loadFitnessData(accountId);
  const next: FitnessData = {
    profile,
    bmiHistory: appendBmiHistory(existing.bmiHistory, profile),
    savedPlan: {
      plan,
      generatedAt: new Date().toISOString(),
    },
  };
  saveFitnessData(accountId, next);

  // Keep legacy map in sync for older pages during transition.
  if (isBrowser()) {
    try {
      const all = JSON.parse(
        localStorage.getItem(LEGACY_WORKOUT_PROFILES_KEY) || "{}"
      ) as Record<string, WorkoutProfile>;
      all[accountId] = profile;
      localStorage.setItem(LEGACY_WORKOUT_PROFILES_KEY, JSON.stringify(all));
    } catch {
      /* ignore */
    }
  }

  return next;
}
