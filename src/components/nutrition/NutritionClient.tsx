"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { useNutritionStore } from "@/stores/nutritionStore";
import { loadFitnessPlan } from "@/lib/fitnessPlanStorage";
import { useAccountStore } from "@/stores/accountStore";
import {
  overallAverageDailyIntake,
  statsForDay,
  statsForMonth,
  statsForWeek,
} from "@/lib/nutritionStats";
import type { FoodEstimateResult } from "@/lib/estimateFoodCalories";

const MEAL_LABELS = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  snack: "小食",
} as const;

export function NutritionClient() {
  const entries = useNutritionStore((s) => s.entries);
  const addEntry = useNutritionStore((s) => s.addEntry);
  const removeEntry = useNutritionStore((s) => s.removeEntry);
  const userKey = useAccountStore((s) => s.currentUserId) || "guest";

  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [mealType, setMealType] =
    useState<keyof typeof MEAL_LABELS>("lunch");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [estimateNote, setEstimateNote] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const tdee = useMemo(() => {
    const plan = loadFitnessPlan(userKey);
    return plan?.estimatedDailyTdeeKcal ?? null;
  }, [userKey, entries.length]);

  const today = new Date();
  const dayStats = statsForDay(entries, today, tdee);
  const weekStats = statsForWeek(entries, today, tdee);
  const monthStats = statsForMonth(
    entries,
    today.getFullYear(),
    today.getMonth(),
    tdee
  );
  const avgIntake = overallAverageDailyIntake(entries);

  function onSubmitManual(event: FormEvent) {
    event.preventDefault();
    const kcal = Math.round(Number(calories));
    if (!name.trim() || !kcal) return;
    addEntry({
      name: name.trim(),
      calories: kcal,
      mealType,
      loggedAt: new Date().toISOString(),
      source: "manual",
    });
    setName("");
    setCalories("");
  }

  async function onPhotoSelected(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || "");
      setPhotoPreview(dataUrl);
      setEstimating(true);
      setEstimateNote(null);
      try {
        const res = await fetch("/api/estimate-food-calories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageDataUrl: dataUrl }),
        });
        const json = (await res.json()) as {
          ok: boolean;
          result?: FoodEstimateResult;
          error?: string;
        };
        if (!json.ok || !json.result) {
          setEstimateNote(json.error || "估算失敗");
          return;
        }
        const r = json.result;
        setName(r.name);
        setCalories(String(r.calories));
        setEstimateNote(
          `${r.mode === "ai" ? "AI" : "預設"}估算 · ${r.portion} · 信心：${r.confidence}${
            r.notes ? ` · ${r.notes}` : ""
          }${r.aiError ? ` · ${r.aiError}` : ""}`
        );
      } catch {
        setEstimateNote("網絡錯誤，請手動輸入卡路里。");
      } finally {
        setEstimating(false);
      }
    };
    reader.readAsDataURL(file);
  }

  function saveFromPhoto() {
    const kcal = Math.round(Number(calories));
    if (!name.trim() || !kcal) return;
    addEntry({
      name: name.trim(),
      calories: kcal,
      mealType,
      loggedAt: new Date().toISOString(),
      photoDataUrl: photoPreview || undefined,
      source: photoPreview ? "photo-ai" : "manual",
    });
    setPhotoPreview(null);
    setEstimateNote(null);
    setName("");
    setCalories("");
    if (fileRef.current) fileRef.current.value = "";
  }

  const recent = [...entries]
    .sort((a, b) => b.loggedAt.localeCompare(a.loggedAt))
    .slice(0, 20);

  return (
    <div className="nutrition-page">
      <section className="planner-output-card mb-4">
        <h2 className="h5 fw-bold mb-3">卡路里總覽</h2>
        <div className="planner-summary-grid">
          <div className="planner-stat-card">
            <div className="planner-stat-label">今日攝取</div>
            <div className="planner-stat-value">{dayStats.totalIntake} kcal</div>
          </div>
          <div className="planner-stat-card">
            <div className="planner-stat-label">本週攝取</div>
            <div className="planner-stat-value">{weekStats.totalIntake} kcal</div>
          </div>
          <div className="planner-stat-card">
            <div className="planner-stat-label">本月攝取</div>
            <div className="planner-stat-value">{monthStats.totalIntake} kcal</div>
          </div>
          <div className="planner-stat-card">
            <div className="planner-stat-label">平均每日攝取</div>
            <div className="planner-stat-value">{avgIntake} kcal</div>
          </div>
        </div>
        {tdee ? (
          <div className="mt-3 small">
            <p className="mb-1">
              估算每日消耗約 <strong>{tdee} kcal</strong>（來自運動計劃身體資料）
            </p>
            <p className="text-secondary mb-0">
              今日差額（消耗 − 攝取）：{" "}
              <strong>
                {dayStats.netBalance != null ? `${dayStats.netBalance} kcal` : "—"}
              </strong>
              · 本週平均每日攝取 {weekStats.avgPerDay} kcal · 本月平均{" "}
              {monthStats.avgPerDay} kcal
            </p>
          </div>
        ) : (
          <p className="small text-secondary mt-3 mb-0">
            填寫運動計劃嘅身高、體重、年齡後，可顯示估算每日消耗作對照。
          </p>
        )}
      </section>

      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <section className="planner-output-card mb-4">
            <h2 className="h5 fw-bold mb-3">手動記錄</h2>
            <form onSubmit={onSubmitManual} className="row g-2">
              <div className="col-12">
                <input
                  className="form-control"
                  placeholder="食物名稱"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="col-6">
                <input
                  type="number"
                  className="form-control"
                  placeholder="卡路里 kcal"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                />
              </div>
              <div className="col-6">
                <select
                  className="form-select"
                  value={mealType}
                  onChange={(e) =>
                    setMealType(e.target.value as keyof typeof MEAL_LABELS)
                  }
                >
                  {Object.entries(MEAL_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-primary w-100">
                  加入紀錄
                </button>
              </div>
            </form>
          </section>
        </div>

        <div className="col-12 col-lg-6">
          <section className="planner-output-card mb-4">
            <h2 className="h5 fw-bold mb-3">拍照估算卡路里</h2>
            <p className="small text-secondary">
              影相或選擇圖片，系統會嘗試用 AI 估算份量同卡路里（需伺服器設定
              GEMINI 或 OpenAI key）。
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="form-control mb-2"
              onChange={(e) => onPhotoSelected(e.target.files?.[0] ?? null)}
            />
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="食物預覽"
                className="nutrition-photo-preview rounded-3 mb-2"
              />
            ) : null}
            {estimating ? <p className="small">分析中…</p> : null}
            {estimateNote ? <p className="small text-secondary">{estimateNote}</p> : null}
            {photoPreview && name ? (
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={saveFromPhoto}
              >
                儲存估算結果
              </button>
            ) : null}
          </section>
        </div>
      </div>

      <section className="planner-output-card">
        <h2 className="h5 fw-bold mb-3">最近紀錄</h2>
        {recent.length === 0 ? (
          <p className="small text-secondary mb-0">暫時未有飲食紀錄。</p>
        ) : (
          <ul className="list-group list-group-flush">
            {recent.map((entry) => (
              <li
                key={entry.id}
                className="list-group-item px-0 d-flex justify-content-between align-items-start gap-2"
              >
                <div>
                  <div className="fw-semibold">
                    {entry.name}{" "}
                    <span className="text-secondary fw-normal small">
                      {MEAL_LABELS[entry.mealType]}
                    </span>
                  </div>
                  <div className="small text-secondary">
                    {new Date(entry.loggedAt).toLocaleString("zh-HK")} · {entry.calories}{" "}
                    kcal
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => removeEntry(entry.id)}
                >
                  刪除
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
