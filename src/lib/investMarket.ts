/**
 * SmartInvest — categories, sample market snapshot, educational idea engine.
 * Live quotes optional; defaults to clearly labeled demo data.
 */

export type MarketId = "HK" | "US";

export type StockCategoryId =
  | "tech"
  | "finance"
  | "consumer"
  | "healthcare"
  | "etf"
  | "penny"
  | "bluechip"
  | "energy";

export type RiskLevel = "low" | "medium" | "high" | "very_high";

export interface CategoryInfo {
  id: StockCategoryId;
  labelZh: string;
  blurbZh: string;
  riskNoteZh: string;
}

export interface MarketQuote {
  id: string;
  market: MarketId;
  symbol: string;
  nameZh: string;
  category: StockCategoryId;
  last: number;
  changePct: number;
  currency: "HKD" | "USD";
  riskLevel: RiskLevel;
  blurbZh: string;
}

export interface MarketIndex {
  id: string;
  market: MarketId;
  symbol: string;
  nameZh: string;
  last: number;
  changePct: number;
  trendNoteZh: string;
}

export interface MarketSnapshot {
  version: number;
  label: string;
  source: string;
  asOf: string;
  disclaimerZh: string;
  indices: MarketIndex[];
  names: MarketQuote[];
}

export interface InvestIdea {
  id: string;
  quoteId: string;
  market: MarketId;
  symbol: string;
  nameZh: string;
  category: StockCategoryId;
  riskLevel: RiskLevel;
  thesisZh: string;
  whyCategoryZh: string;
  learningEntryZone: { low: number; high: number; noteZh: string };
  suggestedPaperWeightPct: number;
  exitReviewChecklist: string[];
  riskAnalysisZh: string[];
  isDemo: boolean;
}

export interface PositionSizeInput {
  paperCapital: number;
  riskPctOfCapital: number;
  entryPrice: number;
  stopDistancePct: number;
}

export interface PositionSizeResult {
  riskAmount: number;
  shares: number;
  notional: number;
  weightPct: number;
  notesZh: string[];
}

export const INVEST_DISCLAIMER_SHORT =
  "投資有風險，內容僅供學習";

export const INVEST_DISCLAIMER_LONG =
  "本模式係教育工具，唔係持牌投資顧問，亦唔係證券商。內容唔構成買賣建議，無保證回報。示範報價／想法僅供練習，請自行核實真實市場資料。";

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "tech",
    labelZh: "科技股",
    blurbZh: "軟件、互聯網、硬件等成長型公司，估值同消息敏感度通常較高。",
    riskNoteZh: "波動可大於大市；新手宜先用指數／ETF 對照，唔好一次過重倉單一科技股。",
  },
  {
    id: "finance",
    labelZh: "金融",
    blurbZh: "銀行、保險、證券等，常受利率同監管影響。",
    riskNoteZh: "留意息差、資產質素同監管新聞；教學上可對照經濟週期。",
  },
  {
    id: "consumer",
    labelZh: "消費",
    blurbZh: "日常消費同可選消費，睇收入同消費意欲。",
    riskNoteZh: "防禦型同週期型差別大；要分清必需品 vs 奢侈品。",
  },
  {
    id: "healthcare",
    labelZh: "醫藥／健康",
    blurbZh: "製藥、醫療器械、保健服務等。",
    riskNoteZh: "研發／審批風險高；大型醫藥相對穩陣，細型生物科技波動大。",
  },
  {
    id: "etf",
    labelZh: "ETF",
    blurbZh: "追蹤指數或主題嘅基金單位，一次過持有一籃子資產。",
    riskNoteZh: "費用、追蹤誤差、流動性都要睇；廣基指數 ETF 較適合新手核心學習倉。",
  },
  {
    id: "penny",
    labelZh: "仙股／低價股",
    blurbZh: "股價極低、常伴低流動性同高波動嘅股份（教材分類）。",
    riskNoteZh:
      "極高風險：易被人為炒作、停牌、攤薄。新手學習目標係認清風險，唔係練習「拾便宜」。",
  },
  {
    id: "bluechip",
    labelZh: "藍籌",
    blurbZh: "大型、相對穩健、成交活躍嘅代表性股份。",
    riskNoteZh: "唔等於無風險；仍會受宏觀同行業週期影響。",
  },
  {
    id: "energy",
    labelZh: "能源",
    blurbZh: "石油、天然氣等同商品價格相關嘅公司。",
    riskNoteZh: "週期性強；教學上用來理解商品價格傳導。",
  },
];

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: "較低（相對）",
  medium: "中等",
  high: "偏高",
  very_high: "極高",
};

