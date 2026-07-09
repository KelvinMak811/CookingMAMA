import { writeFileSync } from "fs";

const SKIP = new Set(["番茄炒蛋", "麻婆豆腐"]);

const recipes = [
  { name: "菠蘿咕嚕肉", servings: 3, difficulty: 3, prepTime: 30, desc: "酸甜開胃，外脆內軟的經典港式小菜。", ingredients: "豬梅頭肉 300克、罐頭菠蘿 3片、青椒 半個、紅椒 半個、洋蔥 半個、雞蛋 1隻、生粉 適量、咕嚕肉汁(茄醬3湯匙/白醋2湯匙/糖2湯匙) 1份", steps: ["豬肉切粒，用少許鹽和生抽醃15分鐘。", "豬肉沾蛋液再撲生粉，炸至金黃熟透撈起。", "爆香洋蔥、青紅椒，倒入咕嚕肉汁煮滾。", "加入菠蘿及豬肉，快速炒勻掛汁即成。"] },
  { name: "鹹蛋蒸肉餅", servings: 3, difficulty: 1, prepTime: 15, desc: "送飯一流的經典家常菜。", ingredients: "免治豬肉 300克、鹹蛋 1隻、生抽 1湯匙、糖 半茶匙、生粉 1茶匙、水 2湯匙", steps: ["鹹蛋分開蛋黃和蛋白。", "免治豬肉加入鹹蛋白、生抽、糖、生粉和水，順同一方向攪拌至起膠。", "將肉餅鋪平在碟上，中間放上鹹蛋黃。", "水滾後大火隔水蒸12分鐘即成。"] },
  { name: "榨菜蒸豬肉", servings: 2, difficulty: 1, prepTime: 10, desc: "惹味下飯，準備極快。", ingredients: "豬肉片 200克、榨菜絲 1包、生抽 1茶匙、糖 半茶匙、生粉 1茶匙", steps: ["榨菜絲用水略沖洗減低鹹味。", "豬肉片用生抽、糖、生粉醃10分鐘。", "將榨菜絲與豬肉片拌勻，平鋪在碟上。", "大火隔水蒸10分鐘即成。"] },
  { name: "粟米肉粒", servings: 3, difficulty: 1, prepTime: 15, desc: "小朋友最愛的甜甜拌飯菜式。", ingredients: "豬肉粒 200克、粟米蓉 1罐、雞蛋 1隻、鹽 半茶匙", steps: ["豬肉粒用少許生抽和生粉略醃。", "燒熱油鑊，將豬肉粒炒至八成熟。", "倒入粟米蓉煮滾，加少許鹽調味。", "熄火，拌入打勻的蛋液成蛋花即成。"] },
  { name: "椒鹽豬扒", servings: 3, difficulty: 3, prepTime: 20, desc: "香脆惹味，大牌檔風味。", ingredients: "帶骨豬扒 3塊、蒜茸 2湯匙、紅椒粒 1湯匙、椒鹽 1茶匙、生粉 適量", steps: ["豬扒用刀背拍鬆，用生抽、糖醃20分鐘。", "豬扒撲上薄薄一層生粉，半煎炸至兩面金黃熟透，切件。", "倒出多餘油份，爆香蒜茸和紅椒粒。", "豬扒回鑊，撒上椒鹽快炒均勻即成。"] },
  { name: "梅菜扣肉", servings: 4, difficulty: 4, prepTime: 60, desc: "傳統客家名菜，肥而不膩。", ingredients: "五花腩 500克、甜梅菜 2棵、老抽 2湯匙、生抽 1湯匙、冰糖 1小塊、八角 2粒", steps: ["梅菜浸洗乾淨，切碎白鑊炒乾備用。", "五花腩原塊出水，抹乾後塗上老抽，下鑊煎至豬皮起泡。", "五花腩切厚片，皮朝下排在碗底，鋪上梅菜、八角、冰糖及調味料。", "隔水大火蒸1.5至2小時，倒扣上碟即成。"] },
  { name: "豉汁蒸排骨", servings: 2, difficulty: 2, prepTime: 15, desc: "茶樓必點點心，滑溜多汁。", ingredients: "新鮮排骨 300克、豆豉 1湯匙、蒜蓉 1湯匙、生抽 1湯匙、糖 半茶匙、生粉 1茶匙", steps: ["排骨浸水去血水，瀝乾。", "加入豆豉碎、蒜蓉、生抽、糖拌勻。", "加入生粉及少許油拌勻醃15分鐘。", "大火隔水蒸12-15分鐘至熟透。"] },
  { name: "臘腸炒荷蘭豆", servings: 3, difficulty: 1, prepTime: 10, desc: "爽脆鮮甜的家常小炒。", ingredients: "臘腸 2條、荷蘭豆 200克、蒜蓉 1茶匙", steps: ["臘腸隔水蒸熟，切片備用。", "荷蘭豆撕去硬筋，洗淨。", "爆香蒜蓉，下荷蘭豆炒至轉深綠色。", "加入臘腸片同炒，加少許鹽調味即成。"] },
  { name: "京都骨", servings: 3, difficulty: 3, prepTime: 30, desc: "酸甜開胃，色澤紅亮。", ingredients: "一字排 400克、洋蔥 半個、鎮江醋 3湯匙、糖 2湯匙、茄醬 1湯匙、生抽 1湯匙", steps: ["排骨醃好，撲生粉炸至金黃熟透。", "鎮江醋、糖、茄醬、生抽調成醬汁。", "爆香洋蔥，倒入醬汁煮滾。", "排骨回鑊，大火收汁至濃稠掛肉即成。"] },
  { name: "肉絲炒麵", servings: 2, difficulty: 2, prepTime: 20, desc: "經典港式粉麵，麵條香脆。", ingredients: "豬肉絲 150克、芽菜 50克、韭黃 50克、生麵 2個、蠔油 1湯匙、老抽 半湯匙", steps: ["生麵煮軟瀝乾，下鑊半煎炸至兩面金黃香脆，上碟。", "豬肉絲用生抽醃好，下鑊炒熟。", "加入芽菜、韭黃同炒，下蠔油、老抽及少許水煮成芡汁。", "將肉絲芡汁淋在脆麵上即成。"] },
  { name: "涼瓜炒牛肉", servings: 3, difficulty: 2, prepTime: 20, desc: "甘苦與鮮嫩的完美結合。", ingredients: "牛肉片 200克、涼瓜 1個、豆豉 1湯匙、蒜蓉 1湯匙、糖 1茶匙", steps: ["牛肉用生抽、糖、生粉醃好。涼瓜切片，用鹽醃出苦水後沖洗。", "牛肉快炒至半熟，盛起。", "爆香蒜蓉、豆豉，下涼瓜炒軟，加糖調味。", "牛肉回鑊炒勻即成。"] },
  { name: "中式牛柳", servings: 3, difficulty: 3, prepTime: 20, desc: "酸酸甜甜，肉質軟嫩。", ingredients: "牛柳 300克、洋蔥 半個、茄醬 3湯匙、喼汁 1湯匙、糖 1湯匙", steps: ["牛柳切厚片，用梳打粉、生抽醃軟。", "煎香牛柳至七成熟，盛起。", "炒香洋蔥絲，加入茄醬、喼汁、糖煮成汁。", "牛柳回鑊拌勻即成。"] },
  { name: "沙嗲牛肉粉絲煲", servings: 3, difficulty: 2, prepTime: 20, desc: "濃郁惹味，粉絲吸滿精華。", ingredients: "牛肉片 200克、粉絲 1包、金針菇 1包、沙嗲醬 2湯匙、清湯 1碗", steps: ["粉絲浸軟；牛肉醃好略炒盛起。", "砂鍋爆香沙嗲醬，加入清湯煮滾。", "放入金針菇和粉絲煮軟。", "鋪上牛肉片，加蓋焗1分鐘即成。"] },
  { name: "菜心炒牛肉", servings: 3, difficulty: 1, prepTime: 15, desc: "最常見的家庭小炒。", ingredients: "牛肉片 200克、菜心 半斤、薑片 3片、蠔油 1湯匙", steps: ["牛肉醃好；菜心洗淨切段。", "牛肉快炒至半熟盛起。", "爆香薑片，炒熟菜心。", "牛肉回鑊，加蠔油炒勻即成。"] },
  { name: "黑椒牛柳粒", servings: 3, difficulty: 2, prepTime: 15, desc: "惹味香濃，肉汁豐富。", ingredients: "牛柳粒 250克、三色椒 各半個、蒜片 適量、黑椒碎 1湯匙、生抽 1湯匙", steps: ["牛柳粒醃好；三色椒切塊。", "鑊熱下油，將牛柳粒煎香四面，盛起。", "爆香蒜片和三色椒，加入黑椒碎。", "牛柳粒回鑊，加生抽快炒即成。"] },
  { name: "滑蛋牛肉", servings: 2, difficulty: 2, prepTime: 10, desc: "蛋滑肉嫩，老少咸宜。", ingredients: "牛肉片 150克、雞蛋 3隻、蔥花 適量、鹽 少許", steps: ["牛肉醃好，快炒至剛熟盛起。", "雞蛋打勻，加少許鹽及蔥花，拌入牛肉。", "燒熱油鑊，倒入蛋液。", "慢火將蛋液推炒至半凝固即成。"] },
  { name: "蘿蔔清湯牛腩", servings: 4, difficulty: 3, prepTime: 90, desc: "湯清味濃，牛腩軟腍。", ingredients: "牛腩 500克、白蘿蔔 1條、八角 2粒、薑片 4片、冰糖 1小塊", steps: ["牛腩汆水洗淨。", "鍋中加水、薑片、八角、冰糖，放入牛腩炆煮1小時。", "白蘿蔔切塊，加入鍋中再炆30分鐘。", "加鹽調味，切件上碟即成。"] },
  { name: "洋蔥炒牛肉", servings: 2, difficulty: 1, prepTime: 10, desc: "簡單快捷，洋蔥鮮甜。", ingredients: "牛肉片 200克、洋蔥 1個、生抽 1湯匙、老抽 半茶匙", steps: ["牛肉醃好；洋蔥切絲。", "牛肉快炒至半熟盛起。", "炒香洋蔥絲至軟身。", "牛肉回鑊，加生抽及老抽炒勻即成。"] },
  { name: "番茄炒牛肉", servings: 3, difficulty: 1, prepTime: 15, desc: "酸甜開胃，拌飯佳品。", ingredients: "牛肉片 200克、番茄 3個、茄醬 1湯匙、糖 1茶匙", steps: ["牛肉醃好炒至半熟盛起。", "番茄切塊，下鑊炒軟，出汁。", "加入茄醬和糖調味。", "牛肉回鑊拌勻即成。"] },
  { name: "芥蘭炒牛", servings: 3, difficulty: 1, prepTime: 15, desc: "芥蘭爽脆，牛肉嫩滑。", ingredients: "牛肉片 200克、芥蘭 半斤、薑汁 1茶匙、紹酒 1茶匙", steps: ["牛肉醃好炒至半熟盛起。", "芥蘭洗淨切段，猛火炒熟，灒紹酒。", "牛肉回鑊，加入薑汁炒勻即成。"] },
  { name: "冬菇蒸滑雞", servings: 3, difficulty: 2, prepTime: 20, desc: "雞肉嫩滑，冬菇吸滿肉汁。", ingredients: "雞件 半隻、冬菇 4隻、薑絲 適量、生抽 1湯匙、生粉 1茶匙", steps: ["冬菇浸軟切片。", "雞件用生抽、生粉、油醃好，拌入冬菇和薑絲。", "平鋪在碟上。", "大火隔水蒸15分鐘即成。"] },
  { name: "豉油雞", servings: 4, difficulty: 3, prepTime: 40, desc: "皮色紅亮，肉質鮮嫩。", ingredients: "全雞 1隻、生抽 1碗、老抽 2湯匙、冰糖 1大塊、玫瑰露 1湯匙、八角 2粒", steps: ["鍋中放入生抽、老抽、冰糖、八角和適量水煮滾成滷汁。", "放入全雞，將滷汁反覆淋在雞身上。", "加蓋小火浸煮30分鐘，期間反轉一次。", "取出放涼斬件，淋上少許滷汁即成。"] },
  { name: "栗子炆雞", servings: 4, difficulty: 3, prepTime: 35, desc: "秋季時令菜，栗子粉糯。", ingredients: "雞件 半隻、去殼栗子 200克、薑蔥 適量、蠔油 1湯匙、老抽 半茶匙", steps: ["雞件醃好，下鑊煎香表面。", "爆香薑蔥，加入栗子同炒。", "加入蠔油、老抽及清水，大火煮滾。", "轉小火炆20分鐘至栗子軟腍即成。"] },
  { name: "檸檬煎軟雞", servings: 3, difficulty: 2, prepTime: 20, desc: "清新酸甜，解膩開胃。", ingredients: "雞扒 2塊、檸檬 1個、吉士粉 1湯匙、糖 2湯匙、水 適量", steps: ["雞扒醃好，撲上吉士粉和生粉。", "煎至兩面金黃熟透，切件上碟。", "檸檬榨汁，加糖和水煮成檸檬汁，埋芡。", "將檸檬汁淋在雞扒上即成。"] },
  { name: "咖喱雞", servings: 4, difficulty: 2, prepTime: 30, desc: "惹味香濃，送飯一流。", ingredients: "雞件 半隻、薯仔 2個、洋蔥 1個、咖喱醬 2湯匙、椰漿 半罐", steps: ["薯仔切塊煎香；雞件略炒。", "爆香洋蔥，加入咖喱醬炒香。", "雞件和薯仔回鑊，加水炆煮15分鐘。", "加入椰漿煮滾即成。"] },
  { name: "蔥油雞", servings: 4, difficulty: 3, prepTime: 45, desc: "雞肉嫩滑，配上自家製蔥油。", ingredients: "鮮雞 半隻、蔥粒 1大碗、薑蓉 1湯匙、鹽 1茶匙、油 4湯匙", steps: ["雞隻用水浸熟，過冷河後斬件。", "蔥粒、薑蓉、鹽放碗中。", "燒滾熱油淋在蔥薑上拌勻成蔥油。", "蔥油淋在雞面即成。"] },
  { name: "三杯雞", servings: 3, difficulty: 2, prepTime: 25, desc: "台式風味，香氣撲鼻。", ingredients: "雞件 半隻、九層塔 1把、黑麻油 2湯匙、米酒 2湯匙、醬油 2湯匙、蒜頭 5粒", steps: ["麻油爆香蒜頭和薑片。", "下雞件炒至表面微焦。", "倒入米酒和醬油，加蓋炆煮收汁。", "熄火前加入九層塔拌勻即成。"] },
  { name: "沙薑雞", servings: 4, difficulty: 2, prepTime: 30, desc: "獨特沙薑香味，鹹香惹味。", ingredients: "雞 半隻、沙薑粉 2湯匙、紅蔥頭 3粒、粗鹽 適量", steps: ["雞隻蒸熟或浸熟，斬件上碟。", "紅蔥頭切碎。", "燒熱油爆香紅蔥頭，加入沙薑粉和鹽炒勻成蘸料。", "將蘸料淋在雞上即成。"] },
  { name: "西芹炒雞柳", servings: 2, difficulty: 1, prepTime: 15, desc: "健康清淡，口感爽脆。", ingredients: "雞胸肉 200克、西芹 2條、腰果 50克、蒜蓉 1茶匙", steps: ["雞胸肉切條醃好；西芹去筋切段。", "雞柳炒熟盛起。", "爆香蒜蓉，炒熟西芹。", "雞柳回鑊，加入炸好的腰果炒勻即成。"] },
  { name: "口水雞", servings: 4, difficulty: 3, prepTime: 40, desc: "麻辣鮮香，開胃涼菜。", ingredients: "雞 半隻、花生碎 適量、辣椒油 2湯匙、花椒粉 1茶匙、黑醋 1湯匙、生抽 2湯匙", steps: ["雞隻浸熟，過冰水後斬件。", "辣椒油、花椒粉、黑醋、生抽等調成醬汁。", "將醬汁淋在雞件上。", "撒上花生碎和蔥花即成。"] },
  { name: "清蒸石斑", servings: 4, difficulty: 2, prepTime: 15, desc: "原汁原味，魚肉鮮甜。", ingredients: "石斑魚 1條、蔥絲 適量、薑絲 適量、蒸魚豉油 3湯匙、熟油 2湯匙", steps: ["魚洗淨，碟底鋪薑蔥，放上魚。", "水滾後大火隔水蒸8-10分鐘。", "倒去倒汗水，鋪上新鮮蔥絲。", "淋上滾油，再淋上蒸魚豉油即成。"] },
  { name: "粟米斑塊", servings: 3, difficulty: 2, prepTime: 20, desc: "經典港式小菜，外脆內滑。", ingredients: "急凍魚柳 2塊、粟米蓉 1罐、雞蛋 1隻、生粉 適量", steps: ["魚柳切塊，醃好後撲生粉炸至金黃。", "粟米蓉加水煮滾。", "熄火拌入蛋液成蛋花。", "將粟米汁淋在炸魚塊上即成。"] },
  { name: "蝦仁炒蛋", servings: 3, difficulty: 1, prepTime: 10, desc: "簡單快捷，鮮甜嫩滑。", ingredients: "急凍蝦仁 150克、雞蛋 4隻、蔥花 適量、鹽 少許", steps: ["蝦仁解凍洗淨，略炒至轉色盛起。", "雞蛋打勻，加鹽和蔥花，拌入蝦仁。", "燒熱油鑊，下蛋液。", "慢火炒至半凝固即成。"] },
  { name: "蒜蓉粉絲蒸扇貝", servings: 4, difficulty: 2, prepTime: 20, desc: "宴客必備，粉絲吸滿鮮甜。", ingredients: "半殼扇貝 6隻、粉絲 1小把、蒜蓉 3湯匙、蒸魚豉油 2湯匙", steps: ["粉絲浸軟鋪在扇貝上。", "一半蒜蓉炸成金黃，與生蒜蓉拌勻成金銀蒜，鋪在扇貝上。", "大火隔水蒸5分鐘。", "淋上滾油及蒸魚豉油即成。"] },
  { name: "椒鹽鮮魷", servings: 3, difficulty: 3, prepTime: 25, desc: "香脆惹味，佐酒一流。", ingredients: "鮮魷魚 1隻、蒜蓉 1湯匙、紅椒粒 適量、椒鹽 1茶匙、生粉 適量", steps: ["鮮魷切花切件，汆水瀝乾。", "沾上生粉，大火炸至金黃酥脆。", "爆香蒜蓉和紅椒粒。", "鮮魷回鑊，撒上椒鹽快炒即成。"] },
  { name: "薑蔥炒蟹", servings: 4, difficulty: 3, prepTime: 30, desc: "經典海鮮做法，鮮香撲鼻。", ingredients: "肉蟹 1隻、薑片 大量、蔥段 大量、生粉 適量、蠔油 1湯匙", steps: ["蟹斬件洗淨，切口沾生粉，走油煎熟盛起。", "鑊中爆香大量薑蔥。", "蟹件回鑊，灒酒。", "加蠔油及少許水加蓋焗2分鐘即成。"] },
  { name: "蝦醬通菜炒鮮魷", servings: 3, difficulty: 2, prepTime: 15, desc: "蝦醬香濃，風味十足。", ingredients: "鮮魷魚 1隻、通菜 半斤、蝦醬 1湯匙、蒜蓉 1茶匙", steps: ["鮮魷切花汆水；通菜洗淨切段。", "爆香蒜蓉和蝦醬。", "下通菜猛火快炒。", "加入鮮魷炒勻即成。"] },
  { name: "茄汁大蝦", servings: 3, difficulty: 2, prepTime: 20, desc: "酸甜開胃，蝦肉彈牙。", ingredients: "大蝦 8隻、茄醬 3湯匙、糖 1湯匙、洋蔥碎 適量", steps: ["大蝦剪去鬚腳，挑去腸。", "煎熟大蝦兩面盛起。", "爆香洋蔥碎，下茄醬和糖煮成汁。", "大蝦回鑊兜勻即成。"] },
  { name: "豉汁炒蜆", servings: 3, difficulty: 2, prepTime: 20, desc: "大牌檔風味，惹味非常。", ingredients: "沙蜆 1斤、豆豉 1湯匙、蒜蓉 1湯匙、辣椒 適量", steps: ["蜆吐沙洗淨，汆水至開口撈起。", "爆香蒜蓉、豆豉和辣椒。", "蜆回鑊快炒。", "加少許生抽和糖調味即成。"] },
  { name: "西蘭花炒帶子", servings: 3, difficulty: 2, prepTime: 15, desc: "色彩鮮艷，健康美味。", ingredients: "帶子 8粒、西蘭花 1個、蒜蓉 1茶匙、鹽 少許", steps: ["西蘭花切小朵，汆水備用。", "帶子略煎表面盛起。", "爆香蒜蓉，下西蘭花炒熱。", "帶子回鑊，加鹽炒勻即成。"] },
  { name: "魚香茄子煲", servings: 3, difficulty: 3, prepTime: 25, desc: "鹹香惹味，送飯極品。", ingredients: "茄子 2條、免治豬肉 100克、鹹魚蓉 1湯匙、豆瓣醬 1茶匙、蒜蓉 適量", steps: ["茄子切條，走油或白鑊烘軟備用。", "爆香蒜蓉、鹹魚蓉和豆瓣醬。", "下免治豬肉炒熟。", "茄子回鑊，加少許水炆煮入味即成。"] },
  { name: "蒜蓉炒菜心", servings: 3, difficulty: 1, prepTime: 10, desc: "最基礎的健康蔬菜。", ingredients: "菜心 半斤、蒜蓉 1湯匙、鹽 半茶匙", steps: ["菜心洗淨切段。", "燒熱油，爆香蒜蓉。", "下菜心猛火快炒。", "加鹽調味炒勻即成。"] },
  { name: "腐乳炒通菜", servings: 3, difficulty: 1, prepTime: 10, desc: "腐乳鹹香，通菜爽脆。", ingredients: "通菜 半斤、腐乳 2磚、辣椒絲 適量、蒜蓉 1茶匙", steps: ["通菜洗淨切段；腐乳壓爛加少許水調勻。", "爆香蒜蓉和辣椒絲。", "下通菜猛火快炒。", "倒入腐乳汁炒勻即成。"] },
  { name: "菜脯煎蛋", servings: 2, difficulty: 1, prepTime: 10, desc: "充滿家鄉風味的煎蛋。", ingredients: "甜菜脯 30克、雞蛋 3隻、蔥花 適量", steps: ["菜脯切碎，白鑊炒香盛起。", "雞蛋打勻，加入菜脯和蔥花拌勻。", "燒熱油鑊，倒入蛋液。", "慢火煎至兩面金黃即成。"] },
  { name: "金銀蛋莧菜", servings: 3, difficulty: 2, prepTime: 15, desc: "湯汁鮮甜，營養豐富。", ingredients: "莧菜 半斤、鹹蛋 1隻、皮蛋 1隻、蒜頭 3粒、清湯 半碗", steps: ["鹹蛋和皮蛋切粒；莧菜洗淨。", "爆香原粒蒜頭至微黃。", "加入清湯煮滾，放入莧菜煮軟。", "加入鹹蛋和皮蛋粒煮滾即成。"] },
  { name: "紅燒豆腐", servings: 3, difficulty: 2, prepTime: 20, desc: "豆腐外韌內滑，吸滿醬汁。", ingredients: "硬豆腐 1磚、冬菇 3隻、火腩肉 100克、蠔油 1湯匙、老抽 半茶匙", steps: ["豆腐切塊，煎至兩面金黃盛起。", "冬菇浸軟切片；爆香火腩肉和冬菇。", "豆腐回鑊，加入蠔油、老抽和水煮滾。", "慢火炆煮5分鐘至入味即成。"] },
  { name: "乾煸四季豆", servings: 3, difficulty: 2, prepTime: 20, desc: "豆角微皺，惹味非常。", ingredients: "四季豆 300克、免治豬肉 50克、蝦米 適量、榨菜碎 適量", steps: ["四季豆摘去頭尾，下油鑊半煎炸至表面起皺盛起。", "爆香蝦米、榨菜碎和免治豬肉。", "四季豆回鑊。", "加少許生抽和糖快炒即成。"] },
  { name: "上湯浸時菜", servings: 3, difficulty: 1, prepTime: 10, desc: "清淡健康，原汁原味。", ingredients: "時菜(如白菜仔) 半斤、草菇 幾粒、清雞湯 1碗、薑片 2片", steps: ["時菜洗淨；草菇切半汆水。", "鍋中加入清雞湯和薑片煮滾。", "放入草菇和時菜。", "煮至蔬菜軟熟即成。"] },
];

