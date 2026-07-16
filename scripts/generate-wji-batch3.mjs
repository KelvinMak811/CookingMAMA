import { writeFileSync } from "fs";

const SKIP = new Set(["滑蛋雞肉丼", "滑蛋雞肉丼 (親子丼)", "親子丼"]);

function parseIngredients(raw, prefix, num) {
  return raw
    .split("、")
    .map((part) => {
      const m = part.trim().match(/^(.+?)\s+(.+)$/);
      if (m) return { name: m[1].trim(), amount: m[2].trim() };
      return { name: part.trim(), amount: "適量" };
    })
    .map((ing, i) => ({ id: `${prefix}${num}-${i + 1}`, ...ing }));
}

function emitFile(filePath, exportName, cuisine, prefix, startId, recipes) {
  const toAdd = recipes.filter((r) => !SKIP.has(r.name) && !r.name.includes("親子丼"));
  let idNum = startId;
  const lines = [
    'import type { Recipe } from "@/types";',
    "",
    `/** ${cuisine} 人氣菜式第三批 */`,
    `export const ${exportName}: Recipe[] = [`,
  ];

  for (const r of toAdd) {
    const id = `${prefix}-${idNum}`;
    const ings = parseIngredients(r.ingredients, prefix.replace("-", ""), idNum);
    lines.push("  {");
    lines.push(`    id: "${id}",`);
    lines.push(`    name: ${JSON.stringify(r.name)},`);
    lines.push(`    cuisine: "${cuisine}",`);
    lines.push(`    baseServings: ${r.servings},`);
    lines.push(`    description: ${JSON.stringify(r.desc)},`);
    lines.push(`    difficulty: ${r.difficulty},`);
    lines.push(`    prepTime: ${r.prepTime},`);
    lines.push(`    imageUrl: "",`);
    lines.push("    ingredients: [");
    for (const ing of ings) {
      lines.push(
        `      { id: ${JSON.stringify(ing.id)}, name: ${JSON.stringify(ing.name)}, amount: ${JSON.stringify(ing.amount)} },`
      );
    }
    lines.push("    ],");
    lines.push("    steps: [");
    for (const step of r.steps) {
      lines.push(`      ${JSON.stringify(step)},`);
    }
    lines.push("    ],");
    lines.push("  },");
    idNum++;
  }

  lines.push("];");
  lines.push("");
  writeFileSync(filePath, lines.join("\n"), "utf8");
  return { added: toAdd.length, from: startId, to: idNum - 1 };
}

const western = [
  { name: "蟹肉牛油果水管麵", servings: 2, difficulty: 2, prepTime: 20, desc: "清新不膩，蟹肉鮮甜配上牛油果的軟滑。", ingredients: "水管麵 200克、罐頭蟹肉 100克、牛油果 1個、車厘茄 10粒、蒜蓉 1茶匙、檸檬汁 1湯匙", steps: ["水管麵按包裝指示煮熟備用。", "牛油果切粒；車厘茄切半。", "鑊中下橄欖油爆香蒜蓉，加入車厘茄炒軟。", "加入蟹肉、水管麵及牛油果粒拌勻，下檸檬汁、鹽及黑椒調味即成。"] },
  { name: "法式洋蔥湯", servings: 2, difficulty: 3, prepTime: 45, desc: "焦糖化的洋蔥帶來極致甜味，配上芝士法包焗製。", ingredients: "洋蔥 3個、牛油 30克、牛肉清湯 500毫升、法包 2片、水牛芝士碎 適量、百里香 1支", steps: ["洋蔥切幼絲。", "鍋中下牛油，中小火將洋蔥絲慢炒30分鐘至深啡色焦糖化。", "倒入牛肉清湯及百里香，慢火熬煮15分鐘。", "湯盛入烤碗，放上法包片並撒滿芝士，入焗爐200度焗至芝士金黃即成。"] },
  { name: "慢煮手撕豬肉漢堡", servings: 4, difficulty: 4, prepTime: 120, desc: "惹味美式BBQ風味，肉質軟腍入味。", ingredients: "豬梅頭肉 500克、BBQ醬 4湯匙、蘋果醋 1湯匙、漢堡麵包 4個、紫椰菜絲 適量", steps: ["豬肉表面抹上鹽、黑椒及少許紅椒粉。", "放入慢煮袋或高壓鍋，加入BBQ醬和蘋果醋，慢煮至肉質軟爛。", "用兩隻叉將豬肉撕成絲，拌入鍋中剩餘的醬汁。", "漢堡包烘熱，夾入紫椰菜絲及手撕豬肉即成。"] },
  { name: "伯爵茶戚風蛋糕", servings: 6, difficulty: 3, prepTime: 60, desc: "Cafe 常見的輕盈甜品，茶香撲鼻。", ingredients: "雞蛋 3隻、低筋麵粉 50克、糖 50克、植物油 30克、牛奶 40毫升、伯爵茶包 2個", steps: ["牛奶加熱，浸泡茶包出味並剪開一個茶包取茶葉碎。", "蛋黃加植物油及伯爵茶奶拌勻，篩入麵粉拌至無粉粒。", "蛋白分次加糖打發至企身，分次輕力拌入蛋黃糊。", "倒入戚風模具，160度焗35分鐘，出爐倒扣放涼後脫模即成。"] },
  { name: "香煎三文魚伴蘆筍", servings: 2, difficulty: 2, prepTime: 20, desc: "健康高蛋白之選，魚皮香脆肉質嫩滑。", ingredients: "三文魚柳 2塊、蘆筍 1把、檸檬 半個、牛油 10克、鹽及黑椒 適量", steps: ["三文魚印乾水分，撒鹽和黑椒醃製。蘆筍切去尾部硬梗。", "熱鑊下油，魚皮朝下中火煎4分鐘至金黃香脆。", "翻面再煎2分鐘，同時在鑊邊加入牛油和蘆筍同煎。", "蘆筍熟透後上碟，擠上檸檬汁即成。"] },
];

