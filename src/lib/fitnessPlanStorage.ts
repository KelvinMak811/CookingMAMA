import type { WorkoutProfile } from "@/lib/workoutPlanner";
import { generateWorkoutPlan } from "@/lib/workoutPlanner";
import {
  enrichFitnessPlan,
  type EnrichedFitnessPlan,
} from "@/lib/fitnessPlanEnrich";

const PLAN_KEY = "smartcook_fitness_plan_v2";

export function saveFitnessPlan(
  userKey: string,
  profile: WorkoutProfile,
  fallbackName: string
): EnrichedFitnessPlan {
  const base = generateWorkoutPlan(profile, fallbackName);
  const enriched = enrichFitnessPlan(profile, base);
  if (typeof window !== "undefined") {
    try {
      const all = JSON.parse(localStorage.getItem(PLAN_KEY) || "{}") as Record<
        string,
        EnrichedFitnessPlan
      >;
      all[userKey] = enriched;
      localStorage.setItem(PLAN_KEY, JSON.stringify(all));
    } catch {
      /* ignore */
    }
  }
  return enriched;
}

export function loadFitnessPlan(userKey: string): EnrichedFitnessPlan | null {
  if (typeof window === "undefined") return null;
  try {
    const all = JSON.parse(localStorage.getItem(PLAN_KEY) || "{}") as Record<
      string,
      EnrichedFitnessPlan
    >;
    return all[userKey] || null;
  } catch {
    return null;
  }
}

export function getEnrichedDay(
  plan: EnrichedFitnessPlan,
  dayNumber: number
): EnrichedFitnessPlan["enrichedDays"][number] | null {
  return plan.enrichedDays.find((d) => d.dayNumber === dayNumber) ?? null;
}