const EMBEDDED_SNAPSHOT: MarketSnapshot = {
  version: 1,
  label: "示範／學習用",
  source: "CookingMAMA embedded educational sample",
  asOf: "2026-08-10T16:00:00+08:00",
  disclaimerZh: INVEST_DISCLAIMER_LONG,
  indices: [
    {
      id: "hsi",
      market: "HK",
      symbol: "HSI",
      nameZh: "恒生指數",
      last: 17520.4,
      changePct: 0.85,
      trendNoteZh: "近一週區間震盪偏穩（示範）。",
    },
    {
      id: "hstech",
      market: "HK",
      symbol: "HSTECH",
      nameZh: "恒生科技指數",
      last: 3820.1,
      changePct: 1.42,
      trendNoteZh: "科技波動較大（示範）。",
    },
    {
      id: "spx",
      market: "US",
      symbol: "SPX",
      nameZh: "標普 500",
      last: 5480.2,
      changePct: 0.38,
      trendNoteZh: "廣基指數對照用（示範）。",
    },
    {
      id: "ndx",
      market: "US",
      symbol: "NDX",
      nameZh: "納斯達克 100",
      last: 19210.5,
      changePct: 0.91,
      trendNoteZh: "科技權重高（示範）。",
    },
  ],
  names: [
    {
      id: "0700.HK",
      market: "HK",
      symbol: "0700.HK",
      nameZh: "騰訊控股",
      category: "tech",
      last: 382.4,
      changePct: 1.1,
      currency: "HKD",
      riskLevel: "medium",
      blurbZh: "港股大型科技代表（示範）。",
    },
    {
      id: "9988.HK",
      market: "HK",
      symbol: "9988.HK",
      nameZh: "阿里巴巴－Ｗ",
      category: "tech",
      last: 88.5,
      changePct: 0.6,
      currency: "HKD",
      riskLevel: "medium",
      blurbZh: "大型新經濟股（示範）。",
    },
    {
      id: "0005.HK",
      market: "HK",
      symbol: "0005.HK",
      nameZh: "匯豐控股",
      category: "finance",
      last: 68.2,
      changePct: -0.3,
      currency: "HKD",
      riskLevel: "medium",
      blurbZh: "金融藍籌示範。",
    },
    {
      id: "2800.HK",
      market: "HK",
      symbol: "2800.HK",
      nameZh: "盈富基金",
      category: "etf",
      last: 18.9,
      changePct: 0.5,
      currency: "HKD",
      riskLevel: "low",
      blurbZh: "恒指 ETF（示範）。",
    },
    {
      id: "demo-penny.HK",
      market: "HK",
      symbol: "DEMO.PENNY",
      nameZh: "示範仙股（虛構）",
      category: "penny",
      last: 0.082,
      changePct: -4.2,
      currency: "HKD",
      riskLevel: "very_high",
      blurbZh: "虛構仙股：只供認風險，唔係入手對象。",
    },
    {
      id: "AAPL",
      market: "US",
      symbol: "AAPL",
      nameZh: "蘋果",
      category: "tech",
      last: 214.3,
      changePct: 0.7,
      currency: "USD",
      riskLevel: "medium",
      blurbZh: "美股大型科技（示範）。",
    },
    {
      id: "MSFT",
      market: "US",
      symbol: "MSFT",
      nameZh: "微軟",
      category: "tech",
      last: 428.1,
      changePct: 0.4,
      currency: "USD",
      riskLevel: "medium",
      blurbZh: "大型軟件（示範）。",
    },
    {
      id: "JNJ",
      market: "US",
      symbol: "JNJ",
      nameZh: "強生",
      category: "healthcare",
      last: 158.6,
      changePct: -0.2,
      currency: "USD",
      riskLevel: "low",
      blurbZh: "醫藥防禦代表（示範）。",
    },
    {
      id: "VOO",
      market: "US",
      symbol: "VOO",
      nameZh: "Vanguard S&P 500 ETF",
      category: "etf",
      last: 512.4,
      changePct: 0.35,
      currency: "USD",
      riskLevel: "low",
      blurbZh: "廣基指數 ETF（示範）。",
    },
    {
      id: "XOM",
      market: "US",
      symbol: "XOM",
      nameZh: "埃克森美孚",
      category: "energy",
      last: 112.8,
      changePct: 1.2,
      currency: "USD",
      riskLevel: "medium",
      blurbZh: "能源週期股（示範）。",
    },
  ],
};

