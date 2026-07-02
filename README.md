# SmartCook（CookingMAMA）

香港家常煮食 App — 50 道易潔鑊菜式、買餸清單、煮食日曆、開支紀錄。

**網站：** [https://kelvinmak811.github.io/CookingMAMA/](https://kelvinmak811.github.io/CookingMAMA/)

## 功能

- 菜式瀏覽（中餐、西餐、日式、意式）
- 食譜詳情（材料、步驟、難度、份量調整）
- 買餸清單（localStorage 同步）
- 煮食日曆與開支紀錄

## 本機開發

### PHP 版（建議）

```bat
cd php-site
start.bat
```

瀏覽器開啟 http://127.0.0.1:8888/recipes.php

### 建置 GitHub Pages 靜態站

```bash
npm run build:pages
```

輸出至 `out/`。推送到 `main` 後，GitHub Actions 會自動部署靜態檔到倉庫根目錄及 `gh-pages` 分支。

## 專案結構

| 路徑 | 說明 |
|------|------|
| `php-site/` | PHP 版網站（本機測試用） |
| `scripts/build-github-pages-static.mjs` | 靜態 HTML 產生器 |
| `src/` | 舊版 Next.js 原始碼 |
| `recipes/`, `assets/` 等（根目錄） | 已建置的 GitHub Pages 靜態檔 |

## GitHub Pages 設定

若首頁仍顯示本 README 而非 App，請到 **Settings → Pages**：

- **Source:** Deploy from a branch
- **Branch:** `main` → `/ (root)`（推送後會自動更新靜態檔）

或使用 `gh-pages` 分支作為來源亦可。
