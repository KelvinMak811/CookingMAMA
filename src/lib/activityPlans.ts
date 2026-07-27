import type { WorkoutProfile, ActivityInterestId } from "@/lib/workoutPlanner";

export type { ActivityInterestId };

export const ACTIVITY_OPTIONS: { id: ActivityInterestId; label: string; emoji: string }[] = [
  { id: "gym", label: "健身室 / 重訓", emoji: "🏋️" },
  { id: "football", label: "足球", emoji: "⚽" },
  { id: "swimming", label: "游泳", emoji: "🏊" },
  { id: "running", label: "跑步", emoji: "🏃" },
  { id: "basketball", label: "籃球", emoji: "🏀" },
  { id: "badminton", label: "羽毛球", emoji: "🏸" },
  { id: "cycling", label: "單車", emoji: "🚴" },
  { id: "yoga", label: "瑜伽 / 伸展", emoji: "🧘" },
  { id: "hiking", label: "行山", emoji: "⛰️" },
  { id: "other", label: "其他（見備註）", emoji: "✨" },
];

export interface ActivitySuggestion {
  id: ActivityInterestId;
  title: string;
  summary: string;
  weeklySessions: string[];
  safetyTips: string[];
  intensityNote: string;
}

function sessionMinutes(profile: WorkoutProfile): number {
  return Math.max(20, profile.sessionMinutes || 35);
}

const TEMPLATES: Record<
  ActivityInterestId,
  (profile: WorkoutProfile) => Omit<ActivitySuggestion, "id">
