/**
 * SmartJP — beginner → JLPT N1 課程大綱與學習日程產生器
 */

export type JapaneseLevelId =
  | "beginner"
  | "n5"
  | "n4"
  | "n3"
  | "n2"
  | "n1";

export type LessonFocus =
  | "vocab"
  | "grammar"
  | "kanji"
  | "listening"
  | "reading"
  | "speaking"
  | "writing";

/** 詞彙一項：漢字／假名表面形 + 讀法 + 意思 */
export interface JapaneseVocabItem {
  /** 日文表面形（漢字或假名） */
  ja: string;
  /** 讀法（ひらがな／カタカナ，按程度） */
  reading: string;
  /** 粵語／繁中意思 */
  meaningZh: string;
  /** 可選羅馬字（入門較常用） */
  romaji?: string;
}

/** 例句：日文 + 讀法 + 意思 */
export interface JapaneseExample {
  ja: string;
  reading: string;
  meaningZh: string;
}

/** 課堂完整學習內容（唔只係日程／checklist） */
export interface LessonStudyContent {
  vocab: JapaneseVocabItem[];
  examples: JapaneseExample[];
  /** 文法／用法講解（粵語） */
  tipsZh: string[];
  /** 練習提示／迷你操練 */
  practiceZh: string[];
  /** 可選：文化／實用Tips */
  cultureTipsZh?: string[];
}

export interface JapaneseLesson {
  id: string;
  titleZh: string;
  titleJa: string;
  focus: LessonFocus;
  minutes: number;
  summaryZh: string;
  checklist: string[];
  sampleJa?: string;
  sampleZh?: string;
}

export interface JapaneseUnit {
  id: string;
  titleZh: string;
  titleJa: string;
  lessons: JapaneseLesson[];
}

export interface JapaneseLevel {
  id: JapaneseLevelId;
  labelZh: string;
  labelJa: string;
  blurbZh: string;
  estimatedWeeks: number;
  units: JapaneseUnit[];
}

export interface StudyPreferences {
  nickname: string;
  currentLevel: JapaneseLevelId;
  daysPerWeek: number;
  minutesPerDay: number;
  goal: "conversation" | "jlpt" | "travel" | "anime" | "work";
  weeklyDays: number[]; // 0=Sun … 6=Sat
}

export interface ScheduledStudyBlock {
  lessonId: string;
  levelId: JapaneseLevelId;
  unitId: string;
  titleZh: string;
  titleJa: string;
  focus: LessonFocus;
  minutes: number;
}

export interface StudyDayPlan {
  dayIndex: number; // 0–6 within week cycle display
  weekday: number; // 0=Sun
  labelZh: string;
  blocks: ScheduledStudyBlock[];
  totalMinutes: number;
  isRest: boolean;
}

export interface GeneratedStudySchedule {
  preferences: StudyPreferences;
  weeks: { weekNumber: number; days: StudyDayPlan[] }[];
  totalLessons: number;
  estimatedWeeks: number;
  notes: string[];
}

export const LEVEL_ORDER: JapaneseLevelId[] = [
  "beginner",
  "n5",
  "n4",
  "n3",
  "n2",
  "n1",
];

export const FOCUS_LABELS: Record<LessonFocus, string> = {
  vocab: "詞彙",
  grammar: "文法",
  kanji: "漢字",
  listening: "聽力",
  reading: "讀解",
  speaking: "會話",
  writing: "書寫",
};

export const GOAL_OPTIONS: { id: StudyPreferences["goal"]; label: string }[] = [
  { id: "conversation", label: "日常會話" },
  { id: "jlpt", label: "考 JLPT" },
  { id: "travel", label: "旅行實用" },
  { id: "anime", label: "動漫／文化" },
  { id: "work", label: "工作／商務" },
];

export const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"] as const;

export const DEFAULT_PREFERENCES: StudyPreferences = {
  nickname: "",
  currentLevel: "beginner",
  daysPerWeek: 4,
  minutesPerDay: 30,
  goal: "jlpt",
  weeklyDays: [1, 2, 4, 6], // 一、二、四、六
};

export const SAMPLE_PREFERENCES: StudyPreferences = {
  nickname: "學習者",
  currentLevel: "n5",
  daysPerWeek: 5,
  minutesPerDay: 40,
  goal: "jlpt",
  weeklyDays: [1, 2, 3, 4, 5],
};

function L(
  id: string,
  titleZh: string,
  titleJa: string,
  focus: LessonFocus,
  minutes: number,
  summaryZh: string,
  checklist: string[],
  sampleJa?: string,
  sampleZh?: string
): JapaneseLesson {
  return {
    id,
    titleZh,
    titleJa,
    focus,
    minutes,
    summaryZh,
    checklist,
    sampleJa,
    sampleZh,
  };
}

function U(
  id: string,
  titleZh: string,
  titleJa: string,
  lessons: JapaneseLesson[]
): JapaneseUnit {
  return { id, titleZh, titleJa, lessons };
}

