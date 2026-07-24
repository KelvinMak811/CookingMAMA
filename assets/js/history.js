document.addEventListener("DOMContentLoaded", () => {
  let selectedDate = new Date();
  let view = "calendar";
  let viewingUserId = getCurrentUserId();

  const calendarView = document.getElementById("calendar-view");
  const timelineView = document.getElementById("timeline-view");
  const quickNav = document.getElementById("date-quick-nav");
  const toggleEl = document.getElementById("user-toggle");

  function isReadOnly() {
    return viewingUserId !== getCurrentUserId();
  }

  function renderToggle() {
    renderUserToggle(toggleEl, viewingUserId, (userId) => {
      viewingUserId = userId;
      renderToggle();
      render();
    });
  }

  function renderQuickNav() {
    const offsets = [-2, -1, 0, 1, 2];
    const records = getCookingRecords(viewingUserId);
    const plans = getMealPlans(viewingUserId);
    quickNav.innerHTML = `
      <div class="date-nav-scroll d-flex gap-2">
        ${offsets
          .map((offset) => {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() + offset);
            const active = isSameDay(d, selectedDate);
            const hasPlan = plans.some((p) => isSameDay(p.plannedDate, d));
            const hasDone = records.some((r) => isSameDay(r.cookedDate, d));
            return `<button type="button" class="btn btn-sm ${active ? "btn-primary" : "btn-light"}" data-offset="${offset}">
              ${d.toLocaleDateString("zh-HK", { month: "short", day: "numeric" })}
              ${hasPlan ? '<span class="dot dot-plan"></span>' : ""}
              ${hasDone ? '<span class="dot dot-done"></span>' : ""}
            </button>`;
          })
          .join("")}
      </div>`;
    quickNav.querySelectorAll("[data-offset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + parseInt(btn.dataset.offset, 10));
        selectedDate = d;
        render();
      });
    });
  }

  function renderCalendar() {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const first = new Date(year, month, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const records = getCookingRecords(viewingUserId);
    const plans = getMealPlans(viewingUserId);

    let html = `<div class="d-flex justify-content-between align-items-center mb-3">
      <button type="button" class="btn btn-light btn-sm" id="cal-prev">←</button>
      <strong>${year}年${month + 1}月</strong>
      <button type="button" class="btn btn-light btn-sm" id="cal-next">→</button>
    </div><div class="calendar-grid mb-3">`;

    for (let i = 0; i < startDay; i++) html += `<div></div>`;
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const selected = isSameDay(d, selectedDate);
      const hasPlan = plans.some((p) => isSameDay(p.plannedDate, d));
      const hasDone = records.some((r) => isSameDay(r.cookedDate, d));
      html += `<button type="button" class="calendar-day ${selected ? "selected" : ""}" data-day="${day}">
        ${day}
        <div>${hasPlan ? '<span class="dot dot-plan"></span>' : ""}${hasDone ? '<span class="dot dot-done"></span>' : ""}</div>
      </button>`;
    }
    html += `</div><div id="day-panel"></div>`;
    calendarView.innerHTML = html;

    document.getElementById("cal-prev")?.addEventListener("click", () => {
      selectedDate = new Date(year, month - 1, 1);
      render();
    });
    document.getElementById("cal-next")?.addEventListener("click", () => {
      selectedDate = new Date(year, month + 1, 1);
      render();
    });
    calendarView.querySelectorAll("[data-day]").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedDate = new Date(year, month, parseInt(btn.dataset.day, 10));
        render();
      });
    });
    renderDayPanel();
  }

  function renderDayPanel() {
    const panel = document.getElementById("day-panel");
    if (!panel) return;
    const records = getCookingRecords(viewingUserId).filter((r) => isSameDay(r.cookedDate, selectedDate));
    const plans = getMealPlans(viewingUserId).filter((p) => isSameDay(p.plannedDate, selectedDate));
    const readOnly = isReadOnly();

    let html = `<h6 class="fw-bold mb-3">${formatDateHK(selectedDate)}</h6>`;
    if (plans.length === 0 && records.length === 0) {
      html += '<p class="text-secondary small">呢日暫時冇煮食計劃或紀錄</p>';
    }
    plans.forEach((plan) => {
      html += `<div class="card border-0 shadow-sm mb-2 border-start border-info border-3">
        <div class="card-body py-3 d-flex justify-content-between align-items-start">
          <div>
            <span class="badge bg-info mb-1">預定</span>
            <div class="fw-semibold">${plan.recipeName}</div>
            <small class="text-secondary">${plan.servings} 人 × ${plan.mealBatches} 餐</small>
            <div><a href="${recipePageUrl(plan.recipeId)}" class="btn btn-sm btn-outline-primary mt-2">睇菜式</a></div>
          </div>
          ${readOnly ? "" : `<button type="button" class="btn btn-link text-secondary p-0" data-remove-plan="${plan.id}">✕</button>`}
        </div>
      </div>`;
    });
    records.forEach((rec) => {
      const stars = rec.rating ? "★".repeat(rec.rating) : "";
      html += `<div class="card border-0 shadow-sm mb-2 border-start border-success border-3">
        <div class="card-body py-3">
          <span class="badge bg-success mb-1">已完成</span>
          <div class="fw-semibold">${rec.recipeName}</div>
          <small class="text-secondary">${stars}</small>
        </div>
      </div>`;
    });
    panel.innerHTML = html;
    if (readOnly) return;
    panel.querySelectorAll("[data-remove-plan]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setMealPlans(
          getMealPlans(viewingUserId).filter((p) => p.id !== btn.dataset.removePlan),
          viewingUserId
        );
        render();
      });
    });
  }

  function renderTimeline() {
    const records = [...getCookingRecords(viewingUserId)].sort(
      (a, b) => new Date(b.cookedDate) - new Date(a.cookedDate)
    );
    const plans = [...getMealPlans(viewingUserId)].sort(
      (a, b) => new Date(a.plannedDate) - new Date(b.plannedDate)
    );
    const events = [
      ...plans.map((p) => ({ type: "plan", date: p.plannedDate, data: p })),
      ...records.map((r) => ({ type: "done", date: r.cookedDate, data: r })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (events.length === 0) {
      timelineView.innerHTML = '<p class="text-secondary text-center py-4">暫時冇煮食紀錄</p>';
      return;
    }
    timelineView.innerHTML = events
      .map((ev) => {
        if (ev.type === "plan") {
          const p = ev.data;
          return `<div class="card border-0 shadow-sm mb-2">
            <div class="card-body">
              <span class="badge bg-info">預定 · ${formatDateHK(p.plannedDate)}</span>
              <div class="fw-semibold mt-1">${p.recipeName}</div>
            </div>
          </div>`;
        }
        const r = ev.data;
        return `<div class="card border-0 shadow-sm mb-2">
          <div class="card-body">
            <span class="badge bg-success">已完成 · ${formatDateHK(r.cookedDate)}</span>
            <div class="fw-semibold mt-1">${r.recipeName}</div>
          </div>
        </div>`;
      })
      .join("");
  }

  function render() {
    renderQuickNav();
    if (view === "calendar") {
      calendarView.classList.remove("d-none");
      timelineView.classList.add("d-none");
      renderCalendar();
    } else {
      calendarView.classList.add("d-none");
      timelineView.classList.remove("d-none");
      renderTimeline();
    }
  }

  document.getElementById("view-calendar")?.addEventListener("change", () => {
    view = "calendar";
    render();
  });
  document.getElementById("view-timeline")?.addEventListener("change", () => {
    view = "timeline";
    render();
  });

  renderToggle();
  render();
});
