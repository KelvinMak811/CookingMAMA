/**
 * SmartInvest — per-lesson teachable body (concepts / examples / risk / quiz).
 * Kept separate so course structure in investCourse.ts stays readable.
 */

export interface InvestLessonExample {
  market: "HK" | "US" | "BOTH";
  titleZh: string;
  bodyZh: string;
}

export interface InvestQuizItem {
  questionZh: string;
  optionsZh: string[];
  answerIndex: number;
  explainZh: string;
}

/** Full teachable body — not just schedule/checklist. */
export interface InvestLessonContent {
  conceptsZh: string[];
  examples: InvestLessonExample[];
  riskNotesZh: string[];
  quiz: InvestQuizItem[];
  cantoneseTipZh?: string;
}

export const LESSON_CONTENT: Record<string, InvestLessonContent> = {
  "hk-1-1": {
    conceptsZh: [
      "港股主要喺香港交易所（HKEX）買賣；常見指數包括恒生指數（HSI）同恒生科技指數（HSTECH）。",
      "交易時段（簡化記法）：上午約 9:30–12:00、下午約 13:00–16:00（實際以交易所公布為準，另有開市前／收市競價）。",
      "港股多數以「手」為買賣單位；一手股數因股份而異（例如常見 100／500／1000 股一手）。",
      "指數係一籃子股份嘅加權表現；單一股份可以同指數走勢唔同步。",
    ],
    examples: [
      {
        market: "HK",
        titleZh: "恒指 vs 騰訊",
        bodyZh:
          "示範：恒生指數升 1%，唔代表 0700.HK 一定升 1%。指數反映一籃子；個股仲受業績、消息、資金流向影響。學習時要分開「大市氣氛」同「單一公司」。",
      },
      {
        market: "US",
        titleZh: "對照美股時段",
        bodyZh:
          "美股常規時段係美東 9:30–16:00；香港投資者要換算時差（夏令／冬令會變）。同一日你睇到「美股收市」，港股可能已經收咗。",
      },
    ],
    riskNotesZh: [
      "時段以外嘅消息可以令開市跳空；紙上練習都要寫低「隔夜風險」。",
      "唔好因為「大市升」就假設每隻股份都安全。",
      "投資有風險，內容僅供學習——呢度唔係落單指引。",
    ],
    quiz: [
      {
        questionZh: "「手」喺港股大致指咩？",
        optionsZh: [
          "固定一定係 100 股",
          "該股份規定嘅最少買賣單位（股數可因股而異）",
          "等同美股一份期權合約",
        ],
        answerIndex: 1,
        explainZh: "一手股數由發行人／市場慣例決定，唔係全球統一 100 股。",
      },
      {
        questionZh: "指數同個股邊句較正確？",
        optionsZh: [
          "指數升＝每隻成份股都升",
          "指數係一籃子表現；個股可以偏離",
          "指數只得仙股先會計入",
        ],
        answerIndex: 1,
        explainZh: "指數係加權一籃子；單一股份可以明顯跑贏或跑輸。",
      },
    ],
    cantoneseTipZh:
      "記住一句：指數講氣氛，個股講故事——兩者要分開睇。",
  },

  "hk-1-2": {
    conceptsZh: [
      "開高低收（OHLC）：開市價、最高、最低、收市價——讀 K 線／棒線嘅基本骨架。",
      "升跌幅通常以相對前收市計算；成交量反映該時段有幾多人成交。",
      "流動性：容易按合理價買賣嘅程度。成交極少嘅股份，示範價同你實際可成交價可以差好遠。",
      "一根 K 線只係一個時段摘要；單靠一日形態下結論好容易出事。",
    ],
    examples: [
      {
        market: "HK",
        titleZh: "讀一條示範棒線",
        bodyZh:
          "假設 2800.HK（盈富）示範：開 18.80、高 19.10、低 18.70、收 18.95，成交量較平日高。你可以記「區間」同「收喺區間邊度」，但仍然唔等於明日方向信號。",
      },
      {
        market: "US",
        titleZh: "美股報價習慣",
        bodyZh:
          "美股報價亦有 OHLC；大型股如 AAPL 通常 bid/ask 差價較窄。學習時可對照：同樣升跌幅，流動性差嘅股份滑價風險更高。",
      },
    ],
    riskNotesZh: [
      "成交量突然放大可能係消息或資金進出，亦可能係噪音——要配合基本資料，唔好神話成交量。",
      "示範圖／快照可能過時；真倉前要查券商即時報價。",
    ],
    quiz: [
      {
        questionZh: "OHLC 入面「C」通常指？",
        optionsZh: ["佣金", "收市價", "公司市值"],
        answerIndex: 1,
        explainZh: "C = Close（收市價）。",
      },
      {
        questionZh: "點解唔好只靠一根 K 線下結論？",
        optionsZh: [
          "因為 K 線一定錯",
          "因為單一短時段摘要唔等於趨勢或價值",
          "因為港股冇 K 線",
        ],
        answerIndex: 1,
        explainZh: "短時段形態可以隨機；要配合更多資訊同風險框架。",
      },
    ],
    cantoneseTipZh:
      "成交量幫你估「易唔易走得甩」，唔係自動買入燈號。",
  },

  "hk-1-3": {
    conceptsZh: [
      "常見分類（教材）：科技、金融、消費、醫藥、能源、藍籌、ETF、仙股／低價股。",
      "ETF：一次過持有一籃子資產；廣基指數 ETF 較適合新手學「核心配置」。",
      "藍籌：大型、成交相對活躍——唔等於無風險。",
      "仙股／極低價股：常伴低流動性、資訊不對稱、炒作同停牌風險——新手學習目標係認紅旗。",
    ],
    examples: [
      {
        market: "HK",
        titleZh: "ETF vs 單一科技股",
        bodyZh:
          "2800.HK（盈富）追蹤恒指一籃子；0700.HK 係單一公司。同樣紙上投入，集中單一公司嘅波動通常大過廣基 ETF。",
      },
      {
        market: "HK",
        titleZh: "虛構仙股紅旗",
        bodyZh:
          "示範代號 DEMO.PENNY：價極低、波幅大、教學標籤「極高風險」。正確練習係寫風險筆記，建議紙上權重 = 0。",
      },
    ],
    riskNotesZh: [
      "分類只係學習標籤，唔係保證回報等級。",
      "「平」唔等於抵；仙股最危險嘅往往係以為自己執到寶。",
    ],
    quiz: [
      {
        questionZh: "對新手核心學習倉，邊類通常較適合對照？",
        optionsZh: ["仙股", "廣基指數 ETF", "冇成交嘅細價股"],
        answerIndex: 1,
        explainZh: "廣基 ETF 較易學分散同再平衡；仙股係反例教材。",
      },
      {
        questionZh: "仙股三大紅旗（教材）唔包括？",
        optionsZh: ["低流動性", "資訊不透明／炒作嫌疑", "一定穩陣因為平"],
        answerIndex: 2,
        explainZh: "「平所以穩」係謬誤；平可以更加危險。",
      },
    ],
    cantoneseTipZh: "分類係地圖，唔係藏寶圖。",
  },

  "hk-2-1": {
    conceptsZh: [
      "市價盤：以當時可成交價盡快成交——速度優先，價格較難精準控制。",
      "限價盤：指定可接受價位——價格有界線，但唔保證一定成交。",
      "流動性差或波動大時，市價盤可能出現滑價；限價盤可能一直掛住唔成。",
      "「成交唔保証」係重要心態：你嘅計劃要預留「買唔到／賣唔出」情況。",
    ],
    examples: [
      {
        market: "HK",
        titleZh: "限價練習情境",
        bodyZh:
          "你想用示範價附近買 2800.HK，但只肯喺 ≤18.90 成交：掛限價 18.90。若市價一路高於 18.90，你可能全日都買唔到——呢個唔係系統故障，而係限價嘅特性。",
      },
      {
        market: "US",
        titleZh: "大型股市價盤",
        bodyZh:
          "AAPL 等大型美股通常差價較窄，市價盤滑價相對細（仍非零）。細型／低流動性股份就完全唔同故事。",
      },
    ],
    riskNotesZh: [
      "開市／收市競價、停牌復牌時段，價格行為可以好極端。",
      "紙上練習用單一示範價，忽略咗真實盤口深度——唔好過度自信。",
    ],
    quiz: [
      {
        questionZh: "限價盤最大特點係？",
        optionsZh: [
          "一定即時成交",
          "可控制價格上／下限，但不保證成交",
          "冇手續費",
        ],
        answerIndex: 1,
        explainZh: "限價換取價格控制，代價係可能不成交。",
      },
    ],
    cantoneseTipZh: "想快用市價，想準用限價——兩者都要付代價。",
  },

  "hk-2-2": {
    conceptsZh: [
      "港股買賣常涉及：經紀佣金、交易徵費、交收費、印花稅等（名目同費率會變，以官方／券商為準）。",
      "印花稅按成交金額計算，短線頻密買賣會明顯侵蝕利潤。",
      "教學計法：粗略把「來回成本」當成要超過先算「紙上打和」。",
      "美股費用結構唔同（常見以佣金／匯兌為主）；唔好套用港股印花稅直覺去美股。",
    ],
    examples: [
      {
        market: "HK",
        titleZh: "粗略成本示範",
        bodyZh:
          "假設紙上買入港股名義金額 HKD 50,000，再以相同金額賣出。就算未計滑價，印花稅＋各項徵費＋佣金都可能吃掉可觀百分比——短炒要先問：「費用准唔准你贏？」",
      },
      {
        market: "US",
        titleZh: "匯率亦係成本",
        bodyZh:
          "港人買美股，來回仲有港幣⇄美元匯差同可能嘅兌換費。帳面 USD 賺咗，換回 HKD 都可能縮水。",
      },
    ],
    riskNotesZh: [
      "費率會改；課堂數字只係概念，唔係報價單。",
      "忽略成本係新手紙上賺、真倉蝕嘅常見原因。",
    ],
    quiz: [
      {
        questionZh: "點解短炒特別怕交易成本？",
        optionsZh: [
          "因為短炒冇風險",
          "因為頻密買賣令費用／稅項疊加，侵蝕利潤",
          "因為印花稅只收一次終身",
        ],
        answerIndex: 1,
        explainZh: "次數愈多，固定／比例成本愈易食晒優勢。",
      },
    ],
    cantoneseTipZh: "未計費用嘅「贏」唔好当真贏。",
  },

  "hk-3-1": {
    conceptsZh: [
      "倉位大小：決定一筆想法最多輸幾多，而唔係「我覺得會升就 All-in」。",
      "常用框架：每筆風險 ≤ 資本嘅 0.5%–2%（紙上練習建議偏保守）。",
      "分散：唔把命運押喺單一公司／單一主題；但過度分散又會變得無重點。",
      "風險金額 ≈ 資本 × 風險%；股數 ≈ 風險金額 ÷ 每股止損距離。",
    ],
    examples: [
      {
        market: "HK",
        titleZh: "紙上倉位一題",
        bodyZh:
          "紙上本金 HKD 100,000，每筆風險 1% → 最多輸 HKD 1,000。若入場示範價 100、止損距離 5%（即每股風險 5），則約可買 200 股。呢個係框架練習，唔係建議你買邊隻。",
      },
      {
        market: "US",
        titleZh: "美股同理",
        bodyZh:
          "用 USD 紙上本金一樣計；注意匯率會令「以港幣計嘅總風險」浮動。",
      },
    ],
    riskNotesZh: [
      "止損距離估錯、缺口跳空，真實虧損可以大過紙上假設。",
      "分散唔等於買一堆仙股——質素同相關性好重要。",
    ],
    quiz: [
      {
        questionZh: "All-in 單一股份最主要問題係？",
        optionsZh: [
          "一定賺最多",
          "單一事件可以大幅損害整體資本",
          "手續費會變零",
        ],
        answerIndex: 1,
        explainZh: "集中風險可以一次過破壞學習／資金紀律。",
      },
    ],
    cantoneseTipZh: "先定可以輸幾多，再倒推買幾多。",
  },

  "hk-3-2": {
    conceptsZh: [
      "複盤唔係預測頂底，而係檢查：論點仲在唔在、有冇超風險、有冇情緒偏離計劃。",
      "預先寫低檢討日同離場條件，比「睇住先」更有紀律。",
      "論點失效（基本面／估值假設崩壞）同「價錢暫時唔舒服」要分開處理。",
      "學習清單可以重複使用——投資係過程管理。",
    ],
    examples: [
      {
        market: "HK",
        titleZh: "四條離場／複盤問題",
        bodyZh:
          "1）原定學習論點仲成立嗎？2）紙上倉位有冇超過上限？3）係咪因為短期漲跌而改口？4）預設檢討日到未？",
      },
      {
        market: "BOTH",
        titleZh: "示範想法複盤",
        bodyZh:
          "喺「學習想法」頁揀一條 ETF 示範想法，寫低一週後複盤筆記：價格變動、你嘅情緒、有冇想加倉／斬倉——对照規則而唔係感覺。",
      },
    ],
    riskNotesZh: [
      "無保證回報；複盤做得好都唔保證賺錢。",
      "唔好用複盤合理化「移動止損去等返本」而無視風險上限。",
    ],
    quiz: [
      {
        questionZh: "複盤嘅主要目的係？",
        optionsZh: [
          "準確預測明日高低位",
          "檢查論點、風險同紀律有冇偏離",
          "證明自己一定啱",
        ],
        answerIndex: 1,
        explainZh: "複盤係過程質素檢查，唔係占卜。",
      },
    ],
    cantoneseTipZh: "寫低先算數；唔好靠事後聰明。",
  },

  "us-1-1": {
    conceptsZh: [
      "美股主要交易所包括 NYSE、Nasdaq；常規交易時段美東 9:30–16:00。",
      "夏令時間（DST）會令香港對照時間改變——每年記得更新自己嘅換算。",
      "盤前／盤後可以成交，但流動性同波幅往往較大，唔適合當「常規」學習預設。",
      "美股假期同港股唔完全重疊；有時一邊休市一邊開。",
    ],
    examples: [
      {
        market: "US",
        titleZh: "時差換算練習",
        bodyZh:
          "寫低：美東 9:30 開市 = 你所在地幾點？冬令同夏令各寫一版。呢個練習減少「以為仲開住市」嘅誤會。",
      },
      {
        market: "HK",
        titleZh: "港美交接",
        bodyZh:
          "港股收市後，美股可能正開市；隔夜美股消息可以影響翌日港股開市氣氛——紙上持倉都要意識隔夜。",
      },
    ],
    riskNotesZh: [
      "盤前盤後報價唔好當全日流動性指標。",
      "時差令你更難即時反應——倉位更要預留缺口風險。",
    ],
    quiz: [
      {
        questionZh: "美股常規時段（美東）係？",
        optionsZh: ["24 小時不停", "約 9:30–16:00", "只週末開市"],
        answerIndex: 1,
        explainZh: "常規時段約美東 9:30–16:00；另有延長時段。",
      },
    ],
    cantoneseTipZh: "做美股，時鐘同日曆同報價一樣重要。",
  },

  "us-1-2": {
    conceptsZh: [
      "美股多數以「股」為單位，唔使好似港股咁先湊「手」（仍要留意券商最少下單限制）。",
      "Bid（買盤）／Ask（賣盤）差價係即時交易成本之一。",
      "大型股通常深度較好；細型股／低價股可以差價闊、滑價大。",
      "報價小數位習慣同港股唔同，但讀法一樣：最後價、升跌、成交量。",
    ],
    examples: [
      {
        market: "US",
        titleZh: "大型股報價筆記",
        bodyZh:
          "揀 AAPL 或 MSFT：記錄示範 last、change%、粗略感受 bid/ask 是否緊窄。對照一隻細型示範（若有）會更明白流動性差異。",
      },
      {
        market: "HK",
        titleZh: "手 vs 股",
        bodyZh:
          "港股買 0700 可能要按手數；美股買 10 股 AAPL 通常可行。紙上模擬兩邊都要標示單位同貨幣。",
      },
    ],
    riskNotesZh: [
      "睇到「可以買 1 股」唔等於應該重倉。",
      "差價闊等於隱形手續費。",
    ],
    quiz: [
      {
        questionZh: "Bid/Ask 差價主要反映？",
        optionsZh: ["公司盈利", "即時買賣盤距離／流動性成本", "印花稅率"],
        answerIndex: 1,
        explainZh: "差價愈闊，來回摩擦成本愈高。",
      },
    ],
    cantoneseTipZh: "單位不同，風險算法同一個：先計可輸幾多。",
  },

  "us-2-1": {
    conceptsZh: [
      "指數 ETF 追蹤一籃子（如標普 500 相關 ETF），適合學核心配置。",
      "要睇：費用率（expense ratio）、追蹤誤差、成交量／溢價折價。",
      "「核心＋衛星」：核心用廣基 ETF，衛星先用細比例學主題／個股——紙上亦適用。",
      "ETF 唔等於無風險；市場跌，ETF 一樣跌。",
    ],
    examples: [
      {
        market: "US",
        titleZh: "VOO 示範",
        bodyZh:
          "VOO 係廣基 S&P 500 ETF 示範標的。學習想法引擎會畀較高紙上權重建議，係因為分散度，而唔係保證升。",
      },
      {
        market: "HK",
        titleZh: "對照盈富",
        bodyZh:
          "2800.HK 係港股側嘅指數型工具對照。兩邊都用嚟學「一籃子 vs 單一股票」。",
      },
    ],
    riskNotesZh: [
      "主題型／槓桿型 ETF 風險結構可以完全唔同——新手課程先聚焦廣基。",
      "費用看似細，長期複利影響大。",
    ],
    quiz: [
      {
        questionZh: "廣基指數 ETF 相對單一股票嘅學習優點？",
        optionsZh: [
          "一定跑贏個股",
          "較易練習分散同再平衡概念",
          "唔會下跌",
        ],
        answerIndex: 1,
        explainZh: "重點係分散教學，唔係保證績效。",
      },
    ],
    cantoneseTipZh: "核心倉學穩定規則，衛星倉先學好奇心。",
  },

  "us-2-2": {
    conceptsZh: [
      "ADR（American Depositary Receipt）：用美元喺美國市場交易外國公司相關權益嘅憑證。",
      "ADR 同本地上市股份可以有價格／流動性／費用結構差異，唔好假設完全一樣。",
      "仲有匯率層：公司業績貨幣 vs 你持有嘅美元報價。",
      "課堂目標係「識得係咩」，唔係教你點樣套利。",
    ],
    examples: [
      {
        market: "US",
        titleZh: "概念句",
        bodyZh:
          "一句記住：ADR 讓你用美元帳戶接觸外國公司，但中間有存託、費用同匯率層。",
      },
      {
        market: "HK",
        titleZh: "雙重上市對照",
        bodyZh:
          "有啲公司同時有港股同美國相關產品；價錢可以短暫偏離。教學上觀察即可，唔好幻想無風險套利。",
      },
    ],
    riskNotesZh: [
      "額外結構複雜度＝額外誤解空間。",
      "唔好只因為「美國上市」就當成更安全。",
    ],
    quiz: [
      {
        questionZh: "ADR 最貼切描述係？",
        optionsZh: [
          "美國政府擔保嘅債券",
          "方便以美元交易外國公司相關權益嘅憑證",
          "一定同本地股價分秒同步",
        ],
        answerIndex: 1,
        explainZh: "ADR 係存託憑證結構，唔係保證同步或無風險。",
      },
    ],
    cantoneseTipZh: "識結構先於追價錢。",
  },

  "us-3-1": {
    conceptsZh: [
      "持有美股：回報同時受股價同美元匯率影響（以港幣計）。",
      "隔夜跳空：你瞓覺期間美股可因消息大幅低開／高開。",
      "利率、通脹、就業等美國宏觀數據時段，波動可以突然放大。",
      "紙上風險上限要用「最壞合理情景」估，而唔係最好情景。",
    ],
    examples: [
      {
        market: "US",
        titleZh: "匯率影響回報",
        bodyZh:
          "股價以 USD 計不變，但美元兌港元貶值 → 你換回 HKD 嘅購買力下跌。相反升值就幫你。學習組合要同時記兩條線。",
      },
      {
        market: "BOTH",
        titleZh: "隔夜風險清單",
        bodyZh:
          "開倉前寫：有冇即將公布嘅大事？我可否接受缺口？紙上倉位有冇細到就算跳空都唔破風險上限？",
      },
    ],
    riskNotesZh: [
      "匯率對沖係進階課題；新手先意識到存在即可。",
      "「放過夜」本身係風險選擇，唔係必須。",
    ],
    quiz: [
      {
        questionZh: "美股紙上賺 5%，換算港幣一定賺 5%？",
        optionsZh: [
          "一定係",
          "唔一定，仲受匯率同兌換成本影響",
          "港幣結算所以無匯率",
        ],
        answerIndex: 1,
        explainZh: "跨貨幣持倉要計匯率。",
      },
    ],
    cantoneseTipZh: "股價一條線，匯率另一條——兩條都要睇。",
  },

  "us-3-2": {
    conceptsZh: [
      "紙上組合（模擬投資）：用虛擬現金記錄買／賣，練習紀律同倉位，唔連接券商。",
      "要記錄：標的、方向、股數、價、貨幣、時間、筆記；之後用最新報價標記市值同盈虧。",
      "一週後複盤：對照當初論點同風險 %，而唔係只睇賺蝕顏色。",
      "模擬賺咗 ≠ 真倉會賺；模擬最有價值係暴露你嘅壞習慣。",
    ],
    examples: [
      {
        market: "US",
        titleZh: "示範流程",
        bodyZh:
          "1）設定紙上 USD 本金 2）由想法或市場頁揀 VOO 3）按風險 % 計股數 4）喺模擬頁買入 5）七日前寫複盤日。",
      },
      {
        market: "HK",
        titleZh: "港美分帳",
        bodyZh:
          "系統分開 HKD／USD 虛擬現金；唔好心理上把兩邊現金「隨意混用」而唔覺匯率。",
      },
    ],
    riskNotesZh: [
      "模擬標示「模擬／學習用」；唔係真實資產。",
      "投資有風險，內容僅供學習。",
    ],
    quiz: [
      {
        questionZh: "模擬投資最應該訓練咩？",
        optionsZh: [
          "保證每月回報",
          "倉位、紀律同複盤習慣",
          "複製貼上貼士群消息",
        ],
        answerIndex: 1,
        explainZh: "教育目標係過程，唔係虛擬分數。",
      },
    ],
    cantoneseTipZh: "模擬頁係健身房，唔係提款機。",
  },
};

export function getLessonContent(lessonId: string): InvestLessonContent | null {
  return LESSON_CONTENT[lessonId] ?? null;
}