export const JAPANESE_COURSE: JapaneseLevel[] = [
  {
    id: "beginner",
    labelZh: "零基礎入門",
    labelJa: "入門",
    blurbZh: "假名、發音、基本問候同數字，為 JLPT N5 打底。",
    estimatedWeeks: 6,
    units: [
      U("beg-1", "平假名基礎", "ひらがな", [
        L(
          "beg-1-1",
          "あ行～な行",
          "あいうえお～なにぬねの",
          "writing",
          25,
          "學識あ行到な行嘅讀寫同筆順。",
          ["跟讀あいうえお", "默寫か行", "用閃卡練習な行"],
          "あいうえお",
          "a i u e o"
        ),
        L(
          "beg-1-2",
          "は行～ん",
          "はひふへほ～ん",
          "writing",
          25,
          "完成平假名表，包濁音、半濁音。",
          ["寫齊は行・ま行・や行", "練習が・ざ・だ・ば・ぱ", "聽寫簡易假名詞"],
          "こんにちは",
          "午安／你好"
        ),
        L(
          "beg-1-3",
          "平假名聽寫小測",
          "ひらがな聞き取り",
          "listening",
          20,
          "聽音寫假名，鞏固讀音對應。",
          ["聽寫 20 個假名", "對答案改正", "重讀錯題"]
        ),
      ]),
      U("beg-2", "片假名基礎", "カタカナ", [
        L(
          "beg-2-1",
          "ア行～ナ行",
          "アイウエオ～ナニヌネノ",
          "writing",
          25,
          "片假名常用喺外來語，先記基本行。",
          ["抄寫ア行", "分辨ヒラガナ同カタカナ", "讀出外來語例子"],
          "コーヒー",
          "咖啡"
        ),
        L(
          "beg-2-2",
          "ハ行～ン與長音",
          "ハ行～ン・長音",
          "writing",
          25,
          "學長音、促音喺片假名嘅寫法。",
          ["練習ー長音", "讀出タクシー・バス", "聽寫 10 個外來語"],
          "タクシー",
          "的士"
        ),
      ]),
      U("beg-3", "問候與自我介紹", "あいさつ", [
        L(
          "beg-3-1",
          "基本問候",
          "基本のあいさつ",
          "speaking",
          20,
          "早晨、再見、多謝等日常招呼。",
          ["跟讀おはようございます", "角色扮演見面", "錄低自己講一次"],
          "おはようございます。",
          "早晨。"
        ),
        L(
          "beg-3-2",
          "自我介紹句型",
          "自己紹介",
          "speaking",
          25,
          "用「〜です／〜から来ました」介紹自己。",
          ["寫自己介紹稿", "練習です／ではありません", "對住鏡講兩分鐘"],
          "はじめまして。〇〇です。",
          "初次見面，我係〇〇。"
        ),
      ]),
      U("beg-4", "數字與時間", "数と時間", [
        L(
          "beg-4-1",
          "1～100 同量詞入門",
          "数の数え方",
          "vocab",
          25,
          "基數、個／本／枚等常見量詞。",
          ["數到 100", "練習～つ・～人", "聽數字聽寫"],
          "りんごが三つあります。",
          "有三個蘋果。"
        ),
        L(
          "beg-4-2",
          "鐘點與星期",
          "時刻と曜日",
          "vocab",
          20,
          "幾點、星期幾、今日／聽日。",
          ["講出而家幾點", "背齊曜日", "造三句約時間"],
          "今は三時半です。",
          "而家三點半。"
        ),
      ]),
      U("beg-5", "基本助詞入門", "助詞入門", [
        L(
          "beg-5-1",
          "は・が・を",
          "は・が・を",
          "grammar",
          30,
          "主題、主語、受詞助詞嘅基本用法。",
          ["抄例句五句", "填空練習", "自己造句"],
          "わたしは水を飲みます。",
          "我飲水。"
        ),
        L(
          "beg-5-2",
          "に・で・へ",
          "に・で・へ",
          "grammar",
          30,
          "時間、場所、移動方向助詞。",
          ["分辨に／で", "畫簡單場景造句", "口頭複述"],
          "学校へ行きます。",
          "去學校。"
        ),
      ]),
      U("beg-6", "存在與形容", "あります・です", [
        L(
          "beg-6-1",
          "あります／います",
          "あります・います",
          "grammar",
          25,
          "有生命同無生命嘅「有」。",
          ["分類練習", "描述房間物品", "聽力判斷"],
          "机の上に本があります。",
          "桌上有本書。"
        ),
        L(
          "beg-6-2",
          "い形容詞・な形容詞入門",
          "形容詞入門",
          "grammar",
          25,
          "大きい／きれい 等基本形容。",
          ["列十個形容詞", "造肯定／否定句", "描述朋友"],
          "この部屋は広いです。",
          "呢間房好闊。"
        ),
      ]),
      U("beg-7", "動詞ます形", "ます形", [
        L(
          "beg-7-1",
          "ます／ません／ました",
          "動詞の丁寧形",
          "grammar",
          30,
          "丁寧形現在、過去同否定。",
          ["變化練習 15 個動詞", "寫三日行程", "同伴問答"],
          "昨日映画を見ました。",
          "尋日睇咗戲。"
        ),
        L(
          "beg-7-2",
          "願望たい形入門",
          "〜たいです",
          "grammar",
          20,
          "表達想做咩。",
          ["造五句たい", "角色扮演點餐願望", "聽力捉たい"],
          "日本へ行きたいです。",
          "想去日本。"
        ),
      ]),
      U("beg-8", "入門總複習", "入門まとめ", [
        L(
          "beg-8-1",
          "假名＋句型綜合",
          "総合練習",
          "reading",
          30,
          "短文閱讀同聽力，檢查入門進度。",
          ["讀短文並翻譯", "聽對話答題", "默寫自我介紹"]
        ),
        L(
          "beg-8-2",
          "入門過關測驗",
          "確認テスト",
          "grammar",
          35,
          "綜合小測，準備進入 N5。",
          ["完成 20 題測驗", "錯題重溫", "訂 N5 學習目標"]
        ),
      ]),
    ],
  },
  {
    id: "n5",
    labelZh: "JLPT N5",
    labelJa: "N5",
    blurbZh: "約 800 詞、100 漢字、基本文法；能應付簡單日常對話。",
    estimatedWeeks: 10,
    units: [
      U("n5-1", "家族與日常生活", "家族と生活", [
        L("n5-1-1", "家族詞彙", "家族の言葉", "vocab", 25, "家族稱呼同基本生活詞。", ["背 20 個家族詞", "畫家族樹並介紹", "聽力配對"], "兄は学生です。", "家姐／哥哥係學生。"),
        L("n5-1-2", "一日行程句型", "一日のスケジュール", "speaking", 25, "用時間＋動詞講一日。", ["寫時間表", "口頭講三次", "錄音自評"]),
      ]),
      U("n5-2", "て形與請求", "て形", [
        L("n5-2-1", "て形變化", "て形の作り方", "grammar", 35, "グループ I・II・III て形。", ["完成變化表", "造五句てください", "聽寫て形"], "ちょっと待ってください。", "請等一陣。"),
        L("n5-2-2", "て＋います進行", "〜ています", "grammar", 25, "進行中同習慣狀態。", ["分辨進行／習慣", "描述而家做緊咩", "看圖造句"]),
      ]),
      U("n5-3", "場所與移動", "場所と移動", [
        L("n5-3-1", "場所詞彙＋行き方", "場所・行き方", "vocab", 25, "車站、便利店、左右前後。", ["背場所詞", "用地圖指路", "聽對話找地點"], "駅の前にコンビニがあります。", "車站前面有便利店。"),
        L("n5-3-2", "交通手段", "乗り物", "listening", 20, "電車、巴士、步行等。", ["聽交通公告", "計劃假日路線", "造句用で"]),
      ]),
      U("n5-4", "飲食與點餐", "食事", [
        L("n5-4-1", "食物詞彙", "食べ物の単語", "vocab", 25, "常見食物、味道形容。", ["分類食物卡", "描述喜好", "角色扮演點餐"], "ラーメンを一つください。", "請畀一碗拉麵。"),
        L("n5-4-2", "餐廳會話", "レストラン会話", "speaking", 30, "點餐、結帳、禮貌用語。", ["背五句店員用語", "雙人對話", "聽真實對話片段"]),
      ]),
      U("n5-5", "N5 漢字（一）", "漢字①", [
        L("n5-5-1", "人・日・月・水等", "基本漢字", "kanji", 30, "認識約 25 個 N5 漢字。", ["寫筆順", "讀音訓讀", "組詞練習"], "日曜日に水を飲みます。", "星期日飲水。"),
        L("n5-5-2", "上下左右大小", "位置と大きさ", "kanji", 25, "方位同大小相關漢字。", ["默寫 15 字", "看圖選漢字", "短句填空"]),
      ]),
      U("n5-6", "形容詞活用", "形容詞の活用", [
        L("n5-6-1", "い形容詞過去／否定", "い形容詞", "grammar", 30, "かった／くない 等。", ["變化練習", "天氣日記三句", "聽力判斷"], "昨日は寒かったです。", "尋日好凍。"),
        L("n5-6-2", "な形容詞變化", "な形容詞", "grammar", 25, "でした／じゃありません。", ["造句比較", "描述房間", "小測"]),
      ]),
      U("n5-7", "比較與希望", "比較・希望", [
        L("n5-7-1", "より・のほうが", "比較表現", "grammar", 25, "比較兩者好惡。", ["造三組比較", "討論喜好", "讀短文"], "電車よりバスのほうが安いです。", "巴士平過電車。"),
        L("n5-7-2", "ほしい／たい複習", "希望表現", "vocab", 20, "想要同想做。", ["分辨ほしい／たい", "願望清單", "口頭分享"]),
      ]),
      U("n5-8", "時間表達進階", "時間表現", [
        L("n5-8-1", "から・まで・ごろ", "時間の助詞", "grammar", 25, "由…到…、大約。", ["填時間表", "約朋友對話", "聽力捉時間"], "九時から五時まで働きます。", "由九點做到五點。"),
        L("n5-8-2", "頻度副詞", "いつも・ときどき", "vocab", 20, "總係、有時、從不。", ["造句用頻度詞", "自我調查問卷", "同伴訪問"]),
      ]),
      U("n5-9", "N5 讀解入門", "読解入門", [
        L("n5-9-1", "告示與便條", "お知らせ・メモ", "reading", 30, "讀便利店告示、便條。", ["劃出生詞", "答理解題", "改寫便條"]),
        L("n5-9-2", "短對話理解", "短い会話", "listening", 25, "N5 風格聽力題。", ["聽兩次答題", "對腳本", "跟讀"]),
      ]),
      U("n5-10", "N5 總複習", "N5まとめ", [
        L("n5-10-1", "文法＋漢字綜合", "総合練習", "grammar", 35, "模擬小卷重點題。", ["完成模擬 30 題", "錯題本", "重溫弱項單元"]),
        L("n5-10-2", "N5 模擬測驗", "模擬試験", "reading", 40, "計時練習讀解＋聽力。", ["嚴格計時", "計分", "訂 N4 計劃"]),
      ]),
    ],
  },
  {
    id: "n4",
    labelZh: "JLPT N4",
    labelJa: "N4",
    blurbZh: "擴充文法同約 300 漢字，能處理稍複雜日常場面。",
    estimatedWeeks: 12,
    units: [
      U("n4-1", "可能形與意向", "可能・意向", [
        L("n4-1-1", "可能形（れる／られる）", "可能形", "grammar", 35, "表達能力同可能性。", ["變化 20 動詞", "能力自評表", "對話練習"], "漢字が読めます。", "識讀漢字。"),
        L("n4-1-2", "意向形・う／よう", "意向形", "grammar", 30, "提議「不如…」。", ["造提議句", "計劃週末", "聽力捉意向"]),
      ]),
      U("n4-2", "授受表達", "あげます・もらいます", [
        L("n4-2-1", "あげる／もらう／くれる", "授受動詞", "grammar", 35, "施受關係基本。", ["畫箭嘴圖", "填空", "真實故事造句"], "友達が本をくれました。", "朋友送咗書畀我。"),
        L("n4-2-2", "てあげる／てもらう", "て形の授受", "grammar", 30, "幫忙同請人幫忙。", ["角色扮演", "寫感謝訊息", "小測"]),
      ]),
      U("n4-3", "條件句入門", "条件表現", [
        L("n4-3-1", "たら・と・ば", "たら・と・ば", "grammar", 40, "三種條件基本差異。", ["對照表", "情境造句", "改錯"], "雨が降ったら、家にいます。", "落雨就留喺屋企。"),
        L("n4-3-2", "なら建議", "〜なら", "grammar", 25, "針對對方話題建議。", ["答問題用なら", "建議對話", "聽力"]),
      ]),
      U("n4-4", "樣態與傳聞", "そう・ようです", [
        L("n4-4-1", "〜そうです（樣態）", "様態のそう", "grammar", 30, "看起來…。", ["看圖說そう", "天氣描述", "分辨樣態／傳聞"], "雨が降りそうです。", "好似快落雨。"),
        L("n4-4-2", "〜そうです（傳聞）", "伝聞のそう", "grammar", 25, "聽說…。", ["新聞標題改寫", "傳話遊戲", "聽力"]),
      ]),
      U("n4-5", "N4 漢字專練", "漢字②", [
        L("n4-5-1", "動詞漢字（思・言・話）", "動詞漢字", "kanji", 30, "常用動詞漢字讀寫。", ["音訓練習", "組詞", "短文填漢字"]),
        L("n4-5-2", "場所・交通漢字", "場所漢字", "kanji", 30, "駅・道・橋 等。", ["默寫", "看地圖標漢字", "聽寫"]),
      ]),
      U("n4-6", "敬語入門", "敬語入門", [
        L("n4-6-1", "丁寧語複習＋謙譲", "丁寧・謙譲", "speaking", 30, "です／ます 同基本謙譲。", ["店員對話", "電話禮儀", "錄音"], "少々お待ちください。", "請稍等。"),
        L("n4-6-2", "尊敬語入門", "尊敬語", "grammar", 30, "いらっしゃる等入門。", ["對照表", "改寫句子", "角色扮演"]),
      ]),
      U("n4-7", "工作與學校場景", "学校・仕事", [
        L("n4-7-1", "學校生活詞彙", "学校生活", "vocab", 25, "科目、功課、社團。", ["背詞", "描述一日", "聽力"]),
        L("n4-7-2", "兼職會話", "アルバイト", "speaking", 30, "請假、交接、禮貌請求。", ["寫請假訊息", "對話練習", "錯句改正"], "明日休んでもいいですか。", "聽日可唔可以休息？"),
      ]),
      U("n4-8", "被動・使役入門", "受身・使役", [
        L("n4-8-1", "被動形入門", "受身形", "grammar", 35, "誰被點影響。", ["變化練習", "新聞標題簡化", "造句"], "弟にケーキを食べられました。", "蛋糕俾細佬食咗。"),
        L("n4-8-2", "使役形入門", "使役形", "grammar", 35, "令人做某事。", ["變化表", "父母／上司情境", "小測"]),
      ]),
      U("n4-9", "N4 讀解・聽力", "読解・聴解", [
        L("n4-9-1", "電郵與告示", "メール・お知らせ", "reading", 35, "稍長實用文章。", ["抓主旨", "答題", "生詞本"]),
        L("n4-9-2", "N4 聽力策略", "聴解ストラテジー", "listening", 30, "預讀選項、捉關鍵詞。", ["練習三題", "記下干擾項", "跟讀"]),
      ]),
      U("n4-10", "N4 總複習", "N4まとめ", [
        L("n4-10-1", "文法弱項補強", "文法復習", "grammar", 35, "針對たら／授受／可能。", ["錯題重做", "自製測驗", "教人一次"]),
        L("n4-10-2", "N4 模擬測驗", "模擬試験", "reading", 45, "計時綜合卷。", ["計時完成", "分析分數", "訂 N3 目標"]),
      ]),
    ],
  },
  {
    id: "n3",
    labelZh: "JLPT N3",
    labelJa: "N3",
    blurbZh: "銜接中級：較複雜文法、約 650 漢字、新聞入門級閱讀。",
    estimatedWeeks: 14,
    units: [
      U("n3-1", "中級助詞與接續", "助詞・接続", [
        L("n3-1-1", "によって・に対して", "複雜助詞", "grammar", 35, "根據、對於等中級助詞。", ["例句筆記本", "新聞句改寫", "填空"], "努力によって成功した。", "靠努力成功咗。"),
        L("n3-1-2", "一方・反面・その上", "接続詞", "grammar", 30, "對比同添加接續。", ["文章填接續", "寫短段落", "閱讀理解"]),
      ]),
      U("n3-2", "意志・推測", "だろう・かもしれない", [
        L("n3-2-1", "だろう／でしょう", "推量", "grammar", 30, "推測語氣。", ["天氣預報造句", "意見表達", "聽力"], "明日は晴れるでしょう。", "聽日應該會晴。"),
        L("n3-2-2", "かもしれない・はずだ", "可能性", "grammar", 30, "可能同理應。", ["情境判斷", "對比表", "對話"]),
      ]),
      U("n3-3", "受身・使役受身", "受身・使役受身", [
        L("n3-3-1", "被動進階", "受身の応用", "grammar", 35, "直接／間接被動。", ["分類例句", "抱怨情境", "改寫"]),
        L("n3-3-2", "使役被動", "使役受身", "grammar", 35, "被迫做某事。", ["變化練習", "職場故事", "小測"], "毎日漢字を覚えさせられます。", "每日被人迫背漢字。"),
      ]),
      U("n3-4", "敬語實戰", "敬語応用", [
        L("n3-4-1", "商務郵件敬語", "ビジネスメール", "writing", 35, "件名・起承轉合。", ["寫一封請假信", "改寫粗魯句", "對照範本"]),
        L("n3-4-2", "接待與電話", "受付・電話", "speaking", 30, "電話應答套語。", ["跟讀腳本", "錄音", "角色扮演"], "少々お待ちいただけますか。", "可唔可以稍等？"),
      ]),
      U("n3-5", "N3 漢字與熟語", "漢字③", [
        L("n3-5-1", "漢音詞彙", "音読み語彙", "kanji", 35, "常用二字熟語。", ["50 詞閃卡", "聽寫", "造句"]),
        L("n3-5-2", "同音異義分辨", "同音異義語", "kanji", 30, "橋／箸／端 等。", ["聽音選字", "語境練習", "錯題本"]),
      ]),
      U("n3-6", "新聞與說明文入門", "説明文", [
        L("n3-6-1", "簡易新聞結構", "ニュースの読み方", "reading", 40, "標題、リード、結論。", ["劃結構", "摘要三句", "生詞表"]),
        L("n3-6-2", "圖表說明", "グラフ説明", "speaking", 30, "上升／下降等表述。", ["描述一張圖", "錄影一分鐘", "同伴互評"]),
      ]),
      U("n3-7", "感情與評價表達", "感情表現", [
        L("n3-7-1", "〜てしまう・〜ことになる", "結果表現", "grammar", 30, "完成／結果變化。", ["日記用てしまう", "規則說明", "聽力"]),
        L("n3-7-2", "感想・評價詞", "感想語彙", "vocab", 25, "感動、失望、便利等。", ["影評五句", "詞彙地圖", "對話"]),
      ]),
      U("n3-8", "中級聽力策略", "聴解中級", [
        L("n3-8-1", "長對話重點", "長い会話", "listening", 35, "抓話題轉換同結論。", ["邊聽邊筆記", "答題", "對腳本"]),
        L("n3-8-2", "即時反應題", "即時応答", "listening", 25, "N3 即時回應練習。", ["連續 10 題", "分析錯誤", "跟讀正確回應"]),
      ]),
      U("n3-9", "寫作：說明與意見", "作文", [
        L("n3-9-1", "200 字說明文", "説明文を書く", "writing", 40, "介紹家鄉／興趣。", ["列大綱", "寫草稿", "自我修改"]),
        L("n3-9-2", "意見段落", "意見文", "writing", 35, "贊成／反對＋理由。", ["選題寫 150 字", "加接續詞", "朗讀"]),
      ]),
      U("n3-10", "N3 總複習", "N3まとめ", [
        L("n3-10-1", "文法總整理", "文法総復習", "grammar", 40, "助詞、條件、敬語。", ["心智圖", "模擬文法卷", "弱項清單"]),
        L("n3-10-2", "N3 模擬測驗", "模擬試験", "reading", 50, "接近正式考試節奏。", ["全卷計時", "分數分析", "訂 N2 路線"]),
      ]),
    ],
  },
  {
    id: "n2",
    labelZh: "JLPT N2",
    labelJa: "N2",
    blurbZh: "中上級：報紙、商務場合，文法細微差異同大量漢字。",
    estimatedWeeks: 16,
    units: [
      U("n2-1", "中上級文法（一）", "上級文法①", [
        L("n2-1-1", "〜わけだ・〜はずだ・〜べきだ", "判斷表現", "grammar", 40, "推論、理應、應該。", ["對照表", "社論句子分析", "造句十則"]),
        L("n2-1-2", "〜に違いない・〜かねない", "確信度", "grammar", 35, "肯定同負面可能性。", ["新聞改寫", "風險描述", "小測"]),
      ]),
      U("n2-2", "中上級文法（二）", "上級文法②", [
        L("n2-2-1", "〜つつ・〜ながらも", "逆接・並行", "grammar", 35, "一邊…一邊／雖然。", ["文學句簡化", "寫複雜句", "聽力"], "悪いと知りつつ言ってしまった。", "明知唔好都講咗出嚟。"),
        L("n2-2-2", "〜ばかりか・〜のみならず", "添加強調", "grammar", 30, "不但…而且。", ["改寫簡單句", "演講稿練習", "閱讀填空"]),
      ]),
      U("n2-3", "書面語與口語差", "書き言葉・話し言葉", [
        L("n2-3-1", "報紙常用詞", "新聞語彙", "vocab", 35, "実施・検討・導入等書面常用詞。", ["50 詞卡", "標題翻譯", "聽新聞摘要"]),
        L("n2-3-2", "正式改寫", "文体変換", "writing", 35, "口語改書面。", ["改十句", "寫會議紀要", "互評"]),
      ]),
      U("n2-4", "N2 漢字密集", "漢字④", [
        L("n2-4-1", "難讀熟語", "難読熟語", "kanji", 40, "一線・諸行無常級熟語選練。", ["閃卡 40", "聽寫", "語境選擇"]),
        L("n2-4-2", "同訓異字", "同訓異字", "kanji", 35, "見る／観る／診る 等。", ["配對練習", "造句", "錯題本"]),
      ]),
      U("n2-5", "商務日語", "ビジネス日本語", [
        L("n2-5-1", "會議用語", "会議表現", "speaking", 35, "提案、附議、保留。", ["會議角色扮演", "用語表", "錄音"], "その件について検討したいと思います。", "想就呢件事再研究下。"),
        L("n2-5-2", "報告與簡報", "報告・プレゼン", "speaking", 40, "開場、數據、收結。", ["三分鐘簡報", "投影稿大綱", "Q&A 練習"]),
      ]),
      U("n2-6", "長文讀解策略", "読解上級", [
        L("n2-6-1", "論說文結構", "論説文", "reading", 45, "主張－理由－反駁。", ["劃結構", "作者意圖題", "摘要 80 字"]),
        L("n2-6-2", "內容一致題技巧", "内容一致", "reading", 40, "排除陷阱選項。", ["三篇練習", "錯因分類", "計時"]),
      ]),
      U("n2-7", "聽力：說明與演講", "聴解上級", [
        L("n2-7-1", "講座筆記", "講義メモ", "listening", 40, "邊聽邊記關鍵詞。", ["聽講座五分鐘", "整理筆記", "答題"]),
        L("n2-7-2", "即時判斷與整合", "統合理解", "listening", 35, "多資訊整合。", ["練習整合題", "畫關係圖", "覆盤"]),
      ]),
      U("n2-8", "表達細微語氣", "モダリティ", [
        L("n2-8-1", "〜ものだ・〜ことだ", "忠告・感慨", "grammar", 35, "感慨同勸告細微差。", ["對照例句", "勸告對話", "寫作運用"]),
        L("n2-8-2", "〜わけではない・〜というものでもない", "部分否定", "grammar", 35, "並非完全…。", ["改寫極端句", "辯論練習", "小測"]),
      ]),
      U("n2-9", "文化主題閱讀", "文化テーマ", [
        L("n2-9-1", "社會議題短文", "社会問題", "reading", 40, "環境、少子化等主題詞。", ["詞彙表", "立場摘要", "討論三點"]),
        L("n2-9-2", "隨筆風格", "エッセイ", "reading", 35, "作者語氣同修辭。", ["找修辭", "仿寫段落", "朗讀"]),
      ]),
      U("n2-10", "N2 總複習", "N2まとめ", [
        L("n2-10-1", "文法＋語彙模擬", "言語知識", "grammar", 45, "言語知識混合卷。", ["計時完成", "弱項地圖", "每日 20 題計劃"]),
        L("n2-10-2", "N2 全科模擬", "模擬試験", "reading", 60, "接近正式時長。", ["全卷", "分數換算", "訂 N1 衝刺"]),
      ]),
    ],
  },
  {
    id: "n1",
    labelZh: "JLPT N1",
    labelJa: "N1",
    blurbZh: "高級：抽象論述、專業文章、細緻語氣同近義辨析。",
    estimatedWeeks: 18,
    units: [
      U("n1-1", "高級文法精準度", "上級文法精選", [
        L("n1-1-1", "〜んがため・〜ともなく", "文語的表現", "grammar", 40, "文語殘留同高級句型。", ["例句精讀", "改寫現代語", "造句五則"]),
        L("n1-1-2", "〜たらんばかり・〜が早いか", "瞬間・程度", "grammar", 40, "幾乎要…、一…就。", ["對照近義", "文學句分析", "小測"], "泣かんばかりの顔", "幾乎要喊嘅表情"),
      ]),
      U("n1-2", "近義文法辨析", "類義表現", [
        L("n1-2-1", "〜につけ・〜に際して・〜にあたって", "時機表現", "grammar", 40, "時機相關近義差。", ["選擇題 20", "情境配對", "作文運用"]),
        L("n1-2-2", "〜限り・〜に限って・〜に限らず", "限定表現", "grammar", 35, "限定範圍細分。", ["對照表", "改錯", "對話"]),
      ]),
      U("n1-3", "學術／社論詞彙", "論説語彙", [
        L("n1-3-1", "抽象名詞群", "抽象語彙", "vocab", 40, "概念・観点・枠組み 等。", ["100 詞分週背", "定義配對", "摘要用詞"]),
        L("n1-3-2", "連接詞高級", "高度な接続", "vocab", 35, "にもかかわらず・ゆえに 等。", ["填空文章", "寫論證段", "朗讀"]),
      ]),
      U("n1-4", "N1 漢字與四字熟語", "漢字⑤", [
        L("n1-4-1", "四字熟語精選", "四字熟語", "kanji", 40, "一石二鳥、臨機応変 等。", ["30 熟語", "故事配對", "造句"], "臨機応変に対応する", "臨機應變噉應對"),
        L("n1-4-2", "難字與表外讀", "難読・表外", "kanji", 35, "考試常見難讀。", ["聽寫", "語境選讀", "錯題本"]),
      ]),
      U("n1-5", "長篇論說讀解", "長文読解", [
        L("n1-5-1", "作者論證追蹤", "主張の追跡", "reading", 50, "多段論證同反例。", ["劃論證鏈", "答主旨題", "寫反駁段"]),
        L("n1-5-2", "比較兩篇文章", "文章比較", "reading", 45, "異同整理。", ["Venn 圖", "比較題", "三分鐘口述"]),
      ]),
      U("n1-6", "高級聽力", "聴解上級+", [
        L("n1-6-1", "學術講座", "学術講義", "listening", 45, "定義、例子、例外。", ["筆記模板", "聽 8 分鐘", "還原大綱"]),
        L("n1-6-2", "會議多方觀點", "多人数議論", "listening", 40, "誰持咩立場。", ["標註說話者", "整合題", "覆盤"]),
      ]),
      U("n1-7", "翻譯與摘要", "要約・翻訳", [
        L("n1-7-1", "日→粵／中摘要", "日本語要約", "writing", 40, "將 800 字壓到 120 字。", ["刪冗餘", "保留論點", "對照原文"]),
        L("n1-7-2", "粵→日正式表達", "翻訳練習", "writing", 40, "本地情境譯成自然日語。", ["譯五句", "敬語調整", "母語者範本對照"]),
      ]),
      U("n1-8", "語用與修辭", "語用論", [
        L("n1-8-1", "婉曲與含蓄", "遠回し表現", "speaking", 35, "拒絕、批評嘅含蓄講法。", ["情景應對", "對照直接句", "錄音"]),
        L("n1-8-2", "反語・強調", "レトリック", "reading", 35, "識別修辭意圖。", ["標註修辭", "語氣改寫", "討論"]),
      ]),
      U("n1-9", "專題：時事精讀", "時事精読", [
        L("n1-9-1", "經濟／科技短評", "経済・科技", "reading", 45, "專業欄位詞彙。", ["生詞本", "背景調查", "立場摘要"]),
        L("n1-9-2", "口述簡報時事", "時事プレゼン", "speaking", 40, "用日語講時事兩分鐘。", ["大綱", "錄影", "自評流暢度"]),
      ]),
      U("n1-10", "N1 衝刺", "N1仕上げ", [
        L("n1-10-1", "弱項專項日", "弱点克服", "grammar", 45, "只做錯題類型。", ["分類錯題", "專項 40 題", "再測"]),
        L("n1-10-2", "N1 全真模擬", "本番模擬", "reading", 70, "完整時長模擬。", ["嚴格計時", "分數換算", "考前一週計劃"]),
      ]),
    ],
  },
];