const toAdd = recipes.filter((r) => !SKIP.has(r.name));
let idNum = 21;

function parseIngredients(raw, recipeIdNum) {
  return raw.split("、").map((part) => {
    const m = part.trim().match(/^(.+?)\s+(.+)$/);
    if (m) return { name: m[1].trim(), amount: m[2].trim() };
    return { name: part.trim(), amount: "適量" };
  }).map((ing, i) => ({ id: `cn${recipeIdNum}-${i + 1}`, ...ing }));
}

const lines = [
  'import type { Recipe } from "@/types";',
  "",
  "/** 港式家常菜第二批 — 易潔鑊為主 */",
  "export const chineseBatch2Recipes: Recipe[] = [",
];

for (const r of toAdd) {
  const id = `cn-${idNum}`;
  const ings = parseIngredients(r.ingredients, idNum);
  lines.push("  {");
  lines.push(`    id: "${id}",`);
  lines.push(`    name: "${r.name}",`);
  lines.push(`    cuisine: "chinese",`);
  lines.push(`    baseServings: ${r.servings},`);
  lines.push(`    description: "${r.desc}",`);
  lines.push(`    difficulty: ${r.difficulty},`);
  lines.push(`    prepTime: ${r.prepTime},`);
  lines.push(`    imageUrl: "",`);
  lines.push("    ingredients: [");
  for (const ing of ings) {
    lines.push(`      { id: "${ing.id}", name: "${ing.name}", amount: "${ing.amount}" },`);
  }
  lines.push("    ],");
  lines.push("    steps: [");
  for (const step of r.steps) {
    lines.push(`      "${step}",`);
  }
  lines.push("    ],");
  lines.push("  },");
  idNum++;
}

lines.push("];");
lines.push("");

writeFileSync("src/data/recipes/chinese-batch2.ts", lines.join("\n"), "utf8");
console.log(`Generated ${toAdd.length} recipes (cn-21 to cn-${idNum - 1})`);
console.log(`Skipped: ${[...SKIP].join(", ")}`);
