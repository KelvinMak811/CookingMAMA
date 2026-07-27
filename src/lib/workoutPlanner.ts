export type SourceKey =
  | "cdcGuidelines"
  | "cdcAdults"
  | "niaFourTypes"
  | "niaGetStarted"
  | "nhsStrengthFlex"
  | "nhsWarmup"
  | "nhsWalking"
  | "nhsPilates";

export type EquipmentId =
  | "none"
  | "mat"
  | "bands"
  | "dumbbells"
  | "bench"
  | "bike"
  | "treadmill";

export type PrimaryGoal =
  | "habit"
  | "fat-loss"
  | "strength"
  | "mobility"
  | "posture"
  | "cardio";

export interface WorkoutProfile {
  nickname: string;
  age: number;
  sex: string;
  heightCm: number;
  weightKg: number;
  bodyFat: number;
  restingHr: number;
  waistCm: number;
  primaryGoal: PrimaryGoal;
  experience: "new" | "restart" | "some";
  fitnessLevel: "low" | "moderate" | "good";
  trainingDays: number;
  sessionMinutes: number;
  dailySteps: number;
  sleepHours: number;
  stressLevel: number;
  workStyle: "desk" | "mixed" | "active" | "manual";
  trainingHistory: string;
  injuries: string;
  medicalNotes: string;
  balanceLevel: "low" | "moderate" | "good";
  mobilityLevel: "tight" | "normal" | "mobile";
  equipment: EquipmentId[];
  locationPreference: "home" | "gym" | "outdoor" | "mixed";
  trainingPreference: "balanced" | "strength" | "cardio" | "mobility";
  notes: string;
}

export interface SourceLink {
  title: string;
  org: string;
  url: string;
  note: string;
}

export interface PlanItem {
  label: string;
  detail: string;
  source: SourceKey;
}

export interface PlanDay {
  title: string;
  focus: string;
  duration: string;
  items: PlanItem[];
  coaching: string;
}

export interface GeneratedPlan {
  displayName: string;
  goalLabel: string;
  cards: { label: string; value: string }[];
  focusText: string;
  flags: string[];
  weeklyPlan: PlanDay[];
  warmup: string[];
  progression: string[];
  references: SourceLink[];
}

type Move = { name: string; reps: string; source: SourceKey };
type CardioMove = { name: string; source: SourceKey };

export const SOURCE_LINKS: Record<SourceKey, SourceLink> = {
  cdcGuidelines: {
    title: "CDC 成人身體活動指引",
    org: "CDC",
    url: "https://www.cdc.gov/physical-activity-basics/guidelines/index.html",
    note: "每週至少 150 分鐘中等強度帶氧 + 2 日肌力訓練。",
  },
  cdcAdults: {
    title: "CDC 成人運動量說明",
    org: "CDC",
    url: "https://www.cdc.gov/physical-activity-basics/adding-adults/what-counts.html",
    note: "說明強度、分配方式與肌力訓練基本做法。",
  },
  niaFourTypes: {
    title: "NIA 四大運動元素",
    org: "NIA",
    url: "https://www.nia.nih.gov/health/exercise-and-physical-activity/four-types-exercise-and-physical-activity",
    note: "耐力、力量、平衡、柔軟度都應兼顧。",
  },
  niaGetStarted: {
    title: "NIA 新手開始運動",
    org: "NIA",
    url: "https://www.nia.nih.gov/health/exercise-and-physical-activity/how-older-adults-can-get-started-exercise",
    note: "循序漸進起步，適合需要保守入門的人。",
  },
  nhsStrengthFlex: {
    title: "NHS Strength and Flex 動作影片",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/strength-and-flex-exercise-plan-how-to-videos/",
    note: "包含 sit-to-stand、standing press-up、squat 等教學。",
  },
  nhsWarmup: {
    title: "NHS 基本熱身影片",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/strength-and-resistance/body-blast-warm-up/",
    note: "訓練前可先跟住做 5 至 10 分鐘熱身。",
  },
  nhsWalking: {
    title: "NHS Walking for Health",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/walking-for-health/",
    note: "適合新手用步行建立帶氧底子。",
  },
  nhsPilates: {
    title: "NHS Pilates for Beginners",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/pilates-and-yoga/pilates-for-beginners/",
    note: "改善核心控制、姿勢與活動度。",
  },
};