export function getLevel(levelId: JapaneseLevelId): JapaneseLevel | undefined {
  return JAPANESE_COURSE.find((l) => l.id === levelId);
}

export function getAllLessonsFrom(
  startLevel: JapaneseLevelId
): { level: JapaneseLevel; unit: JapaneseUnit; lesson: JapaneseLesson }[] {
  const startIdx = LEVEL_ORDER.indexOf(startLevel);
  const out: { level: JapaneseLevel; unit: JapaneseUnit; lesson: JapaneseLesson }[] =
    [];
  for (const level of JAPANESE_COURSE.slice(Math.max(0, startIdx))) {
    for (const unit of level.units) {
      for (const lesson of unit.lessons) {
        out.push({ level, unit, lesson });
      }
    }
  }
  return out;
}

export function findLesson(
  lessonId: string
): { level: JapaneseLevel; unit: JapaneseUnit; lesson: JapaneseLesson } | null {
  for (const level of JAPANESE_COURSE) {
    for (const unit of level.units) {
      const lesson = unit.lessons.find((l) => l.id === lessonId);
      if (lesson) return { level, unit, lesson };
    }
  }
  return null;
}

/** 全部課堂（課程順序），方便上一課／下一課 */
export function getAllLessonsFlat(): {
  level: JapaneseLevel;
  unit: JapaneseUnit;
  lesson: JapaneseLesson;
}[] {
  const out: {
    level: JapaneseLevel;
    unit: JapaneseUnit;
    lesson: JapaneseLesson;
  }[] = [];
  for (const level of JAPANESE_COURSE) {
    for (const unit of level.units) {
      for (const lesson of unit.lessons) {
        out.push({ level, unit, lesson });
      }
    }
  }
  return out;
}

