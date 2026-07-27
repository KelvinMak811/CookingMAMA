export interface ExerciseMediaEntry {
  youtubeId: string;
  titleZh: string;
  stepsZh: string[];
}

const LIBRARY: { pattern: RegExp; entry: ExerciseMediaEntry }[] = [
  {
    pattern: /squat|深蹲|sit-to-stand|椅子/i,
    entry: {
      youtubeId: "aclHkVaku9U",
      titleZh: "深蹲姿勢教學",
      stepsZh: [
        "腳掌與肩同寬，腳尖微微向外。",
        "挺胸收腹，想像坐向身後椅子。",
        "膝頭方向跟腳尖一致，唔好內夾。",
        "蹲到大腿大概平行或你舒服嘅深度就停。",
        "用腳跟推地站起，全程保持核心穩定。",
      ],
    },
  },
  {
    pattern: /push-up|伏地挺身|press-up|wall push/i,
    entry: {
      youtubeId: "Eh00_rniF8E",
      titleZh: "牆身 / 斜板伏地挺身",
      stepsZh: [
        "雙手放牆或枱面，與肩同寬。",
        "身體成一直線，由頭到腳跟。",
        "慢慢屈手肘向牆靠近，手肘約 45 度。",
        "推返去時呼氣，唔好塌腰。",
        "感到肩膊或手腕不適就減少幅度。",
      ],
    },
  },
  {
    pattern: /row|划船|pull/i,
    entry: {
      youtubeId: "GZbfZ033f74",
      titleZh: "彈力帶 / 划船動作概念",
      stepsZh: [
        "企穩，腰背中立，唔好聳肩。",
        "手肘向後拉，想像夾緊腋下嘅筆。",
        "肩胛骨先動，再帶動手肘。",
        "慢慢放回，保持張力。",
        "全程用背肌發力，唔好用頸力。",
      ],
    },
  },
  {
    pattern: /walk|步行|brisk/i,
    entry: {
      youtubeId: "nJEHL6X4Bg0",
      titleZh: "快走帶氧",
      stepsZh: [
        "熱身 3 分鐘慢步行。",
        "加快步速至仍可講短句。",
        "擺臂自然，視線向前。",
        "保持呼吸節奏，唔好憋氣。",
        "最後 3 分鐘放慢做收操。",
      ],
    },
  },
  {
    pattern: /bridge|臀橋|glute/i,
    entry: {
      youtubeId: "wPM8icPu6H8",
      titleZh: "臀橋",
      stepsZh: [
        "仰卧屈膝，腳掌貼地。",
        "收腹，將骨盆向上推。",
        "頂峰時夾臀 1-2 秒。",
        "慢慢放下，唔好塌腰。",
        "頸部放鬆，唔好用力頂起。",
      ],
    },
  },
  {
    pattern: /plank|平板|bird dog|dead bug|核心/i,
    entry: {
      youtubeId: "pSHjTRCQxIw",
      titleZh: "核心穩定基礎",
      stepsZh: [
        "先找到中立骨盆，唔好過度拱背或塌腰。",
        "動作要慢，幅度細過快。",
        "呼氣時用力，吸氣時保持穩定。",
        "若腰痠，減少停留時間或改膝蓋版。",
        "質量優先於次數。",
      ],
    },
  },
  {
    pattern: /stretch|伸展|mobility|活動度|熱身|pilates/i,
    entry: {
      youtubeId: "McDFNXvWriQ",
      titleZh: "熱身與伸展",
      stepsZh: [
        "由細關節到大關節活動：踝、膝、髖、肩。",
        "每個伸展 20-30 秒，唔拉到痛。",
        "配合呼吸，唔好彈震式拉筋。",
        "久坐人士可加開胸同髖屈肌伸展。",
        "訓練後再做一次會更舒服。",
      ],
    },
  },
  {
    pattern: /足球|football|soccer/i,
    entry: {
      youtubeId: "Zv8oG2Qp5kE",
      titleZh: "足球體能基礎（控球同腳步）",
      stepsZh: [
        "5 分鐘慢跑同動態拉筋。",
        "原地傳波或牆傳，專注腳內側觸球。",
        "繞樁或左右腳交替帶球。",
        "短距離加速跑 4-6 組，組間充分休息。",
        "收操拉伸大腿同小腿。",
      ],
    },
  },
  {
    pattern: /游泳|swim/i,
    entry: {
      youtubeId: "pFNlJ1zM9Zc",
      titleZh: "游泳前後熱身與技術提示",
      stepsZh: [
        "下水前先活動肩關節同旋轉肌群。",
        "由輕鬆游開始，唔好一落水就搏盡。",
        "注意呼吸節奏，唔好長時間憋氣。",
        "技術日可分段練划水同打腿。",
        "上岸後保暖同補充水分。",
      ],
    },
  },
  {
    pattern: /bike|單車|cycle/i,
    entry: {
      youtubeId: "ml6cT4AZdqI",
      titleZh: "單車帶氧節奏",
      stepsZh: [
        "坐墊高度大概髖關節水平。",
        "先 5 分鐘輕阻力熱身。",
        "維持可對話強度 15-30 分鐘。",
        "保持踏頻平穩，唔好突然大力踩。",
        "結束前 3 分鐘減阻力收操。",
      ],
    },
  },
];

const FALLBACK: ExerciseMediaEntry = {
  youtubeId: "y_wVYXmfJrk",
  titleZh: "新手全身訓練參考",
  stepsZh: [
    "先完成 5-10 分鐘熱身。",
    "每個動作專注姿勢，唔追重量。",
    "組間休息 60-90 秒。",
    "感到刺痛或暈眩立即停止。",
    "記低完成度，下週再微調。",
  ],
};

export function matchExerciseMedia(label: string): ExerciseMediaEntry {
  for (const row of LIBRARY) {
    if (row.pattern.test(label)) return row.entry;
  }
  return FALLBACK;
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
}
