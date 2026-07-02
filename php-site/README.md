# SmartCook PHP 版

參考「香港學界桌上遊戲設計比賽網頁」架構，用 **PHP + Bootstrap + 原生 JavaScript** 重建，適合傳統 PHP 主機（唔需要 Node.js / Next.js）。

## 架構

```
php-site/
├── index.php              → 跳轉去菜式庫
├── recipes.php            → 全部菜式
├── recipes-cuisine.php    → 分類菜式
├── recipe.php?id=xxx      → 菜式詳情
├── shopping-list.php      → 買餸清單
├── history.php            → 煮食日曆
├── expenses.php           → 開支紀錄
├── head.html              → 共用 <head>
├── header.html            → 導航列 + 手機底部選單
├── footer.html            → 共用 JS
├── includes/              → PHP 共用模組
├── dish/                  → 內建菜式 database（index.json + 每道菜一個 .json）
└── assets/css, js/        → 樣式同互動
```

## 部署方法

1. 將 **`php-site` 資料夾內所有檔案** 上傳到你嘅 PHP 主機網站根目錄（例如 cPanel `public_html`）
2. 確認主機支援 **PHP 8.0+**
3. 用瀏覽器開 `https://你的網域/recipes.php`

### 本機測試（Windows）

**雙擊 `start.bat`**，然後用 Chrome 開：

**http://127.0.0.1:8888/recipes.php**

或手動：

```bash
cd php-site
php -S 127.0.0.1:8888
```

> ⚠️ 必須喺 **`php-site` 資料夾內** 啟動伺服器。  
> 若喺上一層（Next.js 專案根目錄）跑 `php -S`，會出現 **/recipes.php was not found**。

> ⚠️ **GitHub Pages 唔支援 PHP**。`kelvinmak811.github.io/recipes.php` 唔會 work，要用 PHP 主機或本機 `start.bat`。

## 更新菜式資料

若修改咗 Next.js 版 `src/data/recipes/`，可重新匯出到 `dish/`：

```bash
npm run export-recipes
```

或直接編輯 `dish/{菜式id}.json`，再執行 `npm run build:pages` 建置靜態站。

## 資料儲存

買餸清單、煮食紀錄、預定煮食仍用瀏覽器 **localStorage**，格式相容之前 Next.js 版（`smartcook_shopping` 等 key），換 PHP 版後原有資料會保留。

## 與 GitHub Pages 分別

| | Next.js (舊) | PHP (新) |
|---|---|---|
| 主機 | GitHub Pages | PHP 主機 |
| 菜式頁 | 靜態匯出 | PHP 即時輸出 HTML |
| 導航 | 易出 client routing 問題 | 傳統連結，最穩陣 |

舊 Next.js 版仍保留喺 repo `src/` 目錄，可繼續用 GitHub Pages；**建議改用 PHP 版上線**。
