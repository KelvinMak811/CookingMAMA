/** Helpers shared by rich packs */
export const v = (ja, reading, meaningZh, romaji) => ({
  ja,
  reading,
  meaningZh,
  ...(romaji ? { romaji } : {}),
});
export const e = (ja, reading, meaningZh) => ({ ja, reading, meaningZh });

export function pack(vocab, examples, tipsZh, practiceZh, cultureTipsZh = []) {
  return { vocab, examples, tipsZh, practiceZh, cultureTipsZh };
}