export function getAdjacentLessons(lessonId: string): {
  prev: JapaneseLesson | null;
  next: JapaneseLesson | null;
} {
  const all = getAllLessonsFlat();
  const idx = all.findIndex((item) => item.lesson.id === lessonId);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? all[idx - 1].lesson : null,
    next: idx < all.length - 1 ? all[idx + 1].lesson : null,
  };
}

export function countLessons(levelId?: JapaneseLevelId): number {
  const levels = levelId
    ? JAPANESE_COURSE.filter((l) => l.id === levelId)
    : JAPANESE_COURSE;
  return levels.reduce(
    (sum, l) => sum + l.units.reduce((u, unit) => u + unit.lessons.length, 0),
    0
  );
}

export function levelProgress(
  levelId: JapaneseLevelId,
  completedIds: string[]
): { done: number; total: number; pct: number } {
  const level = getLevel(levelId);
  if (!level) return { done: 0, total: 0, pct: 0 };
  const ids = level.units.flatMap((u) => u.lessons.map((l) => l.id));
  const done = ids.filter((id) => completedIds.includes(id)).length;
  const total = ids.length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

function normalizeWeeklyDays(prefs: StudyPreferences): number[] {
  const unique = [...new Set(prefs.weeklyDays)]
    .filter((d) => d >= 0 && d <= 6)
    .sort((a, b) => a - b);
  if (unique.length >= prefs.daysPerWeek) {
    return unique.slice(0, prefs.daysPerWeek);
  }
  // Fill missing days starting Monday
  const filled = [...unique];
  for (let d = 1; d <= 7 && filled.length < prefs.daysPerWeek; d++) {
    const day = d % 7;
    if (!filled.includes(day)) filled.push(day);
  }
  return filled.sort((a, b) => a - b);
}

/**
 * 由目前程度開始，按每週日數同每日分鐘數，排出多週學習日程。
 */
export function generateStudySchedule(
  prefs: StudyPreferences,
  completedLessonIds: string[] = [],
  maxWeeks = 8
): GeneratedStudySchedule {
  const daysPerWeek = Math.min(7, Math.max(1, prefs.daysPerWeek || 3));
  const minutesPerDay = Math.min(120, Math.max(15, prefs.minutesPerDay || 30));
  const weeklyDays = normalizeWeeklyDays({ ...prefs, daysPerWeek });
  const queue = getAllLessonsFrom(prefs.currentLevel).filter(
    (item) => !completedLessonIds.includes(item.lesson.id)
  );

  const weeks: GeneratedStudySchedule["weeks"] = [];
  let cursor = 0;
  let weekNumber = 1;

  while (cursor < queue.length && weekNumber <= maxWeeks) {
    const days: StudyDayPlan[] = [];
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

      const blocks: ScheduledStudyBlock[] = [];
      let used = 0;
      while (cursor < queue.length && used < minutesPerDay) {
        const item = queue[cursor];
        const mins = item.lesson.minutes;
        // Allow one overflow lesson if day still empty
        if (blocks.length > 0 && used + mins > minutesPerDay + 10) break;
        blocks.push({
          lessonId: item.lesson.id,
          levelId: item.level.id,
          unitId: item.unit.id,
          titleZh: item.lesson.titleZh,
          titleJa: item.lesson.titleJa,
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
    if (cursor >= queue.length) break;
  }

  const remaining = queue.length - cursor;
  const notes: string[] = [
    `由「${getLevel(prefs.currentLevel)?.labelZh ?? prefs.currentLevel}」開始排程。`,
    `每週 ${daysPerWeek} 日、每日約 ${minutesPerDay} 分鐘。`,
  ];
  if (prefs.goal === "jlpt") {
    notes.push("目標偏考試：日程會優先跟課程單元順序，方便系統複習。");
  } else if (prefs.goal === "conversation") {
    notes.push("目標偏會話：記得將 speaking／listening 課出聲跟讀。");
  } else if (prefs.goal === "travel") {
    notes.push("目標偏旅行：可多複習點餐、交通、問路相關課。");
  }
  if (remaining > 0) {
    notes.push(
      `呢份日程顯示未來 ${weeks.length} 週；仲有約 ${remaining} 課未排入，完成後可再生成。`
    );
  } else {
    notes.push("已將目前程度起嘅待學課排入顯示範圍。");
  }

  const totalLessons = weeks.reduce(
    (s, w) => s + w.days.reduce((d, day) => d + day.blocks.length, 0),
    0
  );

  return {
    preferences: {
      ...prefs,
      daysPerWeek,
      minutesPerDay,
      weeklyDays,
    },
    weeks,
    totalLessons,
    estimatedWeeks: weeks.length,
    notes,
  };
}

export function courseStats() {
  return LEVEL_ORDER.map((id) => {
    const level = getLevel(id)!;
    return {
      id,
      labelZh: level.labelZh,
      units: level.units.length,
      lessons: countLessons(id),
      estimatedWeeks: level.estimatedWeeks,
    };
  });
}