const japanese = [
  { name: "滑蛋雞肉丼 (親子丼)", servings: 1, difficulty: 2, prepTime: 15, desc: "經典日式家常菜，雞肉鮮嫩，蛋汁拌飯一流。", ingredients: "雞髀肉 100克、雞蛋 2隻、洋蔥 半個、高湯 50毫升、醬油 1湯匙、味醂 1湯匙、白飯 1碗", steps: ["雞肉切一口大小；洋蔥切絲。", "小鍋中加入高湯、醬油、味醂和洋蔥煮滾。", "加入雞肉煮熟。", "雞蛋輕輕打散，均勻淋入鍋中，加蓋焗30秒至半熟，倒在白飯上即成。"] },
  { name: "日式牛肉烏冬", servings: 1, difficulty: 1, prepTime: 15, desc: "湯底清甜，肥牛惹味，暖胃首選。", ingredients: "讚岐烏冬 1個、肥牛片 100克、昆布柴魚高湯 300毫升、醬油 1湯匙、味醂 1湯匙、蔥花 適量", steps: ["肥牛片用熱水略燙去血水備用。", "鍋中加入高湯、醬油和味醂煮滾。", "放入烏冬煮散。", "放上肥牛片略煮，盛起撒上蔥花即成。"] },
  { name: "冰花煎餃", servings: 2, difficulty: 2, prepTime: 20, desc: "居酒屋必點，底部帶有一層薄脆的冰花。", ingredients: "日式餃子 10隻、麵粉 1茶匙、水 50毫升、油 1湯匙", steps: ["麵粉與水拌勻成麵粉水備用。", "平底鑊下油，排好餃子，中火煎1分鐘至底部微黃。", "倒入麵粉水，加蓋轉小火焗5-8分鐘至水分收乾。", "打開蓋，煎至底部形成金黃酥脆的冰花，倒扣上碟即成。"] },
  { name: "大坂燒", servings: 2, difficulty: 2, prepTime: 25, desc: "豐富的高麗菜配上惹味醬汁和木魚花。", ingredients: "椰菜 1/4個、豬肉片 50克、雞蛋 1隻、低筋麵粉 50克、水 50毫升、大坂燒醬 適量、蛋黃醬 適量、木魚花 適量", steps: ["椰菜切碎；麵粉、水和雞蛋拌勻成粉漿。", "將椰菜碎拌入粉漿中。", "平底鑊下油，倒入粉漿攤平成圓餅，鋪上豬肉片，中火煎5分鐘。", "翻面再煎5分鐘至熟透，塗上大坂燒醬和蛋黃醬，撒上木魚花即成。"] },
  { name: "抹茶鮮奶麻糬", servings: 2, difficulty: 1, prepTime: 15, desc: "煙韌軟糯，不加糯米粉的簡易甜品。", ingredients: "牛奶 200毫升、木薯粉 20克、糖 15克、抹茶粉 適量", steps: ["小鍋中加入牛奶、木薯粉和糖，攪拌至無粉粒。", "開小火，不斷攪拌至液體變得濃稠並成糰狀。", "繼續攪拌至麻糬變得有彈性，熄火。", "將麻糬放涼，表面撒上抹茶粉即成。"] },
];