const MOVEMENT_LIBRARY = {
  lower: {
    none: [
      { name: "Sit-to-Stand", reps: "8-12 次", source: "nhsStrengthFlex" },
      { name: "Box Squat / 椅子深蹲", reps: "8-12 次", source: "nhsStrengthFlex" },
      { name: "Assisted Split Squat", reps: "6-10 次/邊", source: "nhsStrengthFlex" },
    ] as Move[],
    bands: [
      { name: "Band Squat", reps: "8-12 次", source: "nhsStrengthFlex" },
      { name: "Band Romanian Deadlift", reps: "8-12 次", source: "cdcAdults" },
    ] as Move[],
    dumbbells: [
      { name: "Goblet Squat", reps: "8-10 次", source: "cdcAdults" },
      { name: "Dumbbell Romanian Deadlift", reps: "8-10 次", source: "cdcAdults" },
      { name: "Reverse Lunge", reps: "6-8 次/邊", source: "nhsStrengthFlex" },
    ] as Move[],
  },
  push: {
    none: [
      { name: "Wall Push-Up", reps: "8-12 次", source: "niaFourTypes" },
      { name: "Incline Push-Up", reps: "6-10 次", source: "nhsStrengthFlex" },
    ] as Move[],
    bands: [
      { name: "Band Chest Press", reps: "8-12 次", source: "cdcAdults" },
      { name: "Standing Press-Up", reps: "8-12 次", source: "nhsStrengthFlex" },
    ] as Move[],
    dumbbells: [
      { name: "Dumbbell Floor Press", reps: "8-10 次", source: "cdcAdults" },
      { name: "Seated Dumbbell Shoulder Press", reps: "8-10 次", source: "cdcAdults" },
    ] as Move[],
  },
  pull: {
    none: [
      { name: "Prone T Raise / 肩胛夾背", reps: "8-12 次", source: "nhsPilates" },
      { name: "Doorframe Row Isometric", reps: "20-30 秒", source: "niaFourTypes" },
    ] as Move[],
    bands: [
      { name: "Band Row", reps: "8-12 次", source: "cdcAdults" },
      { name: "Band Pull-Apart", reps: "10-15 次", source: "nhsPilates" },
    ] as Move[],
    dumbbells: [
      { name: "One-Arm Dumbbell Row", reps: "8-10 次/邊", source: "cdcAdults" },
      { name: "Chest-Supported Row", reps: "8-10 次", source: "cdcAdults" },
    ] as Move[],
  },
  core: [
    { name: "Dead Bug", reps: "6-10 次/邊", source: "nhsPilates" },
    { name: "Bird Dog", reps: "6-10 次/邊", source: "nhsPilates" },
    { name: "Glute Bridge", reps: "10-15 次", source: "nhsPilates" },
    { name: "Side Plank (膝蓋版)", reps: "15-25 秒/邊", source: "nhsPilates" },
  ] as Move[],
  cardio: {
    walk: { name: "Brisk Walk / 快步行", source: "nhsWalking" },
    bike: { name: "Easy Bike Ride", source: "cdcGuidelines" },
    treadmill: { name: "Treadmill Walk", source: "cdcGuidelines" },
  } as Record<"walk" | "bike" | "treadmill", CardioMove>,
  mobility: [
    { name: "胸椎伸展 + 開胸", source: "nhsStrengthFlex" },
    { name: "髖屈肌 / 大腿前側伸展", source: "nhsStrengthFlex" },
    { name: "小腿伸展", source: "nhsStrengthFlex" },
    { name: "肩膊活動度練習", source: "nhsStrengthFlex" },
  ] as { name: string; source: SourceKey }[],
};

export const DEFAULT_PROFILE: WorkoutProfile = {
  nickname: "",
  age: 0,
  sex: "",
  heightCm: 0,
  weightKg: 0,
  bodyFat: 0,
  restingHr: 0,
  waistCm: 0,
  primaryGoal: "habit",
  experience: "new",
  fitnessLevel: "low",
  trainingDays: 3,
  sessionMinutes: 35,
  dailySteps: 0,
  sleepHours: 0,
  stressLevel: 3,
  workStyle: "desk",
  trainingHistory: "",
  injuries: "",
  medicalNotes: "",
  balanceLevel: "moderate",
  mobilityLevel: "normal",
  equipment: ["none"],
  locationPreference: "home",
  trainingPreference: "balanced",
  notes: "",
};

