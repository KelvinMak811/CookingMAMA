/**
 * 菜式圖片對照 — 每道菜對應真實食物相片（Wikimedia Commons / TheMealDB）
 */

export const RECIPE_IMAGE_URLS: Record<string, string> = {
  // ── 中餐 ──
  "recipe-1":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Hunan_cuisine%2C_stir-fried_tomato_with_eggs.jpg/960px-Hunan_cuisine%2C_stir-fried_tomato_with_eggs.jpg",
  "recipe-2":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Chow_mein.jpg/960px-Chow_mein.jpg",
  "recipe-3":
    "https://www.themealdb.com/images/media/meals/tqd7s21763780609.jpg",
  "recipe-4":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Billyfoodmabodofu3.jpg/960px-Billyfoodmabodofu3.jpg",
  "recipe-5":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Ginger_chicken.jpg/960px-Ginger_chicken.jpg",
  "recipe-6":
    "https://upload.wikimedia.org/wikipedia/commons/b/bb/Chinese_steamed_eggs_with_char_siu_by_yomi955.jpg",
  "cn-7":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Special_Fried_Rice_-_Dumplings_Plus_AUD7_%283522091044%29.jpg/960px-Special_Fried_Rice_-_Dumplings_Plus_AUD7_%283522091044%29.jpg",
  "cn-8":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Stir_fried_vegetables.jpg/960px-Stir_fried_vegetables.jpg",
  "cn-9":
    "https://www.themealdb.com/images/media/meals/y7h0lq1683208993.jpg",
  "cn-10":
    "https://www.themealdb.com/images/media/meals/wuyd2h1765655837.jpg",
  "cn-11":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Red_Curry_Beef_Brisket_in_Hong_Kong_Cha_Chaan_Teng.JPG/960px-Red_Curry_Beef_Brisket_in_Hong_Kong_Cha_Chaan_Teng.JPG",
  "cn-12":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Fried_Rice_with_Salted_Fish_and_Chicken.jpg/960px-Fried_Rice_with_Salted_Fish_and_Chicken.jpg",
  "cn-13":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Char_siu_pork.jpg/960px-Char_siu_pork.jpg",
  "cn-14":
    "https://www.themealdb.com/images/media/meals/1529442316.jpg",
  "cn-15":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Irish_stew.jpg/960px-Irish_stew.jpg",
  "cn-16":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Fried_rice.jpg/960px-Fried_rice.jpg",
  "cn-17":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Pak_boong_fai_daeng.jpg/960px-Pak_boong_fai_daeng.jpg",
  "cn-18":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Gon_caau_ngau_ho_%2820150222171214%29.JPG/960px-Gon_caau_ngau_ho_%2820150222171214%29.JPG",
  "cn-19":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Char_siu_pork.jpg/960px-Char_siu_pork.jpg",
  "cn-20":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Pasta_with_beef.jpg/960px-Pasta_with_beef.jpg",

  // ── 西餐 ──
  "w-1":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Scrambled_eggs.jpg/960px-Scrambled_eggs.jpg",
  "w-2":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Tagliatelle_ai_funghi.jpg/960px-Tagliatelle_ai_funghi.jpg",
  "w-3":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Fried_chicken_thigh.jpg/960px-Fried_chicken_thigh.jpg",
  "w-4": "https://www.themealdb.com/images/media/meals/sutysw1468247559.jpg",
  "w-5": "https://www.themealdb.com/images/media/meals/g373701551450225.jpg",
  "w-6": "https://www.themealdb.com/images/media/meals/hqaejl1695738653.jpg",
  "w-7":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Shrimp_scampi.jpg/960px-Shrimp_scampi.jpg",
  "w-8": "https://www.themealdb.com/images/media/meals/syqypv1486981727.jpg",
  "w-9": "https://upload.wikimedia.org/wikipedia/commons/9/9d/Pepper_steak.jpg",
  "w-10":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Chicken_stew.jpg/960px-Chicken_stew.jpg",

  // ── 日式 ──
  "j-1": "https://upload.wikimedia.org/wikipedia/commons/0/0c/Oyakodon_Kyo_no_Tsukuneya.jpg",
  "j-2":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Gy%C5%ABdon.jpg/960px-Gy%C5%ABdon.jpg",
  "j-3": "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg",
  "j-4":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Japanese_curry_rice.jpg/960px-Japanese_curry_rice.jpg",
  "j-5":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Miso_soup_001.jpg/960px-Miso_soup_001.jpg",
  "j-6":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Yakisoba.jpg/960px-Yakisoba.jpg",
  "j-7": "https://upload.wikimedia.org/wikipedia/commons/6/65/Shogayaki.jpg",
  "j-8": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Hamburg_steak.jpg",
  "j-9": "https://www.themealdb.com/images/media/meals/diuub11782687570.jpg",
  "j-10":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Chawanmushi_001.jpg/960px-Chawanmushi_001.jpg",

  // ── 意式 ──
  "it-1":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Spaghetti_aglio_e_olio.jpg/960px-Spaghetti_aglio_e_olio.jpg",
  "it-2": "https://www.themealdb.com/images/media/meals/vpcqn01763335688.jpg",
  "it-3": "https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg",
  "it-4":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Chicken_cacciatore.jpg/960px-Chicken_cacciatore.jpg",
  "it-5":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Spaghetti_with_shrimp.jpg/960px-Spaghetti_with_shrimp.jpg",
  "it-6":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Spaghetti_and_meatballs.jpg/960px-Spaghetti_and_meatballs.jpg",
  "it-7": "https://www.themealdb.com/images/media/meals/wrpwuu1511786491.jpg",
  "it-8": "https://www.themealdb.com/images/media/meals/0jv5gx1661040802.jpg",
  "it-9": "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg",
  "it-10":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Risotto.jpg/960px-Risotto.jpg",
};

export const DEFAULT_RECIPE_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg/800px-Good_Food_Display_-_NCI_Visuals_Online.jpg";

export function getRecipeImageUrl(recipeId: string): string {
  return RECIPE_IMAGE_URLS[recipeId] ?? DEFAULT_RECIPE_IMAGE;
}
