import { writeFileSync } from "fs";

const SKIP = new Set(["北非蛋", "蒜香辣椒意粉"]);

const western = [
  { name: "牛油果水波蛋多士", servings: 1, difficulty: 2, prepTime: 15, desc: "IG Cafe 必備打卡名物，切開水波蛋一刻超治癒。", ingredients: "Sourdough (酸種麵包) 1塊、牛油果 1個、雞蛋 1隻、白醋 1湯匙、黑椒海鹽 適量、檸檬汁 少許", steps: ["牛油果壓成蓉，加入黑椒、海鹽及檸檬汁拌勻。", "烘脆酸種麵包，鋪上牛油果蓉。", "煲滾水加白醋，用匙羹攪出漩渦，打入雞蛋煮3分鐘成水波蛋。", "將水波蛋放上面包，撒上黑椒即成。"] },
  { name: "班尼迪蛋", servings: 2, difficulty: 4, prepTime: 30, desc: "經典 All Day Breakfast 靈魂，荷蘭醬是精華。", ingredients: "英式鬆餅 1個、雞蛋 2隻、煙肉 2塊、蛋黃 2個、無鹽牛油 80克、檸檬汁 1湯匙", steps: ["隔水加熱蛋黃和檸檬汁，不斷攪拌，慢慢加入融化的牛油打成濃稠荷蘭醬。", "煙肉煎香；英式鬆餅烘脆。", "煮兩隻水波蛋（做法同上）。", "鬆餅放底，疊上煙肉、水波蛋，淋上荷蘭醬即成。"] },
  { name: "蒜香牛油煎肉眼扒", servings: 2, difficulty: 3, prepTime: 20, desc: "完美 Medium Rare，外焦內嫩。", ingredients: "肉眼牛扒 1塊 (約1.5吋厚)、大蒜 3瓣、百里香 2支、牛油 30克、海鹽及黑椒 適量", steps: ["牛扒提早放室溫解凍，印乾水分，兩面撒上海鹽和黑椒。", "燒熱鐵鑊至冒煙，下油，大火煎牛扒每面約1.5分鐘至焦香。", "加入牛油、拍碎的大蒜和百里香，將融化的牛油不斷淋在牛扒上 (Basting) 約1分鐘。", "取出牛扒靜置 (Rest) 5-10分鐘，切片即成。"] },
  { name: "爆漿芝士手打牛肉漢堡", servings: 2, difficulty: 3, prepTime: 25, desc: "肉汁豐富，芝士瀑布效果極佳。", ingredients: "漢堡麵包 2個、免治牛肉 300克、車打芝士 2片、洋蔥 半個、生菜 適量、沙律醬 適量", steps: ["免治牛肉搓成兩個漢堡扒，中間壓微凹，撒鹽和黑椒。", "洋蔥切圈煎香；漢堡麵包烘熱塗沙律醬。", "猛火煎漢堡扒每面2分鐘，翻面後鋪上芝士，加蓋焗融。", "麵包疊上生菜、漢堡扒、洋蔥即成。"] },
  { name: "北非蛋", servings: 2, difficulty: 2, prepTime: 25, desc: "濃郁番茄紅椒醬汁配半熟蛋，沾麵包一流。", ingredients: "雞蛋 3隻、番茄罐頭 1罐、紅椒 1個、洋蔥 半個、孜然粉 1茶匙、紅椒粉 1茶匙", steps: ["洋蔥和紅椒切粒，下鑊炒軟。", "加入番茄罐頭、孜然粉、紅椒粉煮滾，慢火熬10分鐘至濃稠。", "在醬汁中挖三個小洞，打入雞蛋。", "加蓋焗3-5分鐘至蛋白凝固、蛋黃半熟即成。"] },
  { name: "黑松露薯條", servings: 3, difficulty: 1, prepTime: 15, desc: "邪惡小食，松露香氣撲鼻。", ingredients: "急凍薯條 300克、黑松露醬 1湯匙、巴馬臣芝士碎 2湯匙、松露油 1茶匙、鹽 適量", steps: ["薯條用氣炸鍋或油炸至金黃酥脆。", "趁熱將薯條放入大碗。", "加入松露油、黑松露醬、芝士碎和鹽。", "快速拋勻即成。"] },
  { name: "蒜蓉牛油烤龍蝦尾", servings: 2, difficulty: 2, prepTime: 20, desc: "節日慶祝必備，賣相高級。", ingredients: "急凍龍蝦尾 2條、牛油 30克、蒜蓉 1湯匙、番茜碎 適量、檸檬汁 少許", steps: ["龍蝦尾解凍，用剪刀剪開背部硬殼，將蝦肉翻出放在殼上 (Butterfly)。", "融化牛油，拌入蒜蓉、番茜碎和檸檬汁。", "將蒜蓉牛油均勻塗在龍蝦肉上。", "放入預熱200度焗爐烤12-15分鐘至熟透即成。"] },
  { name: "忌廉蘑菇湯", servings: 3, difficulty: 2, prepTime: 25, desc: "濃郁順滑，啖啖蘑菇香。", ingredients: "鮮白蘑菇 300克、洋蔥 半個、淡忌廉 100毫升、雞湯 300毫升、牛油 20克", steps: ["蘑菇切片；洋蔥切碎。", "牛油炒香洋蔥，加入蘑菇炒至軟身出水。", "倒入雞湯煮10分鐘。", "用攪拌棒打成濃湯，加入淡忌廉拌勻，加鹽黑椒調味即成。"] },
  { name: "威靈頓牛柳 (簡易版)", servings: 2, difficulty: 4, prepTime: 45, desc: "酥皮包著蘑菇醬與牛柳，口感層次豐富。", ingredients: "牛柳 2小塊、急凍酥皮 1張、蘑菇 150克、巴馬火腿 4片、芥末醬 適量、蛋液 少許", steps: ["牛柳大火煎封表面，塗上芥末醬放涼。", "蘑菇打碎，白鑊炒乾水分成蘑菇醬。", "酥皮上鋪巴馬火腿、蘑菇醬，放上牛柳捲起包緊。", "表面掃蛋液，𠝹花紋，入200度焗爐焗15-20分鐘即成。"] },
  { name: "焦糖香蕉法式多士", servings: 2, difficulty: 2, prepTime: 15, desc: "邪惡甜品，外脆內軟。", ingredients: "厚切方包 2塊、雞蛋 2隻、牛奶 50毫升、香蕉 1隻、砂糖 2湯匙、牛油 20克", steps: ["雞蛋加牛奶打勻，方包浸泡吸滿蛋液。", "牛油煎香方包至兩面金黃，上碟。", "香蕉切半，表面撒砂糖，用火槍燒成焦糖脆面（或用平底鑊煎香）。", "香蕉放多士上，淋上楓糖漿即成。"] },
];