export const SAMPLE_PROFILE: WorkoutProfile = {
  nickname: "阿Ling",
  age: 31,
  sex: "female",
  heightCm: 160,
  weightKg: 63,
  bodyFat: 31,
  restingHr: 74,
  waistCm: 83,
  primaryGoal: "fat-loss",
  experience: "new",
  fitnessLevel: "low",
  trainingDays: 3,
  sessionMinutes: 30,
  dailySteps: 4200,
  sleepHours: 6.5,
  stressLevel: 3,
  workStyle: "desk",
  trainingHistory: "平時返工坐得多，之前有斷斷續續跟 YouTube 做運動，但冇乜系統。",
  injuries: "落樓梯時膝頭有時唔舒服，唔想做跳躍。",
  medicalNotes: "",
  balanceLevel: "moderate",
  mobilityLevel: "tight",
  equipment: ["mat", "bands", "bench"],
  locationPreference: "home",
  trainingPreference: "balanced",
  notes: "平日晚飯前做最好，星期六可以行耐啲。",
};

export const EQUIPMENT_OPTIONS: { id: EquipmentId; label: string }[] = [
  { id: "none", label: "無器材" },
  { id: "mat", label: "瑜伽墊" },
  { id: "bands", label: "彈力帶" },
  { id: "dumbbells", label: "啞鈴" },
  { id: "bench", label: "長椅 / 穩固椅" },
  { id: "bike", label: "健身單車" },
  { id: "treadmill", label: "跑步機" },
];

export function goalLabel(goal: PrimaryGoal): string {
  return (
    {
      habit: "建立習慣",
      "fat-loss": "減脂 / 提升代謝",
      strength: "增加力量",
      mobility: "改善活動度",
      posture: "改善姿勢",
      cardio: "增強心肺",
    }[goal] || "建立習慣"
  );
}

function computeBmi(heightCm: number, weightKg: number): number | null {
  if (!heightCm || !weightKg) return null;
  const meters = heightCm / 100;
  return weightKg / (meters * meters);
}

function bmiLabel(bmi: number | null): string {
  if (!bmi) return "未提供";
  if (bmi < 18.5) return "偏輕";
  if (bmi < 24) return "一般";
  if (bmi < 27) return "偏高";
  return "較高";
}

function getEquipmentTier(equipment: EquipmentId[]): "none" | "bands" | "dumbbells" {
  if (equipment.includes("dumbbells")) return "dumbbells";
  if (equipment.includes("bands")) return "bands";
  return "none";
}

function cardioMode(profile: WorkoutProfile): CardioMove {
  if (profile.equipment.includes("bike")) return MOVEMENT_LIBRARY.cardio.bike;
  if (profile.equipment.includes("treadmill")) return MOVEMENT_LIBRARY.cardio.treadmill;
  return MOVEMENT_LIBRARY.cardio.walk;
}

function goalFocus(profile: WorkoutProfile): string {
  switch (profile.primaryGoal) {
    case "fat-loss":
      return "先提高每週總活動量，再逐步穩定力量日與步行量。";
    case "strength":
      return "用 2 至 3 日全身力量建立基本推、拉、蹲、髖主導模式。";
    case "mobility":
      return "每次都加入較多活動度與核心控制，配合低衝擊帶氧。";
    case "posture":
      return "強化臀部、上背與核心，改善久坐帶來的前傾與緊繃。";
    case "cardio":
      return "保持 2 日肌力，再把更多時間放在可持續帶氧。";
    default:
      return "重點先係建立規律，令你每週都穩定完成。";
  }
}

