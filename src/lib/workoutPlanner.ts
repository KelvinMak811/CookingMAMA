export type SourceKey =
  | "cdcGuidelines"
  | "cdcAdults"
  | "niaFourTypes"
  | "niaGetStarted"
  | "nhsStrengthFlex"
  | "nhsWarmup"
  | "nhsWalking"
  | "nhsPilates"
  | "nhsSwimming"
  | "swimEngland"
  | "faSkills"
  | "badmintonEngland";

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

/** Main training focus: gym/home general, or a sport track. */
export type ActivityFocus =
  | "general"
  | "swimming"
  | "soccer"
  | "badminton";

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
  activityFocus: ActivityFocus;
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
  locationPreference: "home" | "gym" | "outdoor" | "mixed" | "pool" | "court";
  trainingPreference: "balanced" | "strength" | "cardio" | "mobility";
  notes: string;
}

export interface SourceLink {
  title: string;
  org: string;
  url: string;
  note: string;
}

export interface MovementVideoRef {
  title: string;
  org: string;
  url: string;
}

export interface PlanItem {
  label: string;
  detail: string;
  source: SourceKey;
  /** Dedicated beginner video when available; otherwise falls back to SOURCE_LINKS[source]. */
  videoUrl?: string;
  videoTitle?: string;
  videoOrg?: string;
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
  nhsSwimming: {
    title: "NHS Swimming for fitness",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/swimming-for-fitness/",
    note: "低衝擊全身帶氧，適合新手建立泳力。",
  },
  swimEngland: {
    title: "Swim England 學習游泳資源",
    org: "Swim England",
    url: "https://www.swimming.org/learntoswim/",
    note: "官方學習游泳與技術入門指引。",
  },
  faSkills: {
    title: "The FA Skills 足球基礎",
    org: "The FA",
    url: "https://www.thefa.com/get-involved/player/skills",
    note: "傳球、控球、射門等新手友好技術練習。",
  },
  badmintonEngland: {
    title: "Badminton England 新手入門",
    org: "Badminton England",
    url: "https://www.badmintonengland.co.uk/play/new-to-badminton/",
    note: "握拍、步法與基本擊球入門。",
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
  activityFocus: "general",
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
  activityFocus: "general",
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

export const ACTIVITY_FOCUS_OPTIONS: {
  id: ActivityFocus;
  label: string;
  hint: string;
}[] = [
  {
    id: "general",
    label: "綜合健身（力量 + 帶氧 + 活動度）",
    hint: "家居／健身室入門訓練",
  },
  { id: "swimming", label: "游泳", hint: "技術、耐力同陸上輔助" },
  { id: "soccer", label: "足球", hint: "控球、傳射同體能" },
  { id: "badminton", label: "羽毛球", hint: "握拍、步法同擊球" },
];

export function activityFocusLabel(focus: ActivityFocus | undefined): string {
  if (!focus) return "綜合健身";
  return ACTIVITY_FOCUS_OPTIONS.find((o) => o.id === focus)?.label || "綜合健身";
}

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

export function computeBmi(heightCm: number, weightKg: number): number | null {
  if (!heightCm || !weightKg) return null;
  const meters = heightCm / 100;
  return weightKg / (meters * meters);
}

export function bmiLabel(bmi: number | null): string {
  if (!bmi) return "未提供";
  if (bmi < 18.5) return "偏輕";
  if (bmi < 24) return "一般";
  if (bmi < 27) return "偏高";
  return "較高";
}

/** Prefer official NHS / reputable beginner demos; fall back to SOURCE_LINKS. */
export const MOVEMENT_VIDEO_REFS: Record<string, MovementVideoRef> = {
  "Sit-to-Stand": {
    title: "Sit to stand 教學",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/strength-and-flex-exercise-plan-how-to-videos/",
  },
  "Box Squat / 椅子深蹲": {
    title: "Chair / box squat 教學",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/strength-and-flex-exercise-plan-how-to-videos/",
  },
  "Assisted Split Squat": {
    title: "Split squat / lunge 教學",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/strength-and-flex-exercise-plan-how-to-videos/",
  },
  "Band Squat": {
    title: "Band squat 教學",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/strength-and-flex-exercise-plan-how-to-videos/",
  },
  "Band Romanian Deadlift": {
    title: "Romanian deadlift 示範",
    org: "ACE",
    url: "https://www.youtube.com/watch?v=jEy_czb3RKA",
  },
  "Goblet Squat": {
    title: "Goblet squat 示範",
    org: "ACE",
    url: "https://www.youtube.com/watch?v=MxsFXhjs5fI",
  },
  "Dumbbell Romanian Deadlift": {
    title: "Dumbbell RDL 示範",
    org: "ACE",
    url: "https://www.youtube.com/watch?v=jEy_czb3RKA",
  },
  "Reverse Lunge": {
    title: "Reverse lunge 教學",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/strength-and-flex-exercise-plan-how-to-videos/",
  },
  "Wall Push-Up": {
    title: "Wall press-up 教學",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/strength-and-flex-exercise-plan-how-to-videos/",
  },
  "Incline Push-Up": {
    title: "Standing / incline press-up",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/strength-and-flex-exercise-plan-how-to-videos/",
  },
  "Band Chest Press": {
    title: "Band chest press 示範",
    org: "ACE",
    url: "https://www.youtube.com/watch?v=nAwTQNXX5M8",
  },
  "Standing Press-Up": {
    title: "Standing press-up 教學",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/strength-and-flex-exercise-plan-how-to-videos/",
  },
  "Dumbbell Floor Press": {
    title: "Dumbbell floor press 示範",
    org: "ACE",
    url: "https://www.youtube.com/watch?v=uUG3qYvMDdw",
  },
  "Seated Dumbbell Shoulder Press": {
    title: "Seated shoulder press 示範",
    org: "ACE",
    url: "https://www.youtube.com/watch?v=qEwKCE5bpAw",
  },
  "Prone T Raise / 肩胛夾背": {
    title: "Pilates 背部／肩胛控制",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/pilates-and-yoga/pilates-for-beginners/",
  },
  "Doorframe Row Isometric": {
    title: "四類運動：力量／姿勢",
    org: "NIA",
    url: "https://www.nia.nih.gov/health/exercise-and-physical-activity/four-types-exercise-and-physical-activity",
  },
  "Band Row": {
    title: "Band row 示範",
    org: "ACE",
    url: "https://www.youtube.com/watch?v=GZbfZ033f74",
  },
  "Band Pull-Apart": {
    title: "Band pull-apart 示範",
    org: "ACE",
    url: "https://www.youtube.com/watch?v=s80DxdRqWwI",
  },
  "One-Arm Dumbbell Row": {
    title: "One-arm dumbbell row 示範",
    org: "ACE",
    url: "https://www.youtube.com/watch?v=roCP6wCXPqo",
  },
  "Chest-Supported Row": {
    title: "Supported row 示範",
    org: "ACE",
    url: "https://www.youtube.com/watch?v=H75im9fAUYk",
  },
  "Dead Bug": {
    title: "Dead bug / 核心控制",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/pilates-and-yoga/pilates-for-beginners/",
  },
  "Bird Dog": {
    title: "Bird dog 示範",
    org: "ACE",
    url: "https://www.youtube.com/watch?v=wiFNA3sqjCA",
  },
  "Glute Bridge": {
    title: "Glute bridge 示範",
    org: "ACE",
    url: "https://www.youtube.com/watch?v=OUgsJNdzE6M",
  },
  "Side Plank (膝蓋版)": {
    title: "Side plank 新手版",
    org: "ACE",
    url: "https://www.youtube.com/watch?v=K2VljzCC16g",
  },
  "Brisk Walk / 快步行": {
    title: "Walking for health",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/walking-for-health/",
  },
  "Easy Bike Ride": {
    title: "成人帶氧活動指引",
    org: "CDC",
    url: "https://www.cdc.gov/physical-activity-basics/guidelines/index.html",
  },
  "Treadmill Walk": {
    title: "成人帶氧活動指引",
    org: "CDC",
    url: "https://www.cdc.gov/physical-activity-basics/guidelines/index.html",
  },
  "收操慢行": {
    title: "Walking for health",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/walking-for-health/",
  },
  "胸椎伸展 + 開胸": {
    title: "Strength and Flex 伸展影片",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/strength-and-flex-exercise-plan-how-to-videos/",
  },
  "髖屈肌 / 大腿前側伸展": {
    title: "Strength and Flex 伸展影片",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/strength-and-flex-exercise-plan-how-to-videos/",
  },
  "小腿伸展": {
    title: "Strength and Flex 伸展影片",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/strength-and-flex-exercise-plan-how-to-videos/",
  },
  "肩膊活動度練習": {
    title: "基本熱身影片",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/strength-and-resistance/body-blast-warm-up/",
  },
  "NHS 熱身或 Pilates 基礎": {
    title: "Pilates for beginners",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/pilates-and-yoga/pilates-for-beginners/",
  },
  // Swimming
  "泳池熱身步行／浮板踢水": {
    title: "Swimming for fitness",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/swimming-for-fitness/",
  },
  "自由泳踢水（浮板）": {
    title: "Learn to swim resources",
    org: "Swim England",
    url: "https://www.swimming.org/learntoswim/",
  },
  "自由泳 Catch-up 技術": {
    title: "Freestyle technique basics",
    org: "Swim England",
    url: "https://www.youtube.com/watch?v=5HLWMbV6QVw",
  },
  "輕鬆連續游（休息游）": {
    title: "Swimming for fitness",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/swimming-for-fitness/",
  },
  "陸上核心 + 肩胛穩定": {
    title: "Pilates for beginners",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/pilates-and-yoga/pilates-for-beginners/",
  },
  "仰泳／蛙泳入門試水": {
    title: "Learn to swim resources",
    org: "Swim England",
    url: "https://www.swimming.org/learntoswim/",
  },
  "輕鬆混游恢復": {
    title: "Swimming for fitness",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/swimming-for-fitness/",
  },
  // Soccer
  "球感：左右腳輕碰球": {
    title: "FA Skills — ball mastery",
    org: "The FA",
    url: "https://www.youtube.com/watch?v=1cVkH7bVb3Y",
  },
  "短傳雙人／牆傳": {
    title: "FA Skills — passing",
    org: "The FA",
    url: "https://www.thefa.com/get-involved/player/skills",
  },
  "走跑交替體能": {
    title: "Walking for health",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/walking-for-health/",
  },
  "射門基本（近距離推射）": {
    title: "FA Skills — shooting",
    org: "The FA",
    url: "https://www.thefa.com/get-involved/player/skills",
  },
  "低衝擊變向步法": {
    title: "FA Skills — movement",
    org: "The FA",
    url: "https://www.thefa.com/get-involved/player/skills",
  },
  "1v1 / 小組趣味練習": {
    title: "FA Skills",
    org: "The FA",
    url: "https://www.thefa.com/get-involved/player/skills",
  },
  // Badminton
  "握拍與準備姿勢": {
    title: "New to badminton",
    org: "Badminton England",
    url: "https://www.badmintonengland.co.uk/play/new-to-badminton/",
  },
  "高遠球 Clear 影子揮拍": {
    title: "Clear technique demo",
    org: "Badminton England",
    url: "https://www.youtube.com/watch?v=V5dQ4pJbQ3I",
  },
  "六點步法影子移動": {
    title: "Footwork basics",
    org: "Badminton England",
    url: "https://www.youtube.com/watch?v=YQxq5XW2u3E",
  },
  "發球與對打練習": {
    title: "Serve basics",
    org: "Badminton England",
    url: "https://www.badmintonengland.co.uk/play/new-to-badminton/",
  },
  "肩膊護理 + 輕帶氧": {
    title: "基本熱身影片",
    org: "NHS",
    url: "https://www.nhs.uk/live-well/exercise/strength-and-resistance/body-blast-warm-up/",
  },
  "輕鬆吊球／網前觸球": {
    title: "New to badminton",
    org: "Badminton England",
    url: "https://www.badmintonengland.co.uk/play/new-to-badminton/",
  },
};

export function resolveMovementVideo(
  label: string,
  source: SourceKey
): MovementVideoRef {
  const dedicated = MOVEMENT_VIDEO_REFS[label];
  if (dedicated) return dedicated;
  const fallback = SOURCE_LINKS[source];
  return {
    title: fallback.title,
    org: fallback.org,
    url: fallback.url,
  };
}

export function enrichPlanItem(item: PlanItem): PlanItem {
  const video = resolveMovementVideo(item.label, item.source);
  return {
    ...item,
    videoUrl: item.videoUrl || video.url,
    videoTitle: item.videoTitle || video.title,
    videoOrg: item.videoOrg || video.org,
  };
}

function enrichPlanDay(day: PlanDay): PlanDay {
  return { ...day, items: day.items.map(enrichPlanItem) };
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
  if (profile.activityFocus === "swimming") {
    return "以泳姿技術同輕鬆耐力為先，再加陸上核心／肩胛穩定，避免一開始猛游長距離。";
  }
  if (profile.activityFocus === "soccer") {
    return "先建立球感、短傳同低衝擊體能，再逐步加入射門與趣味對抗；膝蓋有不適就減少變向與衝刺。";
  }
  if (profile.activityFocus === "badminton") {
    return "先學握拍、準備姿勢同步法，再練高遠球與發球對打；肩膊要熱身充足，唔好一開始就大力殺球。";
  }
  switch (profile.primaryGoal) {
    case "fat-loss":
      return "先提高每週總活動量，再逐步穩定力量日與步行量。";
    case "strength":
      return "用 2 至 3 日全身力量建立基本推、拉、蹲、髖主導模式。";
    case "mobility":
      return "以活動度與核心穩定為主，配合輕量力量維持關節控制。";
    case "posture":
      return "針對久坐緊繃：開胸、髖屈肌、背部拉力與核心控制並重。";
    case "cardio":
      return "以可對話節奏的帶氧為主，並保留最少 2 日全身力量。";
    default:
      return "先建立穩定訓練頻率，力量、帶氧與活動度平均安排。";
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

function buildSportWeeklyPlan(profile: WorkoutProfile): PlanDay[] {
  const minutes = Math.max(20, profile.sessionMinutes);
  const focus = profile.activityFocus;

  const swimmingDays: PlanDay[] = [
    {
      title: "自由泳技術日",
      focus: "踢水同划手節奏，唔追求距離",
      duration: `${minutes} 分鐘`,
      items: [
        { label: "泳池熱身步行／浮板踢水", detail: "5-8 分鐘", source: "nhsSwimming" },
        { label: "自由泳踢水（浮板）", detail: "4-6 x 25m，休息充足", source: "swimEngland" },
        { label: "自由泳 Catch-up 技術", detail: "4-8 x 25m，慢而準", source: "swimEngland" },
      ],
      coaching: "保持輕鬆呼吸；覺得氣喘就縮短每段距離。",
    },
    {
      title: "輕鬆耐力游",
      focus: "建立水中持續力",
      duration: `${minutes} 分鐘`,
      items: [
        { label: "輕鬆連續游（休息游）", detail: `${Math.max(12, minutes - 10)} 分鐘，可隨時扶邊休息`, source: "nhsSwimming" },
        { label: "陸上核心 + 肩胛穩定", detail: "上岸後 8-10 分鐘", source: "nhsPilates" },
      ],
      coaching: "能對話節奏；唔好第一週就拼完場池。",
    },
    {
      title: "陸上恢復 + 肩胛",
      focus: "保護肩膀、核心控制",
      duration: `${Math.max(20, minutes - 5)} 分鐘`,
      items: [
        { label: "陸上核心 + 肩胛穩定", detail: "12-15 分鐘", source: "nhsPilates" },
        { label: "胸椎伸展 + 開胸", detail: "每個 30-45 秒", source: "nhsStrengthFlex" },
        { label: "肩膊活動度練習", detail: "6-8 分鐘", source: "nhsWarmup" },
      ],
      coaching: "肩膊有刺痛就立即停；幅度細過痛楚界線。",
    },
    {
      title: "第二泳姿試水",
      focus: "仰泳或蛙泳入門",
      duration: `${minutes} 分鐘`,
      items: [
        { label: "泳池熱身步行／浮板踢水", detail: "5 分鐘", source: "nhsSwimming" },
        { label: "仰泳／蛙泳入門試水", detail: "6-10 x 15-25m", source: "swimEngland" },
        { label: "輕鬆混游恢復", detail: "5-8 分鐘", source: "nhsSwimming" },
      ],
      coaching: "只選一種新泳姿；技術未熟就繼續用浮板輔助。",
    },
    {
      title: "耐力加技術混合",
      focus: "把技術帶入稍長段落",
      duration: `${minutes} 分鐘`,
      items: [
        { label: "自由泳 Catch-up 技術", detail: "4 x 25m", source: "swimEngland" },
        { label: "輕鬆連續游（休息游）", detail: `${Math.max(10, minutes - 15)} 分鐘`, source: "nhsSwimming" },
      ],
      coaching: "划手質素優先於速度。",
    },
    {
      title: "主動恢復",
      focus: "輕鬆游或伸展",
      duration: `${Math.max(20, minutes - 10)} 分鐘`,
      items: [
        { label: "輕鬆混游恢復", detail: "10-15 分鐘", source: "nhsSwimming" },
        { label: "髖屈肌 / 大腿前側伸展", detail: "每個 30-45 秒", source: "nhsStrengthFlex" },
      ],
      coaching: "以身體放鬆為目標，唔好當硬操日。",
    },
  ];

  const soccerDays: PlanDay[] = [
    {
      title: "球感 + 短傳",
      focus: "左右腳控球同傳球準度",
      duration: `${minutes} 分鐘`,
      items: [
        { label: "球感：左右腳輕碰球", detail: "8-10 分鐘", source: "faSkills" },
        { label: "短傳雙人／牆傳", detail: "10-15 分鐘", source: "faSkills" },
        { label: "收操慢行", detail: "3-5 分鐘", source: "nhsWalking" },
      ],
      coaching: "先求觸球次數同準度，唔使大力傳。",
    },
    {
      title: "低衝擊體能日",
      focus: "走跑交替 + 核心",
      duration: `${minutes} 分鐘`,
      items: [
        { label: "走跑交替體能", detail: `${Math.max(12, minutes - 10)} 分鐘（行 2 分鐘／慢跑 1 分鐘）`, source: "nhsWalking" },
        { label: "Glute Bridge", detail: "2 組 x 10-15 次", source: "nhsPilates" },
        { label: "Dead Bug", detail: "2 組 x 6-10 次/邊", source: "nhsPilates" },
      ],
      coaching: "膝蓋不適就改成全程快步行，唔好硬跑。",
    },
    {
      title: "射門基礎",
      focus: "近距離推射技術",
      duration: `${minutes} 分鐘`,
      items: [
        { label: "球感：左右腳輕碰球", detail: "5 分鐘熱身", source: "faSkills" },
        { label: "射門基本（近距離推射）", detail: "10-15 分鐘", source: "faSkills" },
        { label: "低衝擊變向步法", detail: "6-8 分鐘，慢速", source: "faSkills" },
      ],
      coaching: "站穩支撐腳，射門力度由小至中；唔追求大力抽射。",
    },
    {
      title: "步法 + 活動度",
      focus: "變向控制與髖踝活動",
      duration: `${Math.max(20, minutes - 5)} 分鐘`,
      items: [
        { label: "低衝擊變向步法", detail: "8-10 分鐘", source: "faSkills" },
        { label: "髖屈肌 / 大腿前側伸展", detail: "每個 30-45 秒", source: "nhsStrengthFlex" },
        { label: "小腿伸展", detail: "每個 30-45 秒", source: "nhsStrengthFlex" },
      ],
      coaching: "變向以小步為主，落地要輕。",
    },
    {
      title: "趣味對抗輕練習",
      focus: "小型傳切或 1v1（可選）",
      duration: `${minutes} 分鐘`,
      items: [
        { label: "短傳雙人／牆傳", detail: "8 分鐘", source: "faSkills" },
        { label: "1v1 / 小組趣味練習", detail: "12-18 分鐘，保守強度", source: "faSkills" },
      ],
      coaching: "以完成傳接為樂；有接觸風險就改成無對抗傳球遊戲。",
    },
    {
      title: "主動恢復",
      focus: "步行與伸展",
      duration: `${Math.max(20, minutes - 10)} 分鐘`,
      items: [
        { label: "收操慢行", detail: "15-20 分鐘", source: "nhsWalking" },
        { label: "胸椎伸展 + 開胸", detail: "每個 30-45 秒", source: "nhsStrengthFlex" },
      ],
      coaching: "完全輕鬆，為下一週球感日留氣力。",
    },
  ];

  const badmintonDays: PlanDay[] = [
    {
      title: "握拍 + 高遠球入門",
      focus: "準備姿勢同揮拍軌跡",
      duration: `${minutes} 分鐘`,
      items: [
        { label: "握拍與準備姿勢", detail: "5-8 分鐘", source: "badmintonEngland" },
        { label: "高遠球 Clear 影子揮拍", detail: "10-12 分鐘", source: "badmintonEngland" },
        { label: "肩膊活動度練習", detail: "5 分鐘", source: "nhsWarmup" },
      ],
      coaching: "影子揮拍先求動作完整，唔好大力殺球。",
    },
    {
      title: "步法影子日",
      focus: "六點移動與回中",
      duration: `${minutes} 分鐘`,
      items: [
        { label: "六點步法影子移動", detail: "10-15 分鐘，慢速重覆", source: "badmintonEngland" },
        { label: "陸上核心 + 肩胛穩定", detail: "8-10 分鐘", source: "nhsPilates" },
      ],
      coaching: "步法要回中站穩；氣喘就減速。",
    },
    {
      title: "發球與對打",
      focus: "穩定開球同基本來回",
      duration: `${minutes} 分鐘`,
      items: [
        { label: "握拍與準備姿勢", detail: "3 分鐘重温", source: "badmintonEngland" },
        { label: "發球與對打練習", detail: "15-20 分鐘", source: "badmintonEngland" },
      ],
      coaching: "對打以高遠球／高球為主，減少急停急轉。",
    },
    {
      title: "肩膊護理 + 輕體能",
      focus: "保護肩袖與心肺底子",
      duration: `${Math.max(20, minutes - 5)} 分鐘`,
      items: [
        { label: "肩膊護理 + 輕帶氧", detail: "12-15 分鐘", source: "nhsWarmup" },
        { label: "Band Pull-Apart", detail: "2 組 x 10-15 次（有帶先做）", source: "nhsPilates" },
        { label: "Bird Dog", detail: "2 組 x 6-10 次/邊", source: "nhsPilates" },
      ],
      coaching: "肩膊痠痛屬警告訊號，立即改輕或停。",
    },
    {
      title: "網前觸感",
      focus: "輕鬆吊球與網前控制",
      duration: `${minutes} 分鐘`,
      items: [
        { label: "輕鬆吊球／網前觸球", detail: "12-18 分鐘", source: "badmintonEngland" },
        { label: "六點步法影子移動", detail: "6-8 分鐘收操", source: "badmintonEngland" },
      ],
      coaching: "網前以柔觸為主，唔追求殺球得分。",
    },
    {
      title: "主動恢復",
      focus: "伸展與輕行",
      duration: `${Math.max(20, minutes - 10)} 分鐘`,
      items: [
        { label: "收操慢行", detail: "10-15 分鐘", source: "nhsWalking" },
        { label: "肩膊活動度練習", detail: "5-8 分鐘", source: "nhsWarmup" },
      ],
      coaching: "讓肩膊同小腿放鬆，準備下一週技術日。",
    },
  ];

  const pool =
    focus === "swimming"
      ? swimmingDays
      : focus === "soccer"
        ? soccerDays
        : badmintonDays;

  return pool.slice(0, profile.trainingDays);
}

function buildGeneralWeeklyPlan(profile: WorkoutProfile): PlanDay[] {
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

function buildWeeklyPlan(profile: WorkoutProfile): PlanDay[] {
  if (
    profile.activityFocus === "swimming" ||
    profile.activityFocus === "soccer" ||
    profile.activityFocus === "badminton"
  ) {
    return buildSportWeeklyPlan(profile);
  }
  return buildGeneralWeeklyPlan(profile);
}

function sportWarmup(profile: WorkoutProfile): string[] {
  if (profile.activityFocus === "swimming") {
    return [
      "下水前先做肩膊、胸椎同髖部活動 4-6 分鐘。",
      "先用浮板踢水或池邊步行熱身，再開始技術組。",
      "耳痛、頭暈、抽筋或胸口不適立即上岸並求援。",
    ];
  }
  if (profile.activityFocus === "soccer") {
    return [
      "先做 5-8 分鐘快步行 + 踝髖活動，再觸球。",
      "變向同射門前先做幾組慢速練習。",
      "膝蓋、足踝有痛就停止衝刺／急停動作。",
    ];
  }
  if (profile.activityFocus === "badminton") {
    return [
      "肩膊、手腕同小腿先熱身 5-8 分鐘。",
      "先影子揮拍，再上線對打。",
      "肩膊刺痛或膝頭急停痛楚出現就立即改輕。",
    ];
  }
  return [
    `先做 ${profile.sessionMinutes <= 25 ? "4-5" : "6-8"} 分鐘熱身：原地踏步、肩膊環繞、髖部活動、踝關節活動。`,
    "第一個力量動作可先做 1 組超輕鬆版本當作技術熱身。",
    "任何麻痺、刺痛、頭暈或胸口不適，立即停止並求醫。",
  ];
}

function sportProgression(profile: WorkoutProfile): string[] {
  if (profile.activityFocus === "swimming") {
    return [
      "第 1 週：熟習踢水與呼吸節奏，每段短距離、休息充足。",
      "第 2 週：技術組可加 1-2 段，或把休息游加 5 分鐘。",
      "第 3 週：嘗試把技術動作帶入稍長連續游。",
      "第 4 週：維持質素，回顧能否輕鬆完成原定日數。",
    ];
  }
  if (profile.activityFocus === "soccer") {
    return [
      "第 1 週：專注球感同短傳次數，體能用走跑交替即可。",
      "第 2 週：短傳距離略增，或射門組數 +1。",
      "第 3 週：可加入短時間趣味對抗，強度仍保守。",
      "第 4 週：鞏固技術，唔好突然改成長時間比賽。",
    ];
  }
  if (profile.activityFocus === "badminton") {
    return [
      "第 1 週：握拍、準備姿勢、影子高遠球做準。",
      "第 2 週：步法組數略加，對打時間可加 5 分鐘。",
      "第 3 週：加入網前輕觸，但仍避免大力殺球。",
      "第 4 週：維持動作品質與肩膊舒適度為先。",
    ];
  }
  return [
    "第 1 週：先熟習動作與節奏，全部維持 RPE 5-6，重點係完成而唔係搏盡。",
    "第 2 週：如果完成度高且無明顯痛症，每個主動作加 1-2 次，或其中 1 個動作加 1 組。",
    "第 3 週：大部分動作提升到 RPE 6-7；帶氧日可加 5-10 分鐘或略加步速。",
    `第 4 週：維持動作品質，唔使再大幅加量；回顧${
      profile.experience === "new" ? "學動作與建立頻率" : "恢復規律與加回基本訓練量"
    }是否已變得較自然。`,
  ];
}

export function generateWorkoutPlan(
  profile: WorkoutProfile,
  fallbackName = "你"
): GeneratedPlan {
  const normalized: WorkoutProfile = {
    ...DEFAULT_PROFILE,
    ...profile,
    activityFocus: profile.activityFocus || "general",
    trainingDays: Math.max(2, Math.min(6, Number(profile.trainingDays) || 3)),
    sessionMinutes: Math.max(15, Math.min(120, Number(profile.sessionMinutes) || 35)),
    equipment: profile.equipment?.length ? profile.equipment : ["none"],
  };

  const bmi = computeBmi(normalized.heightCm, normalized.weightKg);
  const weeklyPlan = buildWeeklyPlan(normalized).map(enrichPlanDay);
  const trainingAgeLabel =
    normalized.experience === "new"
      ? "完全新手"
      : normalized.experience === "restart"
        ? "重啟型新手"
        : "未系統化初階";

  const referenceKeys = new Set<SourceKey>([
    "cdcGuidelines",
    "niaFourTypes",
    "nhsWarmup",
  ]);
  if (normalized.activityFocus === "swimming") {
    referenceKeys.add("nhsSwimming");
    referenceKeys.add("swimEngland");
  } else if (normalized.activityFocus === "soccer") {
    referenceKeys.add("faSkills");
    referenceKeys.add("nhsWalking");
  } else if (normalized.activityFocus === "badminton") {
    referenceKeys.add("badmintonEngland");
    referenceKeys.add("nhsPilates");
  } else {
    referenceKeys.add("cdcAdults");
    referenceKeys.add("nhsStrengthFlex");
  }
  weeklyPlan.forEach((day) => {
    day.items.forEach((item) => referenceKeys.add(item.source));
  });

  const activityLabel = activityFocusLabel(normalized.activityFocus);

  return {
    displayName: normalized.nickname || fallbackName,
    goalLabel: `${activityLabel} · ${goalLabel(normalized.primaryGoal)}`,
    cards: [
      { label: "訓練類型", value: activityLabel },
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
    warmup: sportWarmup(normalized),
    progression: sportProgression(normalized),
    references: Array.from(referenceKeys).map((key) => SOURCE_LINKS[key]),
  };
}

export interface PlanCompletionMeta {
  completedAt: string;
  previousGeneratedAt?: string;
  /** Number of plans already completed (0 = first next-stage). */
  stageIndex?: number;
}

/** Soft progression suggestions after finishing a plan; user can still tweak. */
export function suggestNextStageProfile(profile: WorkoutProfile): WorkoutProfile {
  const next: WorkoutProfile = {
    ...DEFAULT_PROFILE,
    ...profile,
    activityFocus: profile.activityFocus || "general",
    equipment: profile.equipment?.length ? [...profile.equipment] : ["none"],
  };

  if (next.experience === "new") next.experience = "restart";
  else if (next.experience === "restart") next.experience = "some";

  if (next.fitnessLevel === "low") next.fitnessLevel = "moderate";

  next.sessionMinutes = Math.min(
    90,
    Math.max(15, Number(next.sessionMinutes) || 35) + 5
  );

  return next;
}

/**
 * Build the next-stage plan from adjusted prefs + previous plan context.
 * Slightly harder coaching / progression copy; still safety-first.
 */
export function generateNextPlan(
  profile: WorkoutProfile,
  previousPlan: GeneratedPlan | null,
  completionMeta?: PlanCompletionMeta,
  fallbackName = "你"
): GeneratedPlan {
  const base = generateWorkoutPlan(profile, fallbackName);
  const stageNumber = (completionMeta?.stageIndex ?? 0) + 2;
  const carryFocus = previousPlan
    ? `承接上一份「${previousPlan.goalLabel}」計劃。`
    : "承接上一階段訓練。";

  return {
    ...base,
    goalLabel: `${base.goalLabel} · 第 ${stageNumber} 階段`,
    cards: [
      { label: "計劃階段", value: `第 ${stageNumber} 階段` },
      ...base.cards,
    ],
    focusText: `${carryFocus}${base.focusText} 本階段會略為提升挑戰，但仍以可持續同動作品質為先。`,
    flags: [
      "呢份係上一階段完成後嘅延續計劃：若上次完成度高、無明顯痛症，可維持略高一檔強度。",
      ...base.flags,
    ],
    progression: [
      "本階段承接上一週期：先用第 1 週確認恢復同動作穩定，再按感覺加量。",
      ...base.progression,
    ],
  };
}

export function sexLabel(sex: string): string {
  return (
    {
      female: "女",
      male: "男",
      other: "其他 / 不想透露",
    }[sex] || (sex ? sex : "未填寫")
  );
}

export function experienceLabel(experience: WorkoutProfile["experience"]): string {
  return (
    {
      new: "完全新手",
      restart: "以前做過，停咗一段時間",
      some: "偶爾有做，但未有系統",
    }[experience] || "未填寫"
  );
}

export function fitnessLevelLabel(
  level: WorkoutProfile["fitnessLevel"]
): string {
  return (
    {
      low: "偏低，少郁動就攰",
      moderate: "一般",
      good: "算唔錯",
    }[level] || "未填寫"
  );
}

export function workStyleLabel(style: WorkoutProfile["workStyle"]): string {
  return (
    {
      desk: "長時間坐",
      mixed: "坐企混合",
      active: "需要經常走動",
      manual: "勞動 / 搬運為主",
    }[style] || "未填寫"
  );
}

export function locationLabel(
  loc: WorkoutProfile["locationPreference"]
): string {
  return (
    {
      home: "屋企為主",
      gym: "健身室為主",
      outdoor: "戶外為主",
      pool: "泳池為主",
      court: "球場／羽球場為主",
      mixed: "都可以",
    }[loc] || "未填寫"
  );
}

export function trainingPreferenceLabel(
  pref: WorkoutProfile["trainingPreference"]
): string {
  return (
    {
      balanced: "平均啲，力量加心肺",
      strength: "偏力量",
      cardio: "偏帶氧 / 步行",
      mobility: "偏伸展活動度",
    }[pref] || "未填寫"
  );
}

export function equipmentLabels(equipment: EquipmentId[]): string {
  if (!equipment?.length) return "未填寫";
  const labels = equipment.map(
    (id) => EQUIPMENT_OPTIONS.find((o) => o.id === id)?.label || id
  );
  return labels.join("、");
}

/** Readable profile cards for plan view ("個人資料 / 計劃依據"). */
export function buildProfileSummaryCards(
  profile: WorkoutProfile
): { label: string; value: string }[] {
  const bmi = computeBmi(profile.heightCm, profile.weightKg);
  const cards: { label: string; value: string }[] = [
    {
      label: "稱呼",
      value: profile.nickname?.trim() || "未填寫",
    },
    {
      label: "性別",
      value: sexLabel(profile.sex),
    },
    {
      label: "年齡",
      value: profile.age ? `${profile.age} 歲` : "未填寫",
    },
    {
      label: "身高",
      value: profile.heightCm ? `${profile.heightCm} cm` : "未填寫",
    },
    {
      label: "體重",
      value: profile.weightKg ? `${profile.weightKg} kg` : "未填寫",
    },
    {
      label: "BMI",
      value: bmi ? `${bmi.toFixed(1)}（${bmiLabel(bmi)}）` : "未提供",
    },
  ];

  if (profile.bodyFat) {
    cards.push({ label: "體脂率", value: `${profile.bodyFat}%` });
  }
  if (profile.waistCm) {
    cards.push({ label: "腰圍", value: `${profile.waistCm} cm` });
  }
  if (profile.restingHr) {
    cards.push({ label: "安靜心跳", value: `${profile.restingHr} bpm` });
  }

  cards.push(
    {
      label: "訓練類型",
      value: activityFocusLabel(profile.activityFocus),
    },
    {
      label: "主要目標",
      value: goalLabel(profile.primaryGoal),
    },
    {
      label: "訓練經驗",
      value: experienceLabel(profile.experience),
    },
    {
      label: "體能自我評估",
      value: fitnessLevelLabel(profile.fitnessLevel),
    },
    {
      label: "每週訓練日數",
      value: `${profile.trainingDays || "—"} 日`,
    },
    {
      label: "每次可用時間",
      value: `${profile.sessionMinutes || "—"} 分鐘`,
    },
    {
      label: "工作型態",
      value: workStyleLabel(profile.workStyle),
    },
    {
      label: "訓練地點",
      value: locationLabel(profile.locationPreference),
    },
    {
      label: "偏好類型",
      value: trainingPreferenceLabel(profile.trainingPreference),
    },
    {
      label: "可用器材",
      value: equipmentLabels(profile.equipment),
    }
  );

  if (profile.dailySteps) {
    cards.push({ label: "日常步數", value: `${profile.dailySteps}` });
  }
  if (profile.sleepHours) {
    cards.push({ label: "睡眠", value: `${profile.sleepHours} 小時/晚` });
  }
  if (profile.stressLevel) {
    cards.push({ label: "壓力水平", value: `${profile.stressLevel} / 5` });
  }

  return cards;
}

