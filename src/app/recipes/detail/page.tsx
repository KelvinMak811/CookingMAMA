import { BASE_PATH } from "@/lib/paths";

/** 舊版 ?id= 連結：立即轉去靜態菜式頁 */
export default function RecipeDetailLegacyPage() {
  const recipesBase = `${BASE_PATH}/recipes/`;
  const fallback = `${BASE_PATH}/recipes/`;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var m=location.search.match(/[?&]id=([^&]+)/);location.replace(m?${JSON.stringify(recipesBase)}+decodeURIComponent(m[1])+"/":${JSON.stringify(fallback)});}catch(e){location.replace(${JSON.stringify(fallback)});}})();`,
        }}
      />
      <div className="container app-main py-5 text-center text-secondary">
        <p className="mb-3">載入菜式中…</p>
        <p className="small">
          如果冇自動跳轉，請
          <a href={fallback}>返回菜式庫</a>
          重新揀選。
        </p>
      </div>
    </>
  );
}