function readinessFlags(profile: WorkoutProfile, bmi: number | null): string[] {
  const flags: string[] = [];
  if (profile.medicalNotes) flags.push("有醫療狀況資料，開始前宜先與醫護確認訓練界線。");
  if (profile.injuries) flags.push("有傷患 / 痛症描述，任何令痛楚加劇的動作都應改輕或暫停。");
  if (profile.age >= 55) flags.push("年齡較高，計劃會更重視平衡、關節控制與漸進加量。");
  if (profile.sleepHours && profile.sleepHours < 6) {
    flags.push("睡眠偏少，恢復力可能較弱，本週應以保守強度開始。");
  }
  if (profile.stressLevel >= 4) flags.push("生活壓力偏高，先守住頻率，再慢慢增加總量。");
  if (profile.dailySteps && profile.dailySteps < 4000) {
    flags.push("日常活動量偏低，建議先把步行量穩定加上去。");
  }
  if (bmi && bmi >= 27) {
    flags.push("體重負荷較高時，先用低衝擊帶氧與控制式力量動作會更穩陣。");
  }
  return flags;
}

function buildStrengthBlock(profile: WorkoutProfile, variant: number): PlanDay {
  const tier = getEquipmentTier(profile.equipment);
  const lowerList = MOVEMENT_LIBRARY.lower[tier];
  const pushList = MOVEMENT_LIBRARY.push[tier];
  const pullList = MOVEMENT_LIBRARY.pull[tier];
  const coreList = MOVEMENT_LIBRARY.core;

  const lower = lowerList[variant % lowerList.length];
  const push = pushList[variant % pushList.length];
  const pull = pullList[variant % pullList.length];
  const core = coreList[variant % coreList.length];
  const baseSets = profile.experience === "new" ? 2 : 3;
  const rpe = profile.sleepHours && profile.sleepHours < 6 ? "RPE 5-6" : "RPE 6-7";

  return {
    title: variant === 0 ? "全身力量 A" : "全身力量 B",
    focus: "下肢、推、拉、核心基本模式",
    duration: `${Math.max(20, profile.sessionMinutes - 5)} 分鐘`,
    items: [
      { label: lower.name, detail: `${baseSets} 組 x ${lower.reps}`, source: lower.source },
      { label: push.name, detail: `${baseSets} 組 x ${push.reps}`, source: push.source },
      { label: pull.name, detail: `${baseSets} 組 x ${pull.reps}`, source: pull.source },
      { label: core.name, detail: `${baseSets} 組 x ${core.reps}`, source: core.source },
    ],
    coaching: `每組保留 2-3 下餘力，目標 ${rpe}；組間休息 60-90 秒。`,
  };
}

function buildCardioBlock(profile: WorkoutProfile, longDay: boolean): PlanDay {
  const cardio = cardioMode(profile);
  const minutes = longDay
    ? Math.max(25, profile.sessionMinutes)
    : Math.max(15, Math.min(30, profile.sessionMinutes - 5));
  const intensity =
    profile.primaryGoal === "cardio"
      ? "RPE 6，能講短句"
      : "RPE 4-5，能對話但感到有在做運動";

  return {
    title: longDay ? "低衝擊心肺耐力" : "恢復式帶氧",
    focus: "建立心肺底子，避免一開始太高衝擊",
    duration: `${minutes} 分鐘`,
    items: [
      { label: cardio.name, detail: `${minutes} 分鐘`, source: cardio.source },
      { label: "收操慢行", detail: "3-5 分鐘", source: "nhsWalking" },
    ],
    coaching: `維持 ${intensity}，訓練後應覺得有做過但唔會散晒。`,
  };
}

function buildMobilityBlock(profile: WorkoutProfile): PlanDay {
  return {
    title: "活動度 + 核心穩定",
    focus: profile.workStyle === "desk" ? "對抗久坐緊繃" : "恢復與關節活動控制",
    duration: `${Math.max(15, Math.min(30, profile.sessionMinutes - 5))} 分鐘`,
    items: MOVEMENT_LIBRARY.mobility.slice(0, 3).map((item) => ({
      label: item.name,
      detail: "每個動作 30-45 秒 / 6-8 次",
      source: item.source,
    })),
    coaching: "動作慢、呼吸穩、唔追求幅度，重視控制感。",
  };
}