const japanese = [
  { name: "旋風蛋包飯", servings: 1, difficulty: 4, prepTime: 20, desc: "IG 爆紅打卡菜式，極考驗筷子功。", ingredients: "雞蛋 3隻、白飯 1碗、雞肉粒 50克、洋蔥碎 適量、茄醬 2湯匙", steps: ["炒香洋蔥和雞肉，加入白飯和茄醬炒勻，盛起堆成半球體。", "雞蛋打勻過篩。燒熱平底鑊，下多點油。", "倒入蛋液，用筷子從兩邊往中間夾，慢慢旋轉平底鑊形成旋風紋。", "蛋液半熟時滑到飯面上即成。"] },
  { name: "明太子烏冬", servings: 1, difficulty: 1, prepTime: 10, desc: "零失敗極速料理，忌廉與明太子完美融合。", ingredients: "讚岐烏冬 1個、明太子 1條、淡忌廉 50毫升、牛油 10克、紫菜絲 適量", steps: ["明太子去膜取肉。", "烏冬煮熟瀝乾。", "趁熱將烏冬、淡忌廉、牛油及大部份明太子拌勻。", "上碟，放上剩餘明太子及紫菜絲即成。"] },
  { name: "滑蛋豬扒飯", servings: 1, difficulty: 3, prepTime: 25, desc: "經典日式丼飯，洋蔥汁與滑蛋是靈魂。", ingredients: "炸吉列豬扒 1塊、雞蛋 2隻、洋蔥 半個、日式醬油 2湯匙、味醂 2湯匙、高湯 半杯、白飯 1碗", steps: ["洋蔥切絲。平底小鍋加入高湯、醬油、味醂煮滾。", "放入洋蔥煮軟，放上切件的炸豬扒。", "雞蛋輕輕打散（不要完全打勻），均勻淋在豬扒上。", "加蓋焗30秒至半熟，連汁滑落白飯上即成。"] },
  { name: "壽喜燒牛肉鍋", servings: 2, difficulty: 2, prepTime: 20, desc: "甜甜的醬汁配上高質和牛，沾生蛋汁極佳。", ingredients: "和牛片 200克、大蔥 1條、豆腐 1磚、金針菇 1包、壽喜燒汁 半杯、生食級雞蛋 2隻", steps: ["大蔥切段，下鍋煎出香氣。", "倒入壽喜燒汁煮滾。", "加入豆腐、金針菇煮熟。", "放入和牛片略涮至剛熟，沾生雞蛋液食用。"] },
  { name: "鮭魚茶漬飯", servings: 1, difficulty: 1, prepTime: 15, desc: "溫胃解酒，清淡帶有茶香。", ingredients: "三文魚柳 1小塊、白飯 1碗、玄米茶或綠茶 1杯、白芝麻 適量、紫菜絲 適量、芥末 少許", steps: ["三文魚柳煎熟，拆碎去骨。", "白飯盛入碗中，鋪上三文魚碎。", "撒上白芝麻和紫菜絲。", "淋上熱茶，拌入少許芥末即成。"] },
  { name: "日式薯仔沙律", servings: 4, difficulty: 2, prepTime: 20, desc: "居酒屋必點前菜，口感綿密。", ingredients: "薯仔 2個、青瓜 半條、甘筍 半條、火腿 2片、日式蛋黃醬 (Kewpie) 4湯匙、黑椒 適量", steps: ["薯仔去皮烚熟，壓成粗蓉放涼。", "青瓜和甘筍切薄片，用少許鹽醃出水後擠乾。", "火腿切碎。", "將所有材料與日式蛋黃醬拌勻，加黑椒調味即成。"] },
  { name: "玉子燒", servings: 2, difficulty: 3, prepTime: 15, desc: "甜甜的日式煎蛋卷，層次分明。", ingredients: "雞蛋 3隻、高湯 2湯匙、糖 1湯匙、日式醬油 1茶匙", steps: ["雞蛋與高湯、糖、醬油打勻過篩。", "玉子燒鍋抹油燒熱，倒入一層薄蛋液。", "半熟時從前往後捲起，推回前方。", "重複抹油、倒蛋液、捲起的動作至蛋液用完，切件即成。"] },
  { name: "日式唐揚炸雞", servings: 3, difficulty: 3, prepTime: 30, desc: "外脆內多汁，配啤酒一流。", ingredients: "雞髀肉 300克、生抽 2湯匙、清酒 1湯匙、薑蓉 1茶匙、蒜蓉 1茶匙、片栗粉 (生粉) 適量", steps: ["雞髀肉切塊，用生抽、清酒、薑蒜蓉醃30分鐘。", "雞肉均勻沾上片栗粉，靜置5分鐘反潮。", "160度油溫初炸3分鐘，撈起靜置。", "調高油溫至190度，翻炸1分鐘至金黃酥脆即成。"] },
  { name: "麵豉烤茄子", servings: 2, difficulty: 2, prepTime: 20, desc: "鹹甜惹味，茄子軟糯入口即化。", ingredients: "圓茄子 1個、白味噌 2湯匙、味醂 1湯匙、糖 1湯匙、白芝麻 適量", steps: ["茄子對半切開，表面𠝹十字花紋。", "茄子表面掃油，入焗爐180度焗15分鐘至軟身。", "白味噌、味醂、糖拌勻成醬，塗在茄子表面。", "再焗5分鐘至醬汁微焦，撒上白芝麻即成。"] },
  { name: "抹茶巴斯克芝士蛋糕", servings: 6, difficulty: 2, prepTime: 45, desc: "焦香外皮配流心抹茶內餡。", ingredients: "忌廉芝士 250克、糖 70克、雞蛋 2隻、淡忌廉 120毫升、抹茶粉 10克", steps: ["忌廉芝士放軟，加糖打滑。", "分次加入雞蛋拌勻。", "抹茶粉與淡忌廉拌勻，倒入芝士糊中拌勻。", "倒入墊了烘焙紙的模具，220度焗25分鐘，放涼冷藏後即成。"] },
];

