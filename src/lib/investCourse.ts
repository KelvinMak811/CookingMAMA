/**
 * SmartInvest — 港股／美股入門課程與學習日程產生器
 */

import {
  LESSON_CONTENT,
  type InvestLessonContent,
} from "@/lib/investLessonContent";

export type {
  InvestLessonContent,
  InvestLessonExample,
  InvestQuizItem,
} from "@/lib/investLessonContent";

export type InvestTrackId = "hk_basics" | "us_basics";

export type InvestLessonFocus =
  | "market"
  | "orders"
  | "fees"
  | "risk"
  | "products"
  | "practice";

export interface InvestLesson {
  id: string;
  titleZh: string;
  focus: InvestLessonFocus;
  minutes: number;
  summaryZh: string;
  checklist: string[];
  content: InvestLessonContent;
}

export interface InvestUnit {
  id: string;
  titleZh: string;
  lessons: InvestLesson[];
}

export interface InvestTrack {
  id: InvestTrackId;
  labelZh: string;
  blurbZh: string;
  estimatedWeeks: number;
  units: InvestUnit[];
}

export interface InvestStudyPreferences {
  nickname: string;
  track: InvestTrackId;
  daysPerWeek: number;
  minutesPerDay: number;
  weeklyDays: number[]; // 0=Sun … 6=Sat
  paperCapital: number;
  riskPctPerIdea: number;
}

export interface ScheduledInvestBlock {
  lessonId: string;
  trackId: InvestTrackId;
  unitId: string;
  titleZh: string;
  focus: InvestLessonFocus;
  minutes: number;
}

export interface InvestDayPlan {
  dayIndex: number;
  weekday: number;
  labelZh: string;
  blocks: ScheduledInvestBlock[];
  totalMinutes: number;
  isRest: boolean;
}

export interface GeneratedInvestSchedule {
  preferences: InvestStudyPreferences;
  weeks: { weekNumber: number; days: InvestDayPlan[] }[];
  totalLessons: number;
  estimatedWeeks: number;
  notes: string[];
}

export const FOCUS_LABELS: Record<InvestLessonFocus, string> = {
  market: "市場結構",
  orders: "落盤基礎",
  fees: "費用／稅項",
  risk: "風險管理",
  products: "產品認識",
  practice: "紙上練習",
};

export const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"] as const;

export const DEFAULT_INVEST_PREFERENCES: InvestStudyPreferences = {
  nickname: "",
  track: "hk_basics",
  daysPerWeek: 3,
  minutesPerDay: 25,
  weeklyDays: [1, 3, 5],
  paperCapital: 100000,
  riskPctPerIdea: 1,
};

export const SAMPLE_INVEST_PREFERENCES: InvestStudyPreferences = {
  nickname: "學習者",
  track: "hk_basics",
  daysPerWeek: 4,
  minutesPerDay: 30,
  weeklyDays: [1, 2, 4, 6],
  paperCapital: 100000,
  riskPctPerIdea: 1,
};

const EMPTY_CONTENT: InvestLessonContent = {
  conceptsZh: [],
  examples: [],
  riskNotesZh: [],
  quiz: [],
};

function L(
  id: string,
  titleZh: string,
  focus: InvestLessonFocus,
  minutes: number,
  summaryZh: string,
  checklist: string[]
): InvestLesson {
  return {
    id,
    titleZh,
    focus,
    minutes,
    summaryZh,
    checklist,
    content: LESSON_CONTENT[id] ?? EMPTY_CONTENT,
  };
}

function U(id: string, titleZh: string, lessons: InvestLesson[]): InvestUnit {
  return { id, titleZh, lessons };
}

