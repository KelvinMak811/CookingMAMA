"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DEFAULT_PROFILE,
  EQUIPMENT_OPTIONS,
  SAMPLE_PROFILE,
  generateNextPlan,
  generateWorkoutPlan,
  suggestNextStageProfile,
  type EquipmentId,
  type GeneratedPlan,
  type WorkoutProfile,
} from "@/lib/workoutPlanner";
import { getAccountName } from "@/lib/accounts";
import { useAccountStore } from "@/stores/accountStore";
import {
  loadFitnessData,
  saveWorkoutPlanForAccount,
  type BmiHistoryEntry,
  type SavedFitnessPlan,
} from "@/lib/fitnessStorage";
import { BmiHistoryChart } from "@/components/fitness/BmiHistoryChart";
import { WorkoutPlanView } from "@/components/fitness/WorkoutPlanView";
import { ProfileSummarySection } from "@/components/fitness/ProfileSummarySection";

function toggleEquipment(
  current: EquipmentId[],
  value: EquipmentId
): EquipmentId[] {
  if (value === "none") return ["none"];
  const withoutNone = current.filter((item) => item !== "none");
  if (withoutNone.includes(value)) {
    const next = withoutNone.filter((item) => item !== value);
    return next.length ? next : ["none"];
  }
  return [...withoutNone, value];
}

function FitnessPlannerClientInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNextStage = searchParams.get("next") === "1";
  const currentUserId = useAccountStore((s) => s.currentUserId);
  const userKey = currentUserId || "guest";
  const fallbackName = currentUserId ? getAccountName(currentUserId) : "你";
  const [profile, setProfile] = useState<WorkoutProfile>(DEFAULT_PROFILE);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [bmiHistory, setBmiHistory] = useState<BmiHistoryEntry[]>([]);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [previousPlan, setPreviousPlan] = useState<SavedFitnessPlan | null>(
    null
  );
  const [historyCount, setHistoryCount] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const data = loadFitnessData(userKey);
    const baseProfile = data.profile
      ? { ...DEFAULT_PROFILE, ...data.profile }
      : DEFAULT_PROFILE;

    if (isNextStage && data.profile) {
      setProfile(suggestNextStageProfile(baseProfile));
      setPreviousPlan(data.savedPlan);
      setPlan(null);
      setSavedAt(null);
    } else {
      setProfile(baseProfile);
      if (data.savedPlan?.plan) {
        setPlan(data.savedPlan.plan);
        setSavedAt(data.savedPlan.generatedAt);
        setPreviousPlan(data.savedPlan);
      } else if (data.profile) {
        setPlan(generateWorkoutPlan(data.profile, fallbackName));
        setPreviousPlan(null);
      } else {
        setPreviousPlan(null);
      }
    }

    setBmiHistory(data.bmiHistory);
    setHistoryCount(data.planHistory?.length ?? 0);
    setHydrated(true);
  }, [userKey, fallbackName, isNextStage]);

  const defaultReferences = useMemo(
    () => generateWorkoutPlan(DEFAULT_PROFILE).references.slice(0, 4),
    []
  );

  function updateField<K extends keyof WorkoutProfile>(
    key: K,
    value: WorkoutProfile[K]
  ) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  function persistPlan(nextProfile: WorkoutProfile, nextPlan: GeneratedPlan) {
    const saved = saveWorkoutPlanForAccount(userKey, nextProfile, nextPlan);
    setPlan(nextPlan);
    setBmiHistory(saved.bmiHistory);
    setSavedAt(saved.savedPlan?.generatedAt ?? null);
    setPreviousPlan(saved.savedPlan);
    setHistoryCount(saved.planHistory?.length ?? 0);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextPlan = isNextStage
      ? generateNextPlan(
          profile,
          previousPlan?.plan ?? null,
          {
            completedAt:
              previousPlan?.completedAt || new Date().toISOString(),
            previousGeneratedAt: previousPlan?.generatedAt,
            stageIndex: historyCount,
          },
          fallbackName
        )
      : generateWorkoutPlan(profile, fallbackName);
    persistPlan(profile, nextPlan);
    router.push("/fitness/plan");
  }

  function loadSample() {
    setProfile(SAMPLE_PROFILE);
    const nextPlan = generateWorkoutPlan(SAMPLE_PROFILE, fallbackName);
    persistPlan(SAMPLE_PROFILE, nextPlan);
  }

  if (!hydrated) {
    return <div className="text-secondary small py-4">載入運動計劃中…</div>;
  }

  return (
    <div className="row g-4">
      <div className="col-12 col-xl-7">
        {isNextStage ? (
          <section className="planner-next-banner mb-3">
            <div>
              <h2 className="h6 fw-bold mb-1">下一步：訂製新階段計劃</h2>
              <p className="small text-secondary mb-0">
                已用上一階段資料預填，並略為調高經驗／時長建議。你可以改目標、每週日數、每次時間、運動類型（綜合／游泳／足球／羽毛球）再生成。
                {previousPlan?.plan
                  ? ` 上一份：${previousPlan.plan.goalLabel}。`
                  : ""}
              </p>
            </div>
            <Link href="/fitness/plan" className="btn btn-outline-secondary btn-sm">
              返回計劃頁
            </Link>
          </section>
        ) : null}

        <form className="planner-form" onSubmit={onSubmit}>
          <section className="planner-section">
            <div className="planner-section-title">
              <h2 className="h5 fw-bold mb-1">1. 基本資料</h2>
              <p className="small text-secondary mb-0">填得越仔細，分析同訓練安排會越準。</p>
            </div>
            <div className="row g-3">
              <div className="col-6">
                <label className="form-label">稱呼 / 暱稱</label>
                <input
                  className="form-control"
                  value={profile.nickname}
                  onChange={(e) => updateField("nickname", e.target.value)}
                  placeholder="例如：阿明"
                />
              </div>
              <div className="col-6">
                <label className="form-label">年齡</label>
                <input
                  type="number"
                  className="form-control"
                  min={13}
                  max={90}
                  value={profile.age || ""}
                  onChange={(e) => updateField("age", Number(e.target.value) || 0)}
                  placeholder="例如：28"
                />
              </div>
              <div className="col-6">
                <label className="form-label">性別</label>
                <select
                  className="form-select"
                  value={profile.sex}
                  onChange={(e) => updateField("sex", e.target.value)}
                >
                  <option value="">不指定</option>
                  <option value="female">女</option>
                  <option value="male">男</option>
                  <option value="other">其他 / 不想透露</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">身高 (cm)</label>
                <input
                  type="number"
                  className="form-control"
                  value={profile.heightCm || ""}
                  onChange={(e) => updateField("heightCm", Number(e.target.value) || 0)}
                  placeholder="例如：165"
                />
              </div>
              <div className="col-6">
                <label className="form-label">體重 (kg)</label>
                <input
                  type="number"
                  className="form-control"
                  step="0.1"
                  value={profile.weightKg || ""}
                  onChange={(e) => updateField("weightKg", Number(e.target.value) || 0)}
                  placeholder="例如：62"
                />
              </div>
              <div className="col-6">
                <label className="form-label">體脂率 (%)</label>
                <input
                  type="number"
                  className="form-control"
                  step="0.1"
                  value={profile.bodyFat || ""}
                  onChange={(e) => updateField("bodyFat", Number(e.target.value) || 0)}
                  placeholder="選填"
                />
              </div>
              <div className="col-6">
                <label className="form-label">安靜心跳 (bpm)</label>
                <input
                  type="number"
                  className="form-control"
                  value={profile.restingHr || ""}
                  onChange={(e) => updateField("restingHr", Number(e.target.value) || 0)}
                  placeholder="選填"
                />
              </div>
              <div className="col-6">
                <label className="form-label">腰圍 (cm)</label>
                <input
                  type="number"
                  className="form-control"
                  step="0.1"
                  value={profile.waistCm || ""}
                  onChange={(e) => updateField("waistCm", Number(e.target.value) || 0)}
                  placeholder="選填"
                />
              </div>
            </div>
          </section>

          <section className="planner-section" id="next-stage-prefs">
            <div className="planner-section-title">
              <h2 className="h5 fw-bold mb-1">
                2. 目標與背景
                {isNextStage ? "（可為下一階段調整）" : ""}
              </h2>
              <p className="small text-secondary mb-0">你想改善咩、做過啲乜、而家去到邊。</p>
            </div>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">訓練類型 / 運動項目</label>
                <select
                  className="form-select"
                  value={profile.activityFocus || "general"}
                  onChange={(e) =>
                    updateField(
                      "activityFocus",
                      e.target.value as WorkoutProfile["activityFocus"]
                    )
                  }
                >
                  <option value="general">綜合健身（力量 + 帶氧 + 活動度）</option>
                  <option value="swimming">游泳</option>
                  <option value="soccer">足球</option>
                  <option value="badminton">羽毛球</option>
                </select>
                <div className="form-text">
                  揀運動項目後，週計劃會改成對應嘅技術、體能同恢復安排，每個動作都有可喺站內播放嘅教學影片。
                </div>
              </div>
              <div className="col-12">
                <label className="form-label">主要目標</label>
                <select
                  className="form-select"
                  value={profile.primaryGoal}
                  onChange={(e) =>
                    updateField("primaryGoal", e.target.value as WorkoutProfile["primaryGoal"])
                  }
                >
                  <option value="habit">建立運動習慣</option>
                  <option value="fat-loss">減脂 / 提升代謝</option>
                  <option value="strength">增加力量</option>
                  <option value="mobility">改善柔軟度與活動度</option>
                  <option value="posture">改善姿勢 / 久坐僵硬</option>
                  <option value="cardio">增強心肺</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">訓練經驗</label>
                <select
                  className="form-select"
                  value={profile.experience}
                  onChange={(e) =>
                    updateField("experience", e.target.value as WorkoutProfile["experience"])
                  }
                >
                  <option value="new">完全新手</option>
                  <option value="restart">以前做過，停咗一段時間</option>
                  <option value="some">偶爾有做，但未有系統</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">你覺得自己而家體能</label>
                <select
                  className="form-select"
                  value={profile.fitnessLevel}
                  onChange={(e) =>
                    updateField("fitnessLevel", e.target.value as WorkoutProfile["fitnessLevel"])
                  }
                >
                  <option value="low">偏低，少郁動就攰</option>
                  <option value="moderate">一般</option>
                  <option value="good">算唔錯</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">每週可訓練日數</label>
                <input
                  type="number"
                  className="form-control"
                  min={2}
                  max={6}
                  value={profile.trainingDays}
                  onChange={(e) => updateField("trainingDays", Number(e.target.value) || 3)}
                />
              </div>
              <div className="col-6">
                <label className="form-label">每次可用時間 (分鐘)</label>
                <input
                  type="number"
                  className="form-control"
                  min={15}
                  max={120}
                  value={profile.sessionMinutes}
                  onChange={(e) => updateField("sessionMinutes", Number(e.target.value) || 35)}
                />
              </div>
              <div className="col-6">
                <label className="form-label">日常步數</label>
                <input
                  type="number"
                  className="form-control"
                  value={profile.dailySteps || ""}
                  onChange={(e) => updateField("dailySteps", Number(e.target.value) || 0)}
                  placeholder="例如：6000"
                />
              </div>
              <div className="col-6">
                <label className="form-label">睡眠時間 (小時/晚)</label>
                <input
                  type="number"
                  className="form-control"
                  step="0.5"
                  value={profile.sleepHours || ""}
                  onChange={(e) => updateField("sleepHours", Number(e.target.value) || 0)}
                  placeholder="例如：6.5"
                />
              </div>
              <div className="col-6">
                <label className="form-label">壓力水平</label>
                <select
                  className="form-select"
                  value={profile.stressLevel}
                  onChange={(e) => updateField("stressLevel", Number(e.target.value) || 3)}
                >
                  <option value={1}>1 / 輕鬆</option>
                  <option value={2}>2 / 少少忙</option>
                  <option value={3}>3 / 中等</option>
                  <option value={4}>4 / 偏高</option>
                  <option value={5}>5 / 好大壓力</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">工作型態</label>
                <select
                  className="form-select"
                  value={profile.workStyle}
                  onChange={(e) =>
                    updateField("workStyle", e.target.value as WorkoutProfile["workStyle"])
                  }
                >
                  <option value="desk">長時間坐</option>
                  <option value="mixed">坐企混合</option>
                  <option value="active">需要經常走動</option>
                  <option value="manual">勞動 / 搬運為主</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">運動背景 / 喜歡或討厭嘅訓練</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={profile.trainingHistory}
                  onChange={(e) => updateField("trainingHistory", e.target.value)}
                  placeholder="例如：以前打過波，但好耐冇做；唔鍾意跑步；想改善膝頭力量。"
                />
              </div>
            </div>
          </section>

          <section className="planner-section">
            <div className="planner-section-title">
              <h2 className="h5 fw-bold mb-1">3. 身體限制與安全資料</h2>
              <p className="small text-secondary mb-0">呢部分會影響強度、動作選擇同提醒內容。</p>
            </div>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">目前傷患 / 痛症 / 舊患</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={profile.injuries}
                  onChange={(e) => updateField("injuries", e.target.value)}
                  placeholder="例如：膝頭落樓梯有少少痛、肩膊舉高會緊、下背容易攰。"
                />
              </div>
              <div className="col-12">
                <label className="form-label">已知健康狀況 / 醫療限制</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={profile.medicalNotes}
                  onChange={(e) => updateField("medicalNotes", e.target.value)}
                  placeholder="例如：高血壓、糖尿病、手術後恢復中；冇就留空。"
                />
              </div>
              <div className="col-6">
                <label className="form-label">平衡能力</label>
                <select
                  className="form-select"
                  value={profile.balanceLevel}
                  onChange={(e) =>
                    updateField("balanceLevel", e.target.value as WorkoutProfile["balanceLevel"])
                  }
                >
                  <option value="low">較差，單腳企唔穩</option>
                  <option value="moderate">一般</option>
                  <option value="good">良好</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">關節活動度 / 柔軟度</label>
                <select
                  className="form-select"
                  value={profile.mobilityLevel}
                  onChange={(e) =>
                    updateField("mobilityLevel", e.target.value as WorkoutProfile["mobilityLevel"])
                  }
                >
                  <option value="tight">偏緊</option>
                  <option value="normal">一般</option>
                  <option value="mobile">較靈活</option>
                </select>
              </div>
            </div>
          </section>

          <section className="planner-section">
            <div className="planner-section-title">
              <h2 className="h5 fw-bold mb-1">4. 可用器材與偏好</h2>
              <p className="small text-secondary mb-0">冇器材都得，我會優先編入屋企做到嘅版本。</p>
            </div>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label d-block">你而家有咩器材？</label>
                <div className="chip-check-grid">
                  {EQUIPMENT_OPTIONS.map((option) => {
                    const checked = profile.equipment.includes(option.id);
                    return (
                      <label key={option.id} className="chip-check">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            updateField(
                              "equipment",
                              toggleEquipment(profile.equipment, option.id)
                            )
                          }
                        />
                        <span>{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="col-6">
                <label className="form-label">較想喺邊度做？</label>
                <select
                  className="form-select"
                  value={profile.locationPreference}
                  onChange={(e) =>
                    updateField(
                      "locationPreference",
                      e.target.value as WorkoutProfile["locationPreference"]
                    )
                  }
                >
                  <option value="home">屋企為主</option>
                  <option value="gym">健身室為主</option>
                  <option value="outdoor">戶外為主</option>
                  <option value="pool">泳池為主</option>
                  <option value="court">球場／羽球場為主</option>
                  <option value="mixed">都可以</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">偏好類型</label>
                <select
                  className="form-select"
                  value={profile.trainingPreference}
                  onChange={(e) =>
                    updateField(
                      "trainingPreference",
                      e.target.value as WorkoutProfile["trainingPreference"]
                    )
                  }
                >
                  <option value="balanced">平均啲，力量加心肺</option>
                  <option value="strength">偏力量</option>
                  <option value="cardio">偏帶氧 / 步行</option>
                  <option value="mobility">偏伸展活動度</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">額外備註</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={profile.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="例如：平日晚只有 30 分鐘、唔想跳、鄰居投訴聲音、星期六可以長少少。"
                />
              </div>
            </div>
          </section>

          <div className="d-grid d-md-flex gap-2 mt-3">
            <button type="submit" className="btn btn-primary btn-lg">
              {isNextStage ? "生成並儲存下一階段計劃" : "生成並儲存計劃"}
            </button>
            {!isNextStage ? (
              <button type="button" className="btn btn-outline-secondary" onClick={loadSample}>
                載入示範資料
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="col-12 col-xl-5">
        <div className="planner-side-stack">
          <BmiHistoryChart history={bmiHistory} />

          <section className="planner-output-card">
            <ProfileSummarySection profile={profile} compact showNotes={false} />
          </section>

          <section className="planner-output-card">
            {!plan ? (
              <>
                <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                  <div>
                    <h2 className="h5 fw-bold mb-1">
                      {isNextStage ? "下一階段計劃預覽" : "你的訓練計劃"}
                    </h2>
                    <p className="small text-secondary mb-0">
                      {isNextStage
                        ? "調整左邊資料後提交，會生成延續計劃並存入帳戶。"
                        : "提交表單後會儲存到帳戶，並開啟獨立計劃頁。"}
                    </p>
                  </div>
                  <span className="badge text-bg-light">
                    {isNextStage ? "延續階段" : "4 週入門版"}
                  </span>
                </div>
                <div className="planner-empty-state">
                  <p className="mb-2">未有計劃前，你可以預期會包含：</p>
                  <ul className="small text-secondary mb-0">
                    <li>綜合健身／游泳／足球／羽毛球專項安排</li>
                    <li>每個動作附站內教學影片</li>
                    <li>BMI 記錄同走勢圖</li>
                    <li>登入帳戶後下次可直接打開個人資料同計劃</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
                  <h2 className="h5 fw-bold mb-0">已儲存預覽</h2>
                  <Link href="/fitness/plan" className="btn btn-sm btn-primary">
                    開啟完整計劃頁
                  </Link>
                </div>
                <WorkoutPlanView
                  plan={plan}
                  generatedAt={savedAt}
                  completedAt={previousPlan?.completedAt}
                  compact
                />
              </>
            )}
          </section>

          <section className="planner-output-card">
            <h2 className="h5 fw-bold mb-2">專業設計原則</h2>
            <ul className="small text-secondary mb-0 planner-principles">
              <li>以新手安全同可持續性優先，唔追求第一週就做到好勁。</li>
              <li>綜合健身用力量、帶氧、活動度；球類／游泳則技術 + 體能 + 恢復並重。</li>
              <li>每個動作盡量附官方或可信教學影片，可喺計劃入面直接播放。</li>
              <li>如果睡眠不足、壓力偏高或有傷患訊號，計劃會主動保守。</li>
            </ul>
          </section>

          <section className="planner-output-card">
            <h2 className="h5 fw-bold mb-2">參考來源</h2>
            <p className="small text-secondary mb-2">
              優先引用官方健康機構同運動總會資源，方便你學動作同核對安全提示。
            </p>
            <div className="reference-list small">
              {(plan?.references || defaultReferences).map((source) => (
                <a
                  key={source.url}
                  className="reference-card text-decoration-none"
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <div className="reference-org">{source.org}</div>
                      <div className="reference-title">{source.title}</div>
                      <div className="reference-note">{source.note}</div>
                    </div>
                    <span className="reference-arrow">↗</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function FitnessPlannerClient() {
  return (
    <Suspense fallback={<div className="text-secondary small py-4">載入運動計劃中…</div>}>
      <FitnessPlannerClientInner />
    </Suspense>
  );
}
