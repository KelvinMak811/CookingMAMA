/**
 * Recipe ingredient filters — mirrors src/lib/recipeIngredientFilters.ts
 */
(function (global) {
  function hasPork(h) {
    return /豬|猪|五花腩|排骨|一字排|臘腸|腊肠|培根|烟肉|煙肉|火腿|火腩|意式香肠|意式香腸|炸吉列豬/.test(h);
  }

  function hasBeef(h) {
    const cleaned = h.replace(/牛油果?|水牛/g, "");
    return /牛/.test(cleaned);
  }

  function hasChicken(h) {
    const cleaned = h.replace(/雞蛋|鸡蛋|皮蛋|鹹蛋|咸蛋|蛋黃|生食級雞蛋/g, "");
    return /雞|鸡/.test(cleaned);
  }

  function hasSeafood(h) {
    return /魚(?!膠)|鱼(?!胶)|虾|蝦|蟹|魷|鱿|蜆|蚬|帶子|带子|扇貝|扇贝|青口|龍蝦|龙虾|三文|石斑|鱸|鲈|鲭|鯖|海鮮|海鲜|明太子/.test(h);
  }

  function hasEgg(h) {
    return (
      /雞蛋|鸡蛋|蛋黃|皮蛋|鹹蛋|咸蛋|生食級雞蛋|蛋液/.test(h) ||
      /炒蛋|蒸蛋|蛋治/.test(h)
    );
  }

  function hasTofuOrVeggie(h) {
    if (/豆腐|腐乳/.test(h)) return true;
    return !hasPork(h) && !hasBeef(h) && !hasChicken(h) && !hasSeafood(h);
  }

  const MEAT_MATCHERS = {
    pork: hasPork,
    beef: hasBeef,
    chicken: hasChicken,
    seafood: hasSeafood,
    egg: hasEgg,
    tofu_veg: hasTofuOrVeggie,
  };

  const VEG_MATCHERS = {
    choy_sum: (h) => /菜心/.test(h),
    water_spinach: (h) => /通菜|水菜|空心菜/.test(h),
    tomato: (h) => /番茄|蕃茄|车厘茄|車厘茄/.test(h),
    onion: (h) => /洋蔥|洋葱|紅蔥頭|红葱头/.test(h),
    eggplant: (h) => /茄子|圓茄子|圆茄子/.test(h),
    broccoli: (h) => /西蘭花|西兰花/.test(h),
    carrot: (h) => /甘筍|甘笋|胡蘿蔔|胡萝卜/.test(h),
    potato: (h) => /薯仔|马铃薯|馬鈴薯|土豆/.test(h),
    mushroom: (h) =>
      /蘑菇|金針菇|金针菇|香菇|冬菇|草菇|雜菌|杂菌|鲜蘑菇|鮮蘑菇|鮮白蘑菇|鲜白蘑菇/.test(h),
    pepper: (h) => /青椒|紅椒|红椒|三色椒|青紅椒|青红椒|彩椒/.test(h),
    gai_lan: (h) => /芥蘭|芥兰/.test(h),
    bitter_melon: (h) => /涼瓜|凉瓜|苦瓜/.test(h),
  };

  function matchesFilters(haystack, meats, vegs) {
    if ((!meats || meats.length === 0) && (!vegs || vegs.length === 0)) return true;
    const meatOk =
      !meats ||
      meats.length === 0 ||
      meats.some((id) => (MEAT_MATCHERS[id] ? MEAT_MATCHERS[id](haystack) : false));
    const vegOk =
      !vegs ||
      vegs.length === 0 ||
      vegs.some((id) => (VEG_MATCHERS[id] ? VEG_MATCHERS[id](haystack) : false));
    return meatOk && vegOk;
  }

  function parseList(raw) {
    if (!raw) return [];
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }

  global.RecipeIngredientFilters = {
    matchesFilters,
    parseList,
  };
})(window);