function isSnapshot(raw: unknown): raw is MarketSnapshot {
  if (!raw || typeof raw !== "object") return false;
  const o = raw as Partial<MarketSnapshot>;
  return Array.isArray(o.indices) && Array.isArray(o.names) && typeof o.asOf === "string";
}

export function getEmbeddedSnapshot(): MarketSnapshot {
  return EMBEDDED_SNAPSHOT;
}

/** Prefer public JSON; fall back to embedded demo. */
export async function loadMarketSnapshot(): Promise<{
  snapshot: MarketSnapshot;
  mode: "demo_json" | "embedded" | "error";
  error?: string;
}> {
  try {
    const res = await fetch("/data/invest-market-snapshot.json", {
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        snapshot: EMBEDDED_SNAPSHOT,
        mode: "embedded",
        error: `快照載入失敗（HTTP ${res.status}），已改用內建示範資料。`,
      };
    }
    const json = (await res.json()) as unknown;
    if (!isSnapshot(json)) {
      return {
        snapshot: EMBEDDED_SNAPSHOT,
        mode: "embedded",
        error: "快照格式無效，已改用內建示範資料。",
      };
    }
    return { snapshot: json, mode: "demo_json" };
  } catch (e) {
    return {
      snapshot: EMBEDDED_SNAPSHOT,
      mode: "error",
      error:
        e instanceof Error
          ? e.message
          : "無法載入市場快照，已改用內建示範資料。",
    };
  }
}

export function categoryLabel(id: StockCategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.labelZh ?? id;
}