export const INVEST_COURSE: InvestTrack[] = [
  {
    id: "hk_basics",
    labelZh: "港股入門",
    blurbZh:
      "認識聯交所、報價單位、買賣盤、印花稅同風險分散；全程強調學習用途，唔係落單指引。",
    estimatedWeeks: 4,
    units: [
      U("hk-1", "市場同報價", [
        L(
          "hk-1-1",
          "港股點樣運作",
          "market",
          20,
          "認識交易時段、買賣單位（手）、指數同個股分別。",
          ["寫低開市／收市時間", "解釋咩係「手」", "分清指數 vs 單一股份"]
        ),
        L(
          "hk-1-2",
          "讀懂報價同走勢圖",
          "market",
          25,
          "學習開高低收、升跌幅、成交量——示範圖只供練習。",
          ["標示 OHLC", "解釋成交量點樣幫你理解流動性", "唔好單靠一根 K 線下結論"]
        ),
        L(
          "hk-1-3",
          "股票分類初探",
          "products",
          25,
          "科技、金融、ETF、藍籌、仙股等分類同風險差異。",
          ["列出至少 4 個分類", "寫低仙股三大紅旗", "揀一隻 ETF 做對照筆記"]
        ),
      ]),
      U("hk-2", "落盤同費用意識", [
        L(
          "hk-2-1",
          "市價盤 vs 限價盤",
          "orders",
          20,
          "理解兩種常見落盤方式同「成交唔保証」概念。",
          ["用自己說話解釋市價／限價", "寫一個限價練習情境", "提及流動性風險"]
        ),
        L(
          "hk-2-2",
          "印花稅同交易成本",
          "fees",
          25,
          "認識港股印花稅、佣金、交收費等（概念層面，實際以券商為準）。",
          ["列出主要費用名目", "計算一筆示範買賣嘅粗略成本", "明白短炒成本可被費用侵蝕"]
        ),
      ]),
      U("hk-3", "風險同紙上練習", [
        L(
          "hk-3-1",
          "分散同倉位大小",
          "risk",
          25,
          "用「每筆風險佔資本 %」框架練習，避免孤注一擲。",
          ["設定紙上風險 %（建議 ≤2%）", "用倉位計算器做一題", "寫低點解唔好 All-in"]
        ),
        L(
          "hk-3-2",
          "何時複盤／何時離場（學習清單）",
          "practice",
          25,
          "建立檢討清單：論點失效、超風險上限、到期複盤——唔係預測頂底。",
          ["抄低 4 項離場／複盤問題", "為一條示範想法寫檢討日", "重溫免責：無保證回報"]
        ),
      ]),
    ],
  },
  {
    id: "us_basics",
    labelZh: "美股入門",
    blurbZh:
      "認識美股時段、報價、ETF／ADR 基礎同匯率風險；同樣只供學習，唔係經紀服務。",
    estimatedWeeks: 4,
    units: [
      U("us-1", "美股市場基礎", [
        L(
          "us-1-1",
          "美股交易所同時段",
          "market",
          20,
          "認識常規交易時段、夏令時間概念同港人時差。",
          ["寫低常規開收市（美東）", "換算自己所在地時間", "知道盤前／盤後波動較大"]
        ),
        L(
          "us-1-2",
          "報價、股數同流動性",
          "market",
          25,
          "美股多數以「股」為單位；大型股流動性通常較好。",
          ["對比港股「手」同美股「股」", "解釋 bid/ask 點解重要", "揀一隻大型股做報價筆記"]
        ),
      ]),
      U("us-2", "產品：ETF 同 ADR", [
        L(
          "us-2-1",
          "指數 ETF 入門",
          "products",
          25,
          "用廣基 ETF 學核心配置；費用率同追蹤誤差要知。",
          ["解釋 ETF vs 單一股票", "寫低費用率要注意", "示範：核心＋衛星配置概念"]
        ),
        L(
          "us-2-2",
          "ADR 係咩",
          "products",
          20,
          "美國存託憑證讓投資者以美元交易外國公司——概念認識即可。",
          ["用一句解釋 ADR", "留意匯率同費用層", "唔好假設 ADR = 本地股完全一樣"]
        ),
      ]),
      U("us-3", "風險、匯率同練習", [
        L(
          "us-3-1",
          "匯率同隔夜風險",
          "risk",
          25,
          "持有美股要同時理解美元匯率同消息時段風險。",
          ["寫低匯率點樣影響回報", "解釋隔夜跳空", "設定紙上風險上限"]
        ),
        L(
          "us-3-2",
          "紙上組合練習",
          "practice",
          25,
          "用虛擬現金記錄買賣，對照學習想法同倉位框架。",
          ["設定紙上本金", "完成一筆示範買入紀錄", "一週後做複盤筆記"]
        ),
      ]),
    ],
  },
];

export function getTrack(id: InvestTrackId): InvestTrack {
  return INVEST_COURSE.find((t) => t.id === id) ?? INVEST_COURSE[0];
}

export function countLessons(trackId?: InvestTrackId): number {
  const tracks = trackId
    ? INVEST_COURSE.filter((t) => t.id === trackId)
    : INVEST_COURSE;
  return tracks.reduce(
    (sum, t) =>
      sum + t.units.reduce((uSum, u) => uSum + u.lessons.length, 0),
    0
  );
}

export function findLesson(
  lessonId: string
): { track: InvestTrack; unit: InvestUnit; lesson: InvestLesson } | null {
  for (const track of INVEST_COURSE) {
    for (const unit of track.units) {
      const lesson = unit.lessons.find((l) => l.id === lessonId);
      if (lesson) return { track, unit, lesson };
    }
  }
  return null;
}