const italian = [
  { name: "正宗羅馬卡邦尼意粉", servings: 2, difficulty: 3, prepTime: 20, desc: "堅持不加忌廉！全靠蛋黃和芝士乳化。", ingredients: "意粉 200克、風乾豬面頰肉 (Guanciale) 100克、蛋黃 3個、Pecorino 芝士碎 50克、黑椒 大量", steps: ["豬肉切條，白鑊慢火煎出豬油至香脆，盛起豬肉，留豬油在鑊。", "蛋黃、芝士碎和大量黑椒拌勻成芝士蛋糊。", "意粉煮至 Al Dente，撈起放入有豬油的鑊中拌勻。", "熄火，加入芝士蛋糊和少許煮麵水，快速攪拌至乳化成濃稠醬汁，撒上脆豬肉即成。"] },
  { name: "傳統提拉米蘇", servings: 6, difficulty: 3, prepTime: 30, desc: "帶我走！濃郁咖啡酒香配軟滑芝士。", ingredients: "Mascarpone 芝士 250克、雞蛋 3隻、糖 50克、手指餅 1包、特濃咖啡 1杯、咖啡酒 2湯匙、可可粉 適量", steps: ["蛋黃加一半糖隔熱水打發至發白，加入Mascarpone芝士拌勻。", "蛋白加剩餘糖打至企身，分次拌入芝士糊中。", "咖啡與咖啡酒混合，手指餅快速浸泡後鋪在容器底。", "鋪上一層芝士糊，重複一層餅一層糊，冷藏4小時，吃前撒可可粉即成。"] },
  { name: "瑪格麗特薄餅", servings: 2, difficulty: 3, prepTime: 60, desc: "意式經典，紅綠白三色代表意大利國旗。", ingredients: "薄餅麵糰 1個、番茄糊 (Passata) 3湯匙、新鮮水牛芝士 (Mozzarella) 1個、鮮羅勒葉 適量、橄欖油 適量", steps: ["麵糰推開成圓形薄餅底。", "均勻塗上番茄糊，鋪上撕碎的水牛芝士。", "放入預熱至最高溫 (250度+) 的焗爐焗8-10分鐘。", "出爐後放上新鮮羅勒葉，淋上少許橄欖油即成。"] },
  { name: "白酒蜆肉意粉", servings: 2, difficulty: 2, prepTime: 20, desc: "鮮甜無比，蒜香與白酒的完美結合。", ingredients: "意粉 200克、大蜆 500克、蒜茸 2湯匙、白酒 半杯、番茜碎 適量、辣椒碎 少許", steps: ["蜆吐沙洗淨；意粉煮至八成熟。", "橄欖油爆香蒜茸和辣椒碎，下蜆炒勻。", "倒入白酒，加蓋焗至蜆開口，夾起蜆肉備用。", "意粉放入蜆汁中煮至收汁，蜆肉回鑊，撒上番茜碎即成。"] },
  { name: "黑松露野菌意大利飯", servings: 2, difficulty: 3, prepTime: 30, desc: "飯粒吸滿高湯，口感煙韌。", ingredients: "意大利米 (Arborio) 150克、雜菌 200克、洋蔥碎 適量、熱雞湯 500毫升、黑松露醬 1湯匙、巴馬臣芝士 適量", steps: ["炒香雜菌盛起。", "爆香洋蔥碎，加入意大利米炒勻。", "分次加入熱雞湯，不斷攪拌，每次等湯汁被吸收才加下一次，煮約15分鐘。", "拌入雜菌、黑松露醬和芝士，熄火加蓋焗2分鐘即成。"] },
  { name: "肉醬意粉", servings: 4, difficulty: 2, prepTime: 60, desc: "慢熬肉醬，家常必備。", ingredients: "意粉 400克、免治牛豬混合 300克、洋蔥/甘筍/西芹碎 各適量、番茄罐頭 1罐、紅酒 半杯", steps: ["炒香洋蔥、甘筍、西芹碎。", "加入免治肉炒至轉色。", "倒入紅酒煮發揮，加入番茄罐頭，慢火熬煮45分鐘。", "意粉煮熟，拌入肉醬，撒上芝士碎即成。"] },
  { name: "卡布里沙律", servings: 2, difficulty: 1, prepTime: 5, desc: "最簡單清新的意式前菜。", ingredients: "大番茄 2個、新鮮水牛芝士 1個、鮮羅勒葉 適量、特級初榨橄欖油 2湯匙、黑醋醬 (Balsamic Glaze) 適量", steps: ["番茄和水牛芝士切厚片。", "在碟上梅花間竹地疊起番茄、芝士和羅勒葉。", "撒上少許海鹽和黑椒。", "淋上橄欖油和黑醋醬即成。"] },
  { name: "布拉塔芝士伴巴馬火腿", servings: 2, difficulty: 1, prepTime: 5, desc: "切開流心的邪惡芝士，配酒一流。", ingredients: "Burrata 芝士 1個、巴馬火腿 4片、車厘茄 適量、火箭菜 適量、橄欖油 適量", steps: ["火箭菜墊底，放上切半的車厘茄。", "將Burrata芝士放在正中間。", "旁邊圍上巴馬火腿。", "淋上優質橄欖油，撒少許黑椒即成。"] },
  { name: "蒜香辣椒意粉", servings: 2, difficulty: 2, prepTime: 15, desc: "越簡單越考功夫的經典宵夜。", ingredients: "意粉 200克、大蒜 4瓣、乾辣椒碎 1茶匙、特級初榨橄欖油 4湯匙、番茜碎 適量", steps: ["意粉在鹽水中煮至 Al Dente。", "冷鍋下橄欖油和蒜片，慢火煸出蒜香至微黃。", "加入辣椒碎略炒，加入一湯勺煮麵水乳化。", "放入意粉快速拌勻，撒上番茜碎即成。"] },
  { name: "意式奶凍", servings: 4, difficulty: 2, prepTime: 15, desc: "冰涼滑溜，配酸甜果醬最解膩。", ingredients: "淡忌廉 250毫升、牛奶 100毫升、糖 30克、魚膠粉 5克、雲呢拿香油 少許、士多啤梨醬 適量", steps: ["魚膠粉加少許冷水拌勻浸軟。", "小鍋中加入淡忌廉、牛奶、糖和雲呢拿香油，慢火加熱至糖融化（不要煮滾）。", "熄火，加入魚膠粉溶液攪拌至完全融化。", "倒入模具，冷藏4小時至凝固，倒扣淋上果醬即成。"] },
];

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
  const toAdd = recipes.filter((r) => !SKIP.has(r.name));
  let idNum = startId;
  const lines = [
    'import type { Recipe } from "@/types";',
    "",
    `/** ${cuisine} 人氣菜式第二批 */`,
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
  return { added: toAdd.length, from: startId, to: idNum - 1, skipped: recipes.length - toAdd.length };
}

const w = emitFile(
  "src/data/recipes/western-batch2.ts",
  "westernBatch2Recipes",
  "western",
  "w",
  11,
  western
);
const j = emitFile(
  "src/data/recipes/japanese-batch2.ts",
  "japaneseBatch2Recipes",
  "japanese",
  "j",
  11,
  japanese
);
const it = emitFile(
  "src/data/recipes/italian-batch2.ts",
  "italianBatch2Recipes",
  "italian",
  "it",
  11,
  italian
);

console.log("western", w);
console.log("japanese", j);
console.log("italian", it);
console.log("Skipped names:", [...SKIP].join(", "));