const italian = [
  { name: "經典肉醬千層麵", servings: 4, difficulty: 4, prepTime: 90, desc: "濃郁肉醬與白汁交織，層次豐富。", ingredients: "千層麵皮 6片、意式肉醬 400克、白汁 (Béchamel) 300克、水牛芝士碎 100克、巴馬臣芝士 適量", steps: ["烤盤底部塗一層薄薄的肉醬。", "鋪上一層麵皮，塗上肉醬，再淋上白汁。", "重複此步驟 3-4 次，頂層鋪滿白汁和水牛芝士碎。", "放入預熱 180 度的焗爐焗 30 分鐘至表面金黃微焦即成。"] },
  { name: "黑松露蘑菇闊條麵", servings: 2, difficulty: 2, prepTime: 20, desc: "闊條麵掛滿濃郁的松露忌廉汁，極致享受。", ingredients: "闊條麵 200克、鮮蘑菇 150克、淡忌廉 100毫升、黑松露醬 1湯匙、蒜蓉 1茶匙、巴馬臣芝士 適量", steps: ["闊條麵按包裝指示煮至 Al Dente。", "鑊中下油爆香蒜蓉，加入切片的蘑菇炒香。", "倒入淡忌廉和少許煮麵水，煮至稍微濃稠。", "加入闊條麵和黑松露醬拌勻，撒上芝士即成。"] },
  { name: "意式香草佛卡夏", servings: 4, difficulty: 3, prepTime: 120, desc: "外脆內軟的意式扁麵包，充滿橄欖油與迷迭香氣。", ingredients: "高筋麵粉 300克、溫水 220毫升、速發酵母 3克、鹽 5克、特級初榨橄欖油 30毫升、新鮮迷迭香 適量、海鹽 適量", steps: ["麵粉、酵母、水和鹽混合均勻，室溫發酵1小時至兩倍大。", "烤盤倒入大量橄欖油，將麵糰放入攤平，再發酵45分鐘。", "在麵糰表面淋上橄欖油，用手指戳出凹洞。", "撒上迷迭香和粗海鹽，220度焗20-25分鐘至金黃即成。"] },
  { name: "海鮮意大利飯", servings: 2, difficulty: 3, prepTime: 40, desc: "飯粒吸滿海鮮精華，鮮味爆發。", ingredients: "意大利米 150克、大蝦 4隻、青口 6隻、魷魚圈 適量、海鮮高湯 500毫升、白酒 50毫升、洋蔥碎 適量", steps: ["鑊中下油炒熟海鮮，盛起備用。", "原鑊爆香洋蔥碎，加入意大利米炒勻。", "倒入白酒煮發揮，然後分次加入熱高湯，不斷攪拌至米粒吸收水分，煮約15分鐘。", "飯粒煮至八成熟時，將海鮮回鑊拌勻，加鹽黑椒調味即成。"] },
  { name: "阿芙佳朵", servings: 1, difficulty: 1, prepTime: 5, desc: "冰火交融的意式經典甜品，做法極簡。", ingredients: "雲呢拿雪糕 1大球、特濃咖啡 (Espresso) 1 Shot (約30毫升)", steps: ["準備一個冰過的玻璃杯。", "放入一大球優質的雲呢拿雪糕。", "沖泡一杯熱騰騰的特濃咖啡。", "享用前將熱咖啡直接淋在雪糕上即成。"] },
];

console.log("western", emitFile("src/data/recipes/western-batch3.ts", "westernBatch3Recipes", "western", "w", 20, western));
console.log("japanese", emitFile("src/data/recipes/japanese-batch3.ts", "japaneseBatch3Recipes", "japanese", "j", 21, japanese));
console.log("italian", emitFile("src/data/recipes/italian-batch3.ts", "italianBatch3Recipes", "italian", "it", 20, italian));