> = {
  gym: (profile) => ({
    title: "健身室入門週期",
    summary: "以全身力量 + 低衝擊帶氧建立底子，適合新手在健身房跟器械或自由重量入門。",
    weeklySessions: [
      `Day A：深蹲模式 + 推 + 核心（約 ${sessionMinutes(profile)} 分鐘）`,
      `Day B：帶氧（跑步機 / 單車）RPE 5-6（${Math.max(20, sessionMinutes(profile) - 10)} 分鐘）`,
      `Day C：拉 + 髖主導 + 活動度（約 ${sessionMinutes(profile)} 分鐘）`,
    ],
    safetyTips: [
      "先用輕重量學動作，唔好一開始就力竭。",
      "不確定器械用法時，先問教練或睇官方教學。",
    ],
    intensityNote: profile.injuries
      ? "有傷患描述：避免跳躍同大重量硬拉，改器械軌道動作。"
      : "第 1-2 週 RPE 5-6，第 3 週起可微加量。",
  }),
  football: (profile) => ({
    title: "足球體能與技術維持",
    summary: "結合控球、短距離加速同下肢力量，令你踢波時更耐跑、轉身更穩。",
    weeklySessions: [
      "技術日：傳波、帶球、左右腳觸球（30-40 分鐘）",
      "體能日：短衝刺 6×20m + 核心（25-35 分鐘）",
      "比賽或輕鬆踢波：以恢復強度為主（45-60 分鐘）",
    ],
    safetyTips: ["踢波前一定要熱身同動態拉筋。", "膝頭不適就減少急停同射門練習。"],
    intensityNote:
      profile.trainingDays >= 4
        ? "每週最多 1-2 次高強度衝刺，其餘以技術同恢復為主。"
        : "每週 2-3 次已足夠，避免連續兩日高強度。",
  }),
  swimming: (profile) => ({
    title: "游泳耐力與技術",
    summary: "分段游、呼吸節奏同肩頸活動度，適合想低衝擊帶氧嘅你。",
    weeklySessions: [
      "技術日：打腿 + 單臂划水（30 分鐘）",
      "耐力日：連續游 RPE 5-6（20-35 分鐘）",
      "恢復日：背泳 / 輕鬆蛙泳（20-25 分鐘）",
    ],
    safetyTips: ["下水前活動肩同胸椎。", "唔好空腹或過飽下水。"],
    intensityNote: profile.primaryGoal === "cardio" ? "可逐步加總距離。" : "以技術同呼吸為主，唔追速度。",
  }),
  running: (profile) => ({
    title: "跑步入門",
    summary: "走跑交替建立關節適應，再慢慢加連續跑步時間。",
    weeklySessions: [
      "走跑交替：1 分鐘跑 / 2 分鐘行 × 8 組",
      "穩定跑：RPE 5，可講完整句子",
      "恢復：快步行 30-40 分鐘",
    ],
    safetyTips: ["選緩衝鞋，漸進加里數（每週唔好加超過 10%）。", "膝痛就減少跑量改單車或游泳。"],
    intensityNote: profile.fitnessLevel === "low" ? "前兩週以走跑為主。" : "可加入一次稍快節奏跑。",
  }),
  basketball: (profile) => ({
    title: "籃球體能",
    summary: "敏捷腳步、跳躍落地控制同上肢推，配合打球日。",
    weeklySessions: [
      "控球 + 投籃技術（30 分鐘）",
      "敏捷梯 / 側步 + 迷你箱跳（落地輕）（25 分鐘）",
      "輕鬆對抗或投籃練習",
    ],
    safetyTips: ["落地屈膝吸收衝擊。", "踝關節曾受傷要戴護具或減少跳。"],
    intensityNote: "比賽日當高強度，隔日做伸展或輕帶氧。",
  }),
  badminton: (profile) => ({
    title: "羽毛球專項體能",
    summary: "側向移動、前臂同核心穩定，減少扭傷風險。",
    weeklySessions: [
      "步法：米字步、側跨（20 分鐘）",
      "打球日：以技術多過搏殺",
      "力量：弓步、側平板（20 分鐘）",
    ],
    safetyTips: ["熱身包括手腕同肩旋轉。", "避免疲勞時做大幅度殺球。"],
    intensityNote: "每週 2-3 次專項已足夠，其餘用全身力量計劃補底。",
  }),
  cycling: (profile) => ({
    title: "單車有氧",
    summary: "穩定踏頻建立心肺，戶外或健身單車皆可。",
    weeklySessions: [
      `耐力騎 RPE 5（${sessionMinutes(profile)} 分鐘）`,
      "間歇：2 分鐘稍快 / 3 分鐘輕鬆 × 5",
      "恢復騎或步行",
    ],
    safetyTips: ["調校座墊高度。", "戶外注意交通同補水。"],
    intensityNote: "減脂目標可多加一次中等強度長騎。",
  }),
  yoga: (profile) => ({
    title: "瑜伽與活動度",
    summary: "改善久坐緊繃、呼吸同核心覺察，適合作為恢復日。",
    weeklySessions: [
      "流瑜伽入門 25-35 分鐘",
      "陰瑜伽 / 伸展 20 分鐘",
      "配合 10 分鐘呼吸練習",
    ],
    safetyTips: ["唔好強行拉過痛點。", "孕婦或高血壓請跟醫護建議。"],
    intensityNote: "可每日短練習，主訓練日仍建議保留力量或帶氧。",
  }),
  hiking: (profile) => ({
    title: "行山與下肢耐力",
    summary: "用斜路同樓梯建立下肢耐力，注意下山對膝關節負荷。",
    weeklySessions: [
      "市區斜路快走 40-60 分鐘",
      "週末行山（按體能選路線）",
      "下山後大腿前側伸展",
    ],
    safetyTips: ["帶夠水同簡單補給。", "天氣惡劣改室內帶氧。"],
    intensityNote: profile.injuries?.includes("膝")
      ? "膝不適時縮短下山距離或用杖。"
      : "循序加背囊重量。",
  }),
  other: (profile) => ({
    title: "自訂興趣活動",
    summary:
      profile.notes?.trim() ||
      "根據你備註嘅興趣，將主訓練計劃嘅帶氧日換成你喜歡嘅活動，並保留 2 日力量或核心。",
    weeklySessions: [
      "興趣活動日 1：中等強度 30-45 分鐘",
      "興趣活動日 2：技術或輕鬆版",
      "配合全身力量計劃其餘日子",
    ],
    safetyTips: ["任何新運動都先從低強度開始。", "記低身體反應再調整。"],
    intensityNote: "可在備註寫明球類、舞蹈等，下週再微調。",
  }),
};

export function generateActivitySuggestions(
  profile: WorkoutProfile
): ActivitySuggestion[] {
  const interests = profile.interests?.length
    ? profile.interests
    : (["gym"] as ActivityInterestId[]);
  const unique = [...new Set(interests)];
  return unique.map((id) => ({
    id,
    ...TEMPLATES[id](profile),
  }));
}