export function formatChangePct(pct: number): string {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

export function formatPrice(value: number, currency: "HKD" | "USD"): string {
  if (value < 1) return `${currency} ${value.toFixed(3)}`;
  return `${currency} ${value.toLocaleString("en-HK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Educational paper/demo suggestion engine — rule-based, never "sure win".
 * Prefers ETFs and lower-risk names; flags penny stocks as avoid-for-beginners.
 */
export function buildEducationalIdeas(
  snapshot: MarketSnapshot,
  focus: MarketId | "ALL" = "ALL"
): InvestIdea[] {
  const names = snapshot.names.filter(
    (n) => focus === "ALL" || n.market === focus
  );

  const ideas: InvestIdea[] = [];

  for (const q of names) {
    if (q.category === "penny") {
      ideas.push({
        id: `idea-${q.id}`,
        quoteId: q.id,
        market: q.market,
        symbol: q.symbol,
        nameZh: q.nameZh,
        category: q.category,
        riskLevel: "very_high",
        thesisZh:
          "【教學反例】低價／仙股常有流動性差、資訊不對稱同炒作風險。學習目標係識別紅旗，而唔係練習買入。",
        whyCategoryZh: categoryLabel("penny"),
        learningEntryZone: {
          low: 0,
          high: 0,
          noteZh: "新手學習框架：建議紙上倉位 = 0；只做觀察同風險筆記。",
        },
        suggestedPaperWeightPct: 0,
        exitReviewChecklist: [
          "有冇停牌／除牌風險提示？",
          "成交量是否極低？",
          "公司基本資料是否透明？",
          "自己是否只因為「平」而想買？",
        ],
        riskAnalysisZh: [
          "極高波動，紙上練習亦應標示「唔適合新手真實資金」。",
          "可能出現無法按預期價格成交嘅情況（示範說明）。",
          "唔保證、亦唔暗示任何回報。",
        ],
        isDemo: true,
      });
      continue;
    }

    const band = q.riskLevel === "low" ? 0.03 : q.riskLevel === "medium" ? 0.05 : 0.08;
    const low = +(q.last * (1 - band)).toFixed(q.last < 1 ? 3 : 2);
    const high = +(q.last * (1 + band * 0.4)).toFixed(q.last < 1 ? 3 : 2);
    const weight =
      q.category === "etf"
        ? 15
        : q.riskLevel === "low"
          ? 10
          : q.riskLevel === "medium"
            ? 6
            : 3;

    ideas.push({
      id: `idea-${q.id}`,
      quoteId: q.id,
      market: q.market,
      symbol: q.symbol,
      nameZh: q.nameZh,
      category: q.category,
      riskLevel: q.riskLevel,
      thesisZh:
        q.category === "etf"
          ? `【示範學習想法】以「核心分散」練習：${q.nameZh} 代表一籃子資產，適合學資產配置同再平衡，而唔係追逐短線。`
          : `【示範學習想法】用 ${q.nameZh}（${q.symbol}）練習閱讀報價、分類同風險分級。近期示範變動 ${formatChangePct(q.changePct)}，只供對照，唔係買賣信號。`,
      whyCategoryZh: `${categoryLabel(q.category)} — ${
        CATEGORIES.find((c) => c.id === q.category)?.blurbZh ?? ""
      }`,
      learningEntryZone: {
        low,
        high,
        noteZh:
          "「學習入場區」係練習用價格帶，協助理解區間同耐心；唔係保證入貨位，亦唔係真實下單指令。",
      },
      suggestedPaperWeightPct: weight,
      exitReviewChecklist: [
        "原定學習論點仲成唔成立？（基本／估值／風險）",
        "紙上倉位有冇超過自己訂嘅風險上限？",
        "有冇因為短期漲跌而偏離計劃？",
        "離場／複盤日期到未？（建議預先寫低檢討日）",
        "若用真倉：手續費、稅項、匯率有冇計入？（港股印花稅等）",
      ],
      riskAnalysisZh: [
        RISK_LABELS[q.riskLevel] + " 風險等級（教育標籤）。",
        CATEGORIES.find((c) => c.id === q.category)?.riskNoteZh ?? "",
        "示範資料可能過時；真實決策前請查證交易所／券商報價。",
        "任何紙上盈利唔代表將來真實回報。",
      ].filter(Boolean),
      isDemo: true,
    });
  }

  // Prefer showing ETFs / lower risk first for beginners
  const rank = (r: RiskLevel) =>
    r === "low" ? 0 : r === "medium" ? 1 : r === "high" ? 2 : 3;
  return ideas.sort((a, b) => rank(a.riskLevel) - rank(b.riskLevel));
}

/** Beginner position-size helper: risk % of paper capital vs stop distance. */
export function calcPositionSize(input: PositionSizeInput): PositionSizeResult {
  const capital = Math.max(0, input.paperCapital);
  const riskPct = Math.min(5, Math.max(0.1, input.riskPctOfCapital));
  const entry = Math.max(0.0001, input.entryPrice);
  const stopPct = Math.min(50, Math.max(0.5, input.stopDistancePct));
  const riskAmount = (capital * riskPct) / 100;
  const stopDistance = entry * (stopPct / 100);
  const shares = stopDistance > 0 ? Math.floor(riskAmount / stopDistance) : 0;
  const notional = shares * entry;
  const weightPct = capital > 0 ? (notional / capital) * 100 : 0;

  return {
    riskAmount,
    shares,
    notional,
    weightPct,
    notesZh: [
      `假設每筆最多風險資本 ${riskPct}%（紙上練習常用 0.5%–2%）。`,
      `止損距離約 ${stopPct}% 時，可買約 ${shares} 股（向下取整）。`,
      "呢個只係倉位框架練習，唔係建議你落實買賣。",
      "港股有手數／印花稅等費用；美股有佣金同匯率——真倉要另計。",
    ],
  };
}
