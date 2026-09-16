/**
 * Per-account Japanese learning data: preferences, progress, saved schedule.
 * Synced via /api/sync under key "japanese".
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
  DEFAULT_PREFERENCES,
  generateStudySchedule,
  type GeneratedStudySchedule,
  type JapaneseLevelId,
  type StudyPreferences,
} from "@/lib/japaneseCourse";

export interface SavedJapaneseSchedule {
  schedule: GeneratedStudySchedule;
  generatedAt: string;
}

export interface JapaneseData {
  preferences: StudyPreferences | null;
  completedLessonIds: string[];
  savedSchedule: SavedJapaneseSchedule | null;
  lastStudiedAt: string | null;
}

function emptyJapaneseData(): JapaneseData {
  return {
    preferences: null,
    completedLessonIds: [],
    savedSchedule: null,
    lastStudiedAt: null,
  };
}

function normalizePreferences(raw: unknown): StudyPreferences | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Partial<StudyPreferences>;
  const level = obj.currentLevel;
  const validLevels: JapaneseLevelId[] = [
    "beginner",
    "n5",
    "n4",
    "n3",
    "n2",
    "n1",
  ];
  return {
    ...DEFAULT_PREFERENCES,
    ...obj,
    currentLevel: validLevels.includes(level as JapaneseLevelId)
      ? (level as JapaneseLevelId)
      : DEFAULT_PREFERENCES.currentLevel,
    daysPerWeek: Number(obj.daysPerWeek) || DEFAULT_PREFERENCES.daysPerWeek,
    minutesPerDay:
      Number(obj.minutesPerDay) || DEFAULT_PREFERENCES.minutesPerDay,
    weeklyDays: Array.isArray(obj.weeklyDays)
      ? obj.weeklyDays.filter((d) => typeof d === "number" && d >= 0 && d <= 6)
      : DEFAULT_PREFERENCES.weeklyDays,
  };
}

function normalizeJapaneseData(raw: unknown): JapaneseData {
  if (!raw || typeof raw !== "object") return emptyJapaneseData();
  const obj = raw as Partial<JapaneseData>;
  return {
    preferences: normalizePreferences(obj.preferences),
    completedLessonIds: Array.isArray(obj.completedLessonIds)
      ? obj.completedLessonIds.filter((id): id is string => typeof id === "string")
      : [],
    savedSchedule:
      obj.savedSchedule &&
      typeof obj.savedSchedule === "object" &&
      obj.savedSchedule.schedule &&
      typeof obj.savedSchedule.generatedAt === "string"
        ? (obj.savedSchedule as SavedJapaneseSchedule)
        : null,
    lastStudiedAt:
      typeof obj.lastStudiedAt === "string" ? obj.lastStudiedAt : null,
  };
}

export function loadJapaneseData(accountId: string): JapaneseData {
  if (!accountId || !isBrowser()) return emptyJapaneseData();
  const key = userStorageKey(STORAGE_KEYS.JAPANESE, accountId);
  const payload = getLocalPayload(key);
  if (!payload) return emptyJapaneseData();
  return normalizeJapaneseData(payload);
}

export function saveJapaneseData(accountId: string, data: JapaneseData): void {
  if (!accountId || !isBrowser()) return;
  const key = userStorageKey(STORAGE_KEYS.JAPANESE, accountId);
  applyPayloadToLocal(key, data);
  touchLocalMeta(key);
  scheduleCloudSync();
}

export function saveJapaneseScheduleForAccount(
  accountId: string,
  preferences: StudyPreferences,
  completedLessonIds: string[] = []
): JapaneseData {
  const existing = loadJapaneseData(accountId);
  const completed = completedLessonIds.length
    ? completedLessonIds
    : existing.completedLessonIds;
  const schedule = generateStudySchedule(preferences, completed);
  const next: JapaneseData = {
    preferences,
    completedLessonIds: completed,
    savedSchedule: {
      schedule,
      generatedAt: new Date().toISOString(),
    },
    lastStudiedAt: existing.lastStudiedAt,
  };
  saveJapaneseData(accountId, next);
  return next;
}

export function toggleLessonComplete(
  accountId: string,
  lessonId: string,
  completed: boolean
): JapaneseData {
  const existing = loadJapaneseData(accountId);
  const set = new Set(existing.completedLessonIds);
  if (completed) set.add(lessonId);
  else set.delete(lessonId);
  const next: JapaneseData = {
    ...existing,
    completedLessonIds: [...set],
    lastStudiedAt: completed
      ? new Date().toISOString()
      : existing.lastStudiedAt,
  };
  saveJapaneseData(accountId, next);
  return next;
}

export function markLessonsComplete(
  accountId: string,
  lessonIds: string[]
): JapaneseData {
  const existing = loadJapaneseData(accountId);
  const set = new Set(existing.completedLessonIds);
  for (const id of lessonIds) set.add(id);
  const next: JapaneseData = {
    ...existing,
    completedLessonIds: [...set],
    lastStudiedAt: new Date().toISOString(),
  };
  saveJapaneseData(accountId, next);
  return next;
}