function buildWeeklyPlan(profile: WorkoutProfile): PlanDay[] {
  const days: PlanDay[] = [];
  const strengthA = buildStrengthBlock(profile, 0);
  const strengthB = buildStrengthBlock(profile, 1);
  const cardio = buildCardioBlock(profile, false);
  const longCardio = buildCardioBlock(profile, true);
  const mobility = buildMobilityBlock(profile);
  const recoveryCardio = cardioMode(profile);

  days.push(strengthA);
  if (profile.trainingDays >= 3) days.push(cardio);
  days.push(strengthB);
  if (profile.trainingDays >= 4) days.push(mobility);
  if (profile.trainingDays >= 5) days.push(longCardio);
  if (profile.trainingDays >= 6) {
    days.push({
      title: "主動恢復 / 技術日",
      focus: "散步、伸展、姿勢控制",
      duration: `${Math.max(20, profile.sessionMinutes - 10)} 分鐘`,
      items: [
        {
          label: recoveryCardio.name,
          detail: "15-25 分鐘輕鬆節奏",
          source: recoveryCardio.source,
        },
        {
          label: "NHS 熱身或 Pilates 基礎",
          detail: "10-15 分鐘",
          source: "nhsPilates",
        },
      ],
      coaching: "以覺得身體順返為目標，唔好做成第 6 日硬操。",
    });
  }

  return days.slice(0, profile.trainingDays);
}

export function generateWorkoutPlan(
  profile: WorkoutProfile,
  fallbackName = "你"
): GeneratedPlan {
  const normalized: WorkoutProfile = {
    ...profile,
    trainingDays: Math.max(2, Math.min(6, Number(profile.trainingDays) || 3)),
    sessionMinutes: Math.max(15, Math.min(120, Number(profile.sessionMinutes) || 35)),
    equipment: profile.equipment?.length ? profile.equipment : ["none"],
  };

  const bmi = computeBmi(normalized.heightCm, normalized.weightKg);
  const weeklyPlan = buildWeeklyPlan(normalized);
  const trainingAgeLabel =
    normalized.experience === "new"
      ? "完全新手"
      : normalized.experience === "restart"
        ? "重啟型新手"
        : "未系統化初階";

  const referenceKeys = new Set<SourceKey>([
    "cdcGuidelines",
    "cdcAdults",
    "niaFourTypes",
    "nhsStrengthFlex",
    "nhsWarmup",
  ]);
  weeklyPlan.forEach((day) => {
    day.items.forEach((item) => referenceKeys.add(item.source));
  });

  return {
    displayName: normalized.nickname || fallbackName,
    goalLabel: goalLabel(normalized.primaryGoal),
    cards: [
      { label: "主要目標", value: goalLabel(normalized.primaryGoal) },
      { label: "訓練背景", value: trainingAgeLabel },
      {
        label: "每週安排",
        value: `${normalized.trainingDays} 日 / 每次約 ${normalized.sessionMinutes} 分鐘`,
      },
      {
        label: "體重指標",
        value: bmi ? `${bmi.toFixed(1)} BMI (${bmiLabel(bmi)})` : "未提供身高體重",
      },
    ],
    focusText: goalFocus(normalized),
    flags: readinessFlags(normalized, bmi),
    weeklyPlan,
    warmup: [
      `先做 ${normalized.sessionMinutes <= 25 ? "4-5" : "6-8"} 分鐘熱身：原地踏步、肩膊環繞、髖部活動、踝關節活動。`,
      "第一個力量動作可先做 1 組超輕鬆版本當作技術熱身。",
      "任何麻痺、刺痛、頭暈或胸口不適，立即停止並求醫。",
    ],
    progression: [
      "第 1 週：先熟習動作與節奏，全部維持 RPE 5-6，重點係完成而唔係搏盡。",
      "第 2 週：如果完成度高且無明顯痛症，每個主動作加 1-2 次，或其中 1 個動作加 1 組。",
      "第 3 週：大部分動作提升到 RPE 6-7；帶氧日可加 5-10 分鐘或略加步速。",
      `第 4 週：維持動作品質，唔使再大幅加量；回顧${
        normalized.experience === "new" ? "學動作與建立頻率" : "恢復規律與加回基本訓練量"
      }是否已變得較自然。`,
    ],
    references: Array.from(referenceKeys).map((key) => SOURCE_LINKS[key]),
  };
}
