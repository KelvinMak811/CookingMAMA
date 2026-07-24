import fs from "fs";
import path from "path";

const dir = "src/data/recipes";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "index.ts");
const recipes = [];

for (const f of files) {
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  const chunks = t.split(/\{\s*id:\s*/).slice(1);
  for (const c of chunks) {
    const id = (c.match(/^["']([^"']+)["']/) || [])[1];
    const name = (c.match(/name:\s*["']([^"']+)["']/) || [])[1];
    const block = (c.match(/ingredients:\s*\[([\s\S]*?)\]/) || [])[1] || "";
    const ings = [...block.matchAll(/name:\s*["']([^"']+)["']/g)].map((m) => m[1]);
    if (id && name) recipes.push({ id, name, ings, hay: [name, ...ings].join(" ") });
  }
}

console.log("recipes", recipes.length);
function count(pred) {
  return recipes.filter((r) => pred(r.hay)).length;
}

const beef = (r) => {
  const h = r.replace(/牛油果?/g, "").replace(/牛肉清湯/g, "牛");
  return /牛/.test(h);
};
const pork = (r) =>
  /豬|猪|五花腩|排骨|一字排|臘腸|培根|烟肉|煙肉|火腿|意式香肠|意式香腸/.test(r);
const chicken = (r) => {
  const h = r.replace(/雞[蛋]|鸡蛋|皮蛋|鹹蛋|咸蛋|蛋黃/g, "");
  return /雞|鸡/.test(h);
};
const seafood = (r) =>
  /魚(?!膠)|虾|蝦|蟹|魷|鱿|蜆|蚬|帶子|扇貝|青口|龍蝦|龙虾|三文|石斑|鱸|鲭|鯖|海鮮|海鲜|明太子/.test(
    r
  );
const egg = (r) =>
  /雞蛋|鸡蛋|蛋黃|皮蛋|鹹蛋|咸蛋|生食級雞蛋/.test(r) || /炒蛋|蒸蛋|蛋液/.test(r);
const tofu = (r) => /豆腐/.test(r);

console.log({
  beef: count(beef),
  pork: count(pork),
  chicken: count(chicken),
  seafood: count(seafood),
  egg: count(egg),
  tofu: count(tofu),
});

const vegs = {
  菜心: /菜心/,
  通菜: /通菜|水菜/,
  番茄: /番茄|车厘茄|車厘茄/,
  洋葱: /洋蔥|洋葱/,
  茄子: /茄子/,
  西兰花: /西蘭花|西兰花/,
  芽菜: /芽菜/,
  薯仔: /薯仔|马铃薯|馬鈴薯/,
  菇: /蘑菇|金針菇|香菇|冬菇|草菇|雜菌|鲜蘑菇/,
  甘笋: /甘筍|甘笋/,
  芥兰: /芥蘭|芥兰/,
  凉瓜: /涼瓜|凉瓜/,
  芦笋: /蘆筍|芦笋/,
  青瓜: /青瓜/,
  椰菜: /椰菜/,
  西芹: /西芹/,
  椒: /青椒|紅椒|三色椒|青紅椒/,
  荷兰豆: /荷蘭豆|荷兰豆/,
  生菜: /生菜/,
  时菜: /時菜|白菜/,
  苋菜: /莧菜|苋菜/,
  韭黄: /韭黃|韭黄/,
};
for (const [k, re] of Object.entries(vegs)) console.log(k, count((h) => re.test(h)));
