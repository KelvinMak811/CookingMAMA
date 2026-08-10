/** Expand seed into rich pack — no fake vocab padding */
import { v, e, pack } from "./helpers.mjs";

export function expand(seed, extras = {}) {
  const dedupe = (arr, keyFn) => {
    const seen = new Set();
    const out = [];
    for (const item of arr) {
      const k = keyFn(item);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(item);
    }
    return out;
  };

  const vocab = dedupe(
    [...(extras.vocab || []), ...(seed.vocab || [])],
    (x) => `${x.ja}::${x.reading}`
  );
  const examples = dedupe(
    [...(extras.examples || []), ...(seed.examples || [])],
    (x) => `${x.ja}::${x.reading}`
  );
  let tipsZh = [...(extras.tipsZh?.length ? extras.tipsZh : seed.tipsZh || [])];
  let practiceZh = [...(extras.practiceZh?.length ? extras.practiceZh : seed.practiceZh || [])];
  let cultureTipsZh = [...(extras.cultureTipsZh || seed.cultureTipsZh || [])];

  const tipPads = [
    "記新詞一定要同時記讀法；默寫時標假名，唔好只寫漢字。",
    "例句要出聲讀；モーラ節拍錯咗，聽力同口語都會受影響。",
    "出錯寫低原因：助詞／時態／讀音／近義辨析。",
    "同類詞放一組記（推量／傳聞／樣態），考試唔易混。",
    "複習節奏：當日→三日後→一週後，短頻勝過一次背晒。",
    "造句用自己生活場景，記憶會深過背例句。",
  ];
  const pracPads = [
    "遮住意思只讀日文，再講粵語意思。",
    "遮住日文只睇意思，默寫並標讀法。",
    "用本課五個詞寫 80 字短文或對話。",
    "計時兩分鐘讀晒本課例句。",
    "第二日唔睇筆記，默寫三個最難詞＋一個例句。",
    "同學互考：你問答，交換角色。",
  ];
  let i = 0;
  while (tipsZh.length < 6) tipsZh.push(tipPads[i++ % tipPads.length]);
  i = 0;
  while (practiceZh.length < 5) practiceZh.push(pracPads[i++ % pracPads.length]);
  if (!cultureTipsZh.length) {
    cultureTipsZh.push("出聲朗讀係日語學習核心；靠口耳記節奏比淨眼記穩。");
  }

  if (vocab.length < 12 || examples.length < 5) {
    throw new Error(
      `Thin pack: vocab=${vocab.length} examples=${examples.length} — add extras`
    );
  }

  return pack(
    vocab.slice(0, 18),
    examples.slice(0, 7),
    tipsZh.slice(0, 7),
    practiceZh.slice(0, 6),
    cultureTipsZh.slice(0, 2)
  );
}

export function V(rows) {
  return rows.map(([ja, reading, meaningZh, romaji]) =>
    romaji ? v(ja, reading, meaningZh, romaji) : v(ja, reading, meaningZh)
  );
}
export function E(rows) {
  return rows.map(([ja, reading, meaningZh]) => e(ja, reading, meaningZh));
}
