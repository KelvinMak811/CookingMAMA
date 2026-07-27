import type { GeneratedPlan, PlanDay, WorkoutProfile } from "@/lib/workoutPlanner";
import { matchExerciseMedia } from "@/lib/exerciseMedia";
import {
  generateActivitySuggestions,
  type ActivitySuggestion,
} from "@/lib/activityPlans";

export interface ScheduleSlot {
  time: string;
  label: string;
  durationMin: number;
}

export interface ExerciseBlock {
  label: string;
  detail: string;
  media: ReturnType<typeof matchExerciseMedia>;
}

export interface EnrichedPlanDay extends PlanDay {
  dayNumber: number;
  suggestedWeekdays: string[];
  suggestedStartTime: string;
  calendarHint: string;
  schedule: ScheduleSlot[];
  exercises: ExerciseBlock[];
  estimatedBurnKcal: number;
}

export interface EnrichedFitnessPlan extends GeneratedPlan {
  profile: WorkoutProfile;
  savedAt: string;
  enrichedDays: EnrichedPlanDay[];
  calendarWeek: { weekday: string; dayNumber: number | null; title: string }[];
  activitySuggestions: ActivitySuggestion[];
  estimatedDailyTdeeKcal: number | null;
}

const WEEKDAYS = ["週一", "週二", "週三", "週四", "週五", "週六", "週日"];

function parseDurationMinutes(duration: string): number {
  const match = duration.match(/(\d+)\s*分鐘/);
  return match ? Number(match[1]) : 30;
}

function suggestStartTime(profile: WorkoutProfile, dayIndex: number): string {
  const note = profile.notes.toLowerCase();
  if (note.includes("朝早") || note.includes("早上")) return "07:00";
  if (note.includes("晚") || note.includes("夜")) return "19:30";
  if (dayIndex === 0) return "07:30";
  if (dayIndex % 2 === 0) return "12:30";
  return "19:00";
}

function distributeWeekdays(count: number): string[] {
  const patterns: Record<number, string[]> = {
    2: ["週二", "週五"],
    3: ["週一", "週三", "週五"],
    4: ["週一", "週二", "週四", "週六"],
    5: ["週一", "週二", "週四", "週五", "週六"],
    6: ["週一", "週二", "週三", "週五", "週六", "週日"],
  };
  const base = patterns[count] || patterns[3];
  return base.slice(0, count);
}

function buildSchedule(
  profile: WorkoutProfile,
  day: PlanDay,
  startTime: string
): ScheduleSlot[] {
  const total = parseDurationMinutes(day.duration);
  const warmup = Math.min(8, Math.max(4, Math.round(profile.sessionMinutes * 0.15)));
  const main = Math.max(10, total - warmup - 5);
  return [
    { time: startTime, label: "熱身 + 啟動", durationMin: warmup },
    {
      time: addMinutes(startTime, warmup),
      label: day.title,
      durationMin: main,
    },
    {
      time: addMinutes(startTime, warmup + main),
      label: "收操 / 伸展",
      durationMin: Math.min(8, total - warmup - main),
    },
  ];
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

function estimateTdee(profile: WorkoutProfile): number | null {
  if (!profile.weightKg || !profile.heightCm || !profile.age) return null;
  const s = profile.sex === "male" ? 5 : -161;
  const bmr =
    10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + s;
  const mult =
    profile.fitnessLevel === "good"
      ? 1.55
      : profile.fitnessLevel === "moderate"
        ? 1.45
        : 1.35;
  return Math.round(bmr * mult);
}

function estimateSessionBurn(profile: WorkoutProfile, minutes: number): number {
  const weight = profile.weightKg || 65;
  const met = profile.primaryGoal === "cardio" ? 6 : 5;
  return Math.round((met * 3.5 * weight) / 200 * minutes);
}

function enrichDay(
  profile: WorkoutProfile,
  day: PlanDay,
  dayNumber: number,
  weekdays: string[]
): EnrichedPlanDay {
  const start = suggestStartTime(profile, dayNumber - 1);
  const minutes = parseDurationMinutes(day.duration);
  const exercises: ExerciseBlock[] = day.items.map((item) => ({
    label: item.label,
    detail: item.detail,
    media: matchExerciseMedia(item.label),
  }));

  return {
    ...day,
    dayNumber,
    suggestedWeekdays: weekdays,
    suggestedStartTime: start,
    calendarHint: `建議在 ${weekdays.join("、")} 其中一日，${start} 開始，預留約 ${minutes} 分鐘。`,
    schedule: buildSchedule(profile, day, start),
    exercises,
    estimatedBurnKcal: estimateSessionBurn(profile, minutes),
  };
}

export function enrichFitnessPlan(
  profile: WorkoutProfile,
  plan: GeneratedPlan
): EnrichedFitnessPlan {
  const weekdaySets = distributeWeekdays(plan.weeklyPlan.length);
  const primaryWeekdays = weekdaySets;

  const enrichedDays = plan.weeklyPlan.map((day, index) =>
    enrichDay(profile, day, index + 1, [
      primaryWeekdays[index] || WEEKDAYS[index % 7],
    ])
  );

  const calendarWeek = WEEKDAYS.map((weekday) => {
    const match = enrichedDays.find((d) => d.suggestedWeekdays.includes(weekday));
    return {
      weekday,
      dayNumber: match?.dayNumber ?? null,
      title: match?.title ?? "休息或輕鬆步行",
    };
  });

  return {
    ...plan,
    profile,
    savedAt: new Date().toISOString(),
    enrichedDays,
    calendarWeek,
    activitySuggestions: generateActivitySuggestions(profile),
    estimatedDailyTdeeKcal: estimateTdee(profile),
  };
}
