(function () {
  const STORAGE_KEY = "smartcook_workout_profiles";

  const SOURCE_LINKS = {
    cdcGuidelines: {
      title: "CDC 成人身體活動指引",
      org: "CDC",
      url: "https://www.cdc.gov/physical-activity-basics/guidelines/index.html",
      note: "每週至少 150 分鐘中等強度帶氧 + 2 日肌力訓練。",
    },
    cdcAdults: {
      title: "CDC 成人運動量說明",
      org: "CDC",
      url: "https://www.cdc.gov/physical-activity-basics/adding-adults/what-counts.html",
      note: "說明強度、分配方式與肌力訓練基本做法。",
    },
    niaFourTypes: {
      title: "NIA 四大運動元素",
      org: "NIA",
      url: "https://www.nia.nih.gov/health/exercise-and-physical-activity/four-types-exercise-and-physical-activity",
      note: "耐力、力量、平衡、柔軟度都應兼顧。",
    },
    niaGetStarted: {
      title: "NIA 新手開始運動",
      org: "NIA",
      url: "https://www.nia.nih.gov/health/exercise-and-physical-activity/how-older-adults-can-get-started-exercise",
      note: "循序漸進起步，適合需要保守入門的人。",
    },
    nhsStrengthFlex: {
      title: "NHS Strength and Flex 動作影片",
      org: "NHS",
      url: "https://www.nhs.uk/live-well/exercise/strength-and-flex-exercise-plan-how-to-videos/",
      note: "包含 sit-to-stand、standing press-up、squat 等教學。",
    },
    nhsWarmup: {
      title: "NHS 基本熱身影片",
      org: "NHS",
      url: "https://www.nhs.uk/live-well/exercise/strength-and-resistance/body-blast-warm-up/",
      note: "訓練前可先跟住做 5 至 10 分鐘熱身。",
    },
    nhsWalking: {
      title: "NHS Walking for Health",
      org: "NHS",
      url: "https://www.nhs.uk/live-well/exercise/walking-for-health/",
      note: "適合新手用步行建立帶氧底子。",
    },
    nhsPilates: {
      title: "NHS Pilates for Beginners",
      org: "NHS",
      url: "https://www.nhs.uk/live-well/exercise/pilates-and-yoga/pilates-for-beginners/",
      note: "改善核心控制、姿勢與活動度。",
    },
  };

  const MOVEMENT_LIBRARY = {
    lower: {
      none: [
        { name: "Sit-to-Stand", reps: "8-12 次", source: "nhsStrengthFlex" },
        { name: "Box Squat / 椅子深蹲", reps: "8-12 次", source: "nhsStrengthFlex" },
        { name: "Assisted Split Squat", reps: "6-10 次/邊", source: "nhsStrengthFlex" },
      ],
      bands: [
        { name: "Band Squat", reps: "8-12 次", source: "nhsStrengthFlex" },
        { name: "Band Romanian Deadlift", reps: "8-12 次", source: "cdcAdults" },
      ],
      dumbbells: [
        { name: "Goblet Squat", reps: "8-10 次", source: "cdcAdults" },
        { name: "Dumbbell Romanian Deadlift", reps: "8-10 次", source: "cdcAdults" },
        { name: "Reverse Lunge", reps: "6-8 次/邊", source: "nhsStrengthFlex" },
      ],
    },
    push: {
      none: [
        { name: "Wall Push-Up", reps: "8-12 次", source: "niaFourTypes" },
        { name: "Incline Push-Up", reps: "6-10 次", source: "nhsStrengthFlex" },
      ],
      bands: [
        { name: "Band Chest Press", reps: "8-12 次", source: "cdcAdults" },
        { name: "Standing Press-Up", reps: "8-12 次", source: "nhsStrengthFlex" },
      ],
      dumbbells: [
        { name: "Dumbbell Floor Press", reps: "8-10 次", source: "cdcAdults" },
        { name: "Seated Dumbbell Shoulder Press", reps: "8-10 次", source: "cdcAdults" },
      ],
    },
    pull: {
      none: [
        { name: "Prone T Raise / 肩胛夾背", reps: "8-12 次", source: "nhsPilates" },
        { name: "Doorframe Row Isometric", reps: "20-30 秒", source: "niaFourTypes" },
      ],
      bands: [
        { name: "Band Row", reps: "8-12 次", source: "cdcAdults" },
        { name: "Band Pull-Apart", reps: "10-15 次", source: "nhsPilates" },
      ],
      dumbbells: [
        { name: "One-Arm Dumbbell Row", reps: "8-10 次/邊", source: "cdcAdults" },
        { name: "Chest-Supported Row", reps: "8-10 次", source: "cdcAdults" },
      ],
    },
    core: {
      any: [
        { name: "Dead Bug", reps: "6-10 次/邊", source: "nhsPilates" },
        { name: "Bird Dog", reps: "6-10 次/邊", source: "nhsPilates" },
        { name: "Glute Bridge", reps: "10-15 次", source: "nhsPilates" },
        { name: "Side Plank (膝蓋版)", reps: "15-25 秒/邊", source: "nhsPilates" },
      ],
    },
    cardio: {
      walk: { name: "Brisk Walk / 快步行", source: "nhsWalking" },
      bike: { name: "Easy Bike Ride", source: "cdcGuidelines" },
      treadmill: { name: "Treadmill Walk", source: "cdcGuidelines" },
    },
    mobility: [
      { name: "胸椎伸展 + 開胸", source: "nhsStrengthFlex" },
      { name: "髖屈肌 / 大腿前側伸展", source: "nhsStrengthFlex" },
      { name: "小腿伸展", source: "nhsStrengthFlex" },
      { name: "肩膊活動度練習", source: "nhsStrengthFlex" },
    ],
  };

  const form = document.getElementById("workout-profile-form");
  const output = document.getElementById("workout-plan-output");
  const sampleBtn = document.getElementById("planner-load-sample");
  const referenceList = document.getElementById("exercise-reference-list");

  if (!form || !output || !referenceList) return;

  function safe(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function currentUserKey() {
    if (typeof getCurrentUserId === "function") {
      return getCurrentUserId() || "guest";
    }
    return "guest";
  }

  function loadStoredProfiles() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveProfile(profile) {
    const all = loadStoredProfiles();
    all[currentUserKey()] = { ...profile, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  function loadProfile() {
    const all = loadStoredProfiles();
    return all[currentUserKey()] || null;
  }

  function getCheckedValues(name) {
    return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((el) => el.value);
  }

  function syncEquipmentNoneRule() {
    const noneInput = form.querySelector('input[name="equipment"][value="none"]');
    const otherInputs = Array.from(form.querySelectorAll('input[name="equipment"]')).filter((el) => el.value !== "none");
    if (!noneInput) return;

    otherInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (input.checked) noneInput.checked = false;
        if (!otherInputs.some((el) => el.checked)) noneInput.checked = true;
      });
    });

    noneInput.addEventListener("change", () => {
      if (noneInput.checked) {
        otherInputs.forEach((input) => {
          input.checked = false;
        });
      }
    });
  }

  function fillForm(profile) {
    Object.entries(profile || {}).forEach(([key, value]) => {
      if (key === "equipment" && Array.isArray(value)) {
        form.querySelectorAll('input[name="equipment"]').forEach((input) => {
          input.checked = value.includes(input.value);
        });
        return;
      }
      const field = form.elements[key];
      if (!field) return;
      field.value = value;
    });
  }

  function collectProfile() {
    const data = Object.fromEntries(new FormData(form).entries());
    data.age = Number(data.age || 0);
    data.heightCm = Number(data.heightCm || 0);
    data.weightKg = Number(data.weightKg || 0);
    data.bodyFat = Number(data.bodyFat || 0);
    data.restingHr = Number(data.restingHr || 0);
    data.waistCm = Number(data.waistCm || 0);
    data.trainingDays = Math.max(2, Math.min(6, Number(data.trainingDays || 3)));
    data.sessionMinutes = Math.max(15, Math.min(120, Number(data.sessionMinutes || 35)));
    data.dailySteps = Number(data.dailySteps || 0);
    data.sleepHours = Number(data.sleepHours || 0);
    data.stressLevel = Number(data.stressLevel || 3);
    data.equipment = getCheckedValues("equipment");
    if (!data.equipment.length) data.equipment = ["none"];
    return data;
  }

  function computeBmi(heightCm, weightKg) {
    if (!heightCm || !weightKg) return null;
    const meters = heightCm / 100;
    return weightKg / (meters * meters);
  }

  function bmiLabel(bmi) {
    if (!bmi) return "未提供";
    if (bmi < 18.5) return "偏輕";
    if (bmi < 24) return "一般";
    if (bmi < 27) return "偏高";
    return "較高";
  }

  function getEquipmentTier(equipment) {
    if (equipment.includes("dumbbells")) return "dumbbells";
    if (equipment.includes("bands")) return "bands";
    return "none";
  }

  function cardioMode(profile) {
    if (profile.equipment.includes("bike")) return MOVEMENT_LIBRARY.cardio.bike;
    if (profile.equipment.includes("treadmill")) return MOVEMENT_LIBRARY.cardio.treadmill;
    return MOVEMENT_LIBRARY.cardio.walk;
  }

  function pick(list, count) {
    return list.slice(0, Math.min(count, list.length));
  }

  function buildStrengthBlock(profile, variant) {
    const tier = getEquipmentTier(profile.equipment);
    const lowerList = MOVEMENT_LIBRARY.lower[tier] || MOVEMENT_LIBRARY.lower.none;
    const pushList = MOVEMENT_LIBRARY.push[tier] || MOVEMENT_LIBRARY.push.none;
    const pullList = MOVEMENT_LIBRARY.pull[tier] || MOVEMENT_LIBRARY.pull.none;
    const coreList = MOVEMENT_LIBRARY.core.any;

    const lower = lowerList[variant % lowerList.length];
    const push = pushList[variant % pushList.length];
    const pull = pullList[variant % pullList.length];
    const core = coreList[variant % coreList.length];

    const baseSets = profile.experience === "new" ? 2 : 3;
    const rpe = profile.sleepHours && profile.sleepHours < 6 ? "RPE 5-6" : "RPE 6-7";

    return {
      title: variant === 0 ? "全身力量 A" : "全身力量 B",
      focus: "下肢、推、拉、核心基本模式",
      duration: `${Math.max(20, profile.sessionMinutes - 5)} 分鐘`,
      items: [
        { label: lower.name, detail: `${baseSets} 組 x ${lower.reps}`, source: lower.source },
        { label: push.name, detail: `${baseSets} 組 x ${push.reps}`, source: push.source },
        { label: pull.name, detail: `${baseSets} 組 x ${pull.reps}`, source: pull.source },
        { label: core.name, detail: `${baseSets} 組 x ${core.reps}`, source: core.source },
      ],
      coaching: `每組保留 2-3 下餘力，目標 ${rpe}；組間休息 60-90 秒。`,
    };
  }

  function buildCardioBlock(profile, longDay) {
    const cardio = cardioMode(profile);
    const minutes = longDay ? Math.max(25, profile.sessionMinutes) : Math.max(15, Math.min(30, profile.sessionMinutes - 5));
    const intensity =
      profile.primaryGoal === "cardio"
        ? "RPE 6，能講短句"
        : "RPE 4-5，能對話但感到有在做運動";

    return {
      title: longDay ? "低衝擊心肺耐力" : "恢復式帶氧",
      focus: "建立心肺底子，避免一開始太高衝擊",
      duration: `${minutes} 分鐘`,
      items: [
        { label: cardio.name, detail: `${minutes} 分鐘`, source: cardio.source },
        { label: "收操慢行", detail: "3-5 分鐘", source: "nhsWalking" },
      ],
      coaching: `維持 ${intensity}，訓練後應覺得有做過但唔會散晒。`,
    };
  }

  function buildMobilityBlock(profile) {
    const mobilityItems = pick(MOVEMENT_LIBRARY.mobility, 3);
    return {
      title: "活動度 + 核心穩定",
      focus: profile.workStyle === "desk" ? "對抗久坐緊繃" : "恢復與關節活動控制",
      duration: `${Math.max(15, Math.min(30, profile.sessionMinutes - 5))} 分鐘`,
      items: mobilityItems.map((item) => ({
        label: item.name,
        detail: "每個動作 30-45 秒 / 6-8 次",
        source: item.source,
      })),
      coaching: "動作慢、呼吸穩、唔追求幅度，重視控制感。",
    };
  }

  function goalFocus(profile) {
    switch (profile.primaryGoal) {
      case "fat-loss":
        return "先提高每週總活動量，再逐步穩定力量日與步行量。";
      case "strength":
        return "用 2 至 3 日全身力量建立基本推、拉、蹲、髖主導模式。";
      case "mobility":
        return "每次都加入較多活動度與核心控制，配合低衝擊帶氧。";
      case "posture":
        return "強化臀部、上背與核心，改善久坐帶來的前傾與緊繃。";
      case "cardio":
        return "保持 2 日肌力，再把更多時間放在可持續帶氧。";
      default:
        return "重點先係建立規律，令你每週都穩定完成。";
    }
  }

  function readinessFlags(profile, bmi) {
    const flags = [];
    if (profile.medicalNotes) flags.push("有醫療狀況資料，開始前宜先與醫護確認訓練界線。");
    if (profile.injuries) flags.push("有傷患 / 痛症描述，任何令痛楚加劇的動作都應改輕或暫停。");
    if (profile.age >= 55) flags.push("年齡較高，計劃會更重視平衡、關節控制與漸進加量。");
    if (profile.sleepHours && profile.sleepHours < 6) flags.push("睡眠偏少，恢復力可能較弱，本週應以保守強度開始。");
    if (profile.stressLevel >= 4) flags.push("生活壓力偏高，先守住頻率，再慢慢增加總量。");
    if (profile.dailySteps && profile.dailySteps < 4000) flags.push("日常活動量偏低，建議先把步行量穩定加上去。");
    if (bmi && bmi >= 27) flags.push("體重負荷較高時，先用低衝擊帶氧與控制式力量動作會更穩陣。");
    return flags;
  }

  function analysisSummary(profile) {
    const bmi = computeBmi(profile.heightCm, profile.weightKg);
    const trainingAgeLabel =
      profile.experience === "new" ? "完全新手" : profile.experience === "restart" ? "重啟型新手" : "未系統化初階";

    return {
      bmi,
      cards: [
        { label: "主要目標", value: goalLabel(profile.primaryGoal) },
        { label: "訓練背景", value: trainingAgeLabel },
        { label: "每週安排", value: `${profile.trainingDays} 日 / 每次約 ${profile.sessionMinutes} 分鐘` },
        { label: "體重指標", value: bmi ? `${bmi.toFixed(1)} BMI (${bmiLabel(bmi)})` : "未提供身高體重" },
      ],
      focusText: goalFocus(profile),
      flags: readinessFlags(profile, bmi),
    };
  }

  function goalLabel(goal) {
    return (
      {
        habit: "建立習慣",
        "fat-loss": "減脂 / 提升代謝",
        strength: "增加力量",
        mobility: "改善活動度",
        posture: "改善姿勢",
        cardio: "增強心肺",
      }[goal] || "建立習慣"
    );
  }

  function buildWeeklyPlan(profile) {
    const days = [];
    const strengthA = buildStrengthBlock(profile, 0);
    const strengthB = buildStrengthBlock(profile, 1);
    const cardio = buildCardioBlock(profile, false);
    const longCardio = buildCardioBlock(profile, true);
    const mobility = buildMobilityBlock(profile);

    days.push(strengthA);
    if (profile.trainingDays >= 3) days.push(cardio);
    days.push(strengthB);
    if (profile.trainingDays >= 4) days.push(mobility);
    if (profile.trainingDays >= 5) days.push(longCardio);
    if (profile.trainingDays >= 6) {
      days.push({
        title: "主動恢復 / 技術日",
        focus: "散步、伸展、姿勢控制",
        duration: `${Math.max(20, profile.sessionMinutes - 10)} 分鐘`,
        items: [
          { label: cardioMode(profile).name, detail: "15-25 分鐘輕鬆節奏", source: cardioMode(profile).source },
          { label: "NHS 熱身或 Pilates 基礎", detail: "10-15 分鐘", source: "nhsPilates" },
        ],
        coaching: "以覺得身體順返為目標，唔好做成第 6 日硬操。",
      });
    }

    return days.slice(0, profile.trainingDays);
  }

  function buildProgression(profile) {
    const focus = profile.experience === "new" ? "學動作與建立頻率" : "恢復規律與加回基本訓練量";
    return [
      `第 1 週：先熟習動作與節奏，全部維持 RPE 5-6，重點係完成而唔係搏盡。`,
      `第 2 週：如果完成度高且無明顯痛症，每個主動作加 1-2 次，或其中 1 個動作加 1 組。`,
      `第 3 週：大部分動作提升到 RPE 6-7；帶氧日可加 5-10 分鐘或略加步速。`,
      `第 4 週：維持動作品質，唔使再大幅加量；回顧 ${focus} 是否已變得較自然。`,
    ];
  }

  function warmupAdvice(profile) {
    const time = profile.sessionMinutes <= 25 ? "4-5" : "6-8";
    return [
      `先做 ${time} 分鐘熱身：原地踏步、肩膊環繞、髖部活動、踝關節活動。`,
      "第一個力量動作可先做 1 組超輕鬆版本當作技術熱身。",
      "任何麻痺、刺痛、頭暈或胸口不適，立即停止並求醫。",
    ];
  }

  function collectReferenceKeys(planDays) {
    const keys = new Set(["cdcGuidelines", "cdcAdults", "niaFourTypes", "nhsStrengthFlex", "nhsWarmup"]);
    planDays.forEach((day) => {
      (day.items || []).forEach((item) => {
        if (item.source) keys.add(item.source);
      });
    });
    return Array.from(keys);
  }

  function renderReferences(keys) {
    referenceList.innerHTML = keys
      .map((key) => SOURCE_LINKS[key])
      .filter(Boolean)
      .map(
        (source) => `
          <a class="reference-card text-decoration-none" href="${safe(source.url)}" target="_blank" rel="noreferrer">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <div>
                <div class="reference-org">${safe(source.org)}</div>
                <div class="reference-title">${safe(source.title)}</div>
                <div class="reference-note">${safe(source.note)}</div>
              </div>
              <span class="reference-arrow">↗</span>
            </div>
          </a>
        `
      )
      .join("");
  }

  function renderPlan(profile) {
    const summary = analysisSummary(profile);
    const weeklyPlan = buildWeeklyPlan(profile);
    const progression = buildProgression(profile);
    const warmup = warmupAdvice(profile);
    const refs = collectReferenceKeys(weeklyPlan);

    renderReferences(refs);

    const displayName =
      profile.nickname ||
      (typeof getCurrentUser === "function" && getCurrentUser() ? getCurrentUser().name : "你");

    output.innerHTML = `
      <div class="d-flex justify-content-between align-items-start gap-2 mb-3">
        <div>
          <h2 class="h5 fw-bold mb-1">${safe(displayName)} 的 4 星期入門計劃</h2>
          <p class="small text-secondary mb-0">以新手安全、穩定習慣同逐步進展為核心。</p>
        </div>
        <span class="badge text-bg-primary">${safe(goalLabel(profile.primaryGoal))}</span>
      </div>

      <div class="planner-summary-grid mb-3">
        ${summary.cards
          .map(
            (card) => `
              <div class="planner-stat-card">
                <div class="planner-stat-label">${safe(card.label)}</div>
                <div class="planner-stat-value">${safe(card.value)}</div>
              </div>
            `
          )
          .join("")}
      </div>

      <section class="mb-3">
        <h3 class="h6 fw-bold mb-2">分析重點</h3>
        <p class="small mb-2">${safe(summary.focusText)}</p>
        ${
          summary.flags.length
            ? `<ul class="small text-secondary mb-0">${summary.flags.map((flag) => `<li>${safe(flag)}</li>`).join("")}</ul>`
            : `<p class="small text-secondary mb-0">目前未見明顯高風險訊號，可由保守強度開始，再觀察恢復與動作品質。</p>`
        }
      </section>

      <section class="mb-3">
        <h3 class="h6 fw-bold mb-2">每週訓練安排</h3>
        <div class="planner-week-list">
          ${weeklyPlan
            .map(
              (day, index) => `
                <article class="planner-day-card">
                  <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                    <div>
                      <div class="planner-day-label">Day ${index + 1}</div>
                      <h4 class="h6 fw-bold mb-1">${safe(day.title)}</h4>
                      <p class="small text-secondary mb-0">${safe(day.focus)}</p>
                    </div>
                    <span class="badge text-bg-light">${safe(day.duration)}</span>
                  </div>
                  <ul class="planner-movement-list">
                    ${day.items
                      .map(
                        (item) => `
                          <li>
                            <strong>${safe(item.label)}</strong>
                            <span>${safe(item.detail)}</span>
                          </li>
                        `
                      )
                      .join("")}
                  </ul>
                  <p class="small text-secondary mb-0">${safe(day.coaching)}</p>
                </article>
              `
            )
            .join("")}
        </div>
      </section>

      <section class="mb-3">
        <h3 class="h6 fw-bold mb-2">熱身與安全提醒</h3>
        <ul class="small text-secondary mb-0">
          ${warmup.map((item) => `<li>${safe(item)}</li>`).join("")}
        </ul>
      </section>

      <section>
        <h3 class="h6 fw-bold mb-2">4 星期漸進方式</h3>
        <ul class="small text-secondary mb-0">
          ${progression.map((item) => `<li>${safe(item)}</li>`).join("")}
        </ul>
      </section>
    `;
  }

  function loadSampleProfile() {
    fillForm({
      nickname: "阿Ling",
      age: 31,
      sex: "female",
      heightCm: 160,
      weightKg: 63,
      bodyFat: 31,
      restingHr: 74,
      waistCm: 83,
      primaryGoal: "fat-loss",
      experience: "new",
      fitnessLevel: "low",
      trainingDays: 3,
      sessionMinutes: 30,
      dailySteps: 4200,
      sleepHours: 6.5,
      stressLevel: 3,
      workStyle: "desk",
      trainingHistory: "平時返工坐得多，之前有斷斷續續跟 YouTube 做運動，但冇乜系統。",
      injuries: "落樓梯時膝頭有時唔舒服，唔想做跳躍。",
      medicalNotes: "",
      balanceLevel: "moderate",
      mobilityLevel: "tight",
      equipment: ["mat", "bands", "bench"],
      locationPreference: "home",
      trainingPreference: "balanced",
      notes: "平日晚飯前做最好，星期六可以行耐啲。",
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const profile = collectProfile();
    saveProfile(profile);
    renderPlan(profile);
  });

  if (sampleBtn) {
    sampleBtn.addEventListener("click", () => {
      loadSampleProfile();
      renderPlan(collectProfile());
    });
  }

  syncEquipmentNoneRule();
  renderReferences(["cdcGuidelines", "niaFourTypes", "nhsStrengthFlex", "nhsWarmup"]);

  const existing = loadProfile();
  if (existing) {
    fillForm(existing);
    renderPlan(existing);
  }
})();
