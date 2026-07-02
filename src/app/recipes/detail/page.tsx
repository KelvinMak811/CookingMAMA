import { BASE_PATH } from "@/lib/paths";

/** 舊版 ?id= 連結：用 inline script 轉去靜態菜式頁（唔依賴 React hydration） */
export default function RecipeDetailLegacyPage() {
  const recipesBase = `${BASE_PATH}/recipes/`;
  const fallback = `${BASE_PATH}/recipes/`;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var m=location.search.match(/[?&]id=([^&]+)/);location.replace(m?${JSON.stringify(recipesBase)}+decodeURIComponent(m[1])+"/":${JSON.stringify(fallback)});})();`,
        }}
      />
      <div className="container app-main py-5 text-center text-secondary">
        載入菜式中…
      </div>
    </>
  );
}