/** Flat lesson order within a track (for prev/next navigation). */
export function listTrackLessonIds(trackId: InvestTrackId): string[] {
  return getTrack(trackId).units.flatMap((u) => u.lessons.map((l) => l.id));
}

export function adjacentLessons(lessonId: string): {
  prevId: string | null;
  nextId: string | null;
  track: InvestTrack;
  unit: InvestUnit;
  lesson: InvestLesson;
} | null {
  const found = findLesson(lessonId);
  if (!found) return null;
  const ids = listTrackLessonIds(found.track.id);
  const idx = ids.indexOf(lessonId);
  return {
    ...found,
    prevId: idx > 0 ? ids[idx - 1] : null,
    nextId: idx >= 0 && idx < ids.length - 1 ? ids[idx + 1] : null,
  };
}

export function trackProgress(
  trackId: InvestTrackId,
  completedLessonIds: string[]
): { done: number; total: number; pct: number } {
  const track = getTrack(trackId);
  const ids = track.units.flatMap((u) => u.lessons.map((l) => l.id));
  const done = ids.filter((id) => completedLessonIds.includes(id)).length;
  const total = ids.length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

function normalizeWeeklyDays(prefs: InvestStudyPreferences): number[] {
  const days = Array.isArray(prefs.weeklyDays)
    ? prefs.weeklyDays.filter((d) => d >= 0 && d <= 6)
    : [];
  if (days.length) return [...new Set(days)].sort((a, b) => a - b);
  const n = Math.min(7, Math.max(1, prefs.daysPerWeek || 3));
  return [1, 2, 3, 4, 5, 6, 0].slice(0, n);
}

export function generateInvestSchedule(
  prefs: InvestStudyPreferences,
  completedLessonIds: string[] = []
): GeneratedInvestSchedule {
  const track = getTrack(prefs.track);
  const minutesPerDay = Math.max(15, prefs.minutesPerDay || 25);
  const weeklyDays = normalizeWeeklyDays(prefs);
  const daysPerWeek = weeklyDays.length;
  const queue = track.units.flatMap((unit) =>
    unit.lessons
      .filter((lesson) => !completedLessonIds.includes(lesson.id))
      .map((lesson) => ({ track, unit, lesson }))
  );

  const maxWeeks = Math.max(track.estimatedWeeks + 4, 8);
  const weeks: GeneratedInvestSchedule["weeks"] = [];
  let cursor = 0;
  let weekNumber = 1;

  while (cursor < queue.length && weekNumber <= maxWeeks) {
    const days: InvestDayPlan[] = [];
    for (let weekday = 0; weekday < 7; weekday++) {
      const isStudyDay = weeklyDays.includes(weekday);
      if (!isStudyDay) {
        days.push({
          dayIndex: weekday,
          weekday,
          labelZh: `星期${WEEKDAY_LABELS[weekday]}`,
          blocks: [],
          totalMinutes: 0,
          isRest: true,
        });
        continue;
      }

      const blocks: ScheduledInvestBlock[] = [];
      let used = 0;
      while (cursor < queue.length && used < minutesPerDay) {
        const item = queue[cursor];
        const mins = item.lesson.minutes;
        if (blocks.length > 0 && used + mins > minutesPerDay + 10) break;
        blocks.push({
          lessonId: item.lesson.id,
          trackId: item.track.id,
          unitId: item.unit.id,
          titleZh: item.lesson.titleZh,
          focus: item.lesson.focus,
          minutes: mins,
        });
        used += mins;
        cursor += 1;
        if (used >= minutesPerDay) break;
      }

      days.push({
        dayIndex: weekday,
        weekday,
        labelZh: `星期${WEEKDAY_LABELS[weekday]}`,
        blocks,
        totalMinutes: used,
        isRest: blocks.length === 0,
      });
    }
    weeks.push({ weekNumber, days });
    weekNumber += 1;
  }

  const totalLessons = countLessons(prefs.track);
  const remaining = queue.length;
  const estimatedWeeks = Math.max(
    1,
    Math.ceil(remaining / Math.max(1, daysPerWeek))
  );

  return {
    preferences: {
      ...prefs,
      daysPerWeek,
      weeklyDays,
    },
    weeks,
    totalLessons,
    estimatedWeeks,
    notes: [
      "日程只覆蓋未完成課堂；完成後可重新生成。",
      "投資有風險，內容僅供學習——課堂唔等於買賣建議。",
      `紙上本金設定：${prefs.paperCapital.toLocaleString()}（虛擬）。`,
    ],
  };
}
