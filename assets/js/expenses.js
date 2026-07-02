document.addEventListener("DOMContentLoaded", () => {
  const today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth();

  function renderBarChart(containerId, data, emptyText) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!data.length) {
      el.innerHTML = `<p class="text-secondary small">${emptyText}</p>`;
      return;
    }
    const max = Math.max(...data.map((d) => d.value), 1);
    el.innerHTML = data
      .map(
        (d) => `<div class="bar-chart-row">
          <div class="bar-chart-label" title="${d.label}">${d.label}</div>
          <div class="bar-chart-bar"><div class="bar-chart-fill" style="width:${(d.value / max) * 100}%"></div></div>
          <div class="bar-chart-value">$${d.value.toFixed(0)}</div>
        </div>`
      )
      .join("");
  }

  function render() {
    const items = getShoppingItems();
    const records = getCookingRecords();

    const monthItems = items.filter((i) => {
      if (!i.isBought || !i.boughtAt) return false;
      const d = new Date(i.boughtAt);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const monthRecords = records.filter((r) => {
      const d = new Date(r.cookedDate);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const totalSpent = monthItems.reduce((s, i) => s + (parseFloat(i.price) || 0), 0);
    const mealCount = monthRecords.length;
    const avgPerMeal = mealCount > 0 ? totalSpent / mealCount : 0;

    document.getElementById("expense-month-nav").innerHTML = `
      <button type="button" class="btn btn-light btn-sm" id="month-prev">←</button>
      <strong>${year}年${month + 1}月</strong>
      <button type="button" class="btn btn-light btn-sm" id="month-next">→</button>`;

    document.getElementById("expense-summary").innerHTML = `
      <div class="col-4"><div class="card border-0 shadow-sm text-center p-3"><div class="small text-secondary">總開支</div><div class="fs-5 fw-bold text-primary">$${totalSpent.toFixed(0)}</div></div></div>
      <div class="col-4"><div class="card border-0 shadow-sm text-center p-3"><div class="small text-secondary">煮食次數</div><div class="fs-5 fw-bold">${mealCount}</div></div></div>
      <div class="col-4"><div class="card border-0 shadow-sm text-center p-3"><div class="small text-secondary">每餐平均</div><div class="fs-5 fw-bold">$${avgPerMeal.toFixed(0)}</div></div></div>`;

    const byRecipe = {};
    monthItems.forEach((i) => {
      const key = i.recipeName || "其他";
      byRecipe[key] = (byRecipe[key] || 0) + (parseFloat(i.price) || 0);
    });
    const recipeChart = Object.entries(byRecipe)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
    renderBarChart("recipe-chart", recipeChart, "呢個月未有任何菜式開支");

    renderBarChart(
      "meal-chart",
      mealCount > 0 ? [{ label: "平均每餐", value: avgPerMeal }] : [],
      "呢個月未煮過食"
    );

    const byDay = {};
    monthItems.forEach((i) => {
      const day = new Date(i.boughtAt).toLocaleDateString("zh-HK");
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(i);
    });

    const ledger = document.getElementById("expense-ledger");
    const days = Object.keys(byDay).sort((a, b) => new Date(b) - new Date(a));
    if (!days.length) {
      ledger.innerHTML = '<p class="text-secondary small">呢個月未有任何買餸紀錄</p>';
    } else {
      ledger.innerHTML = days
        .map((day) => {
          const dayTotal = byDay[day].reduce((s, i) => s + (parseFloat(i.price) || 0), 0);
          const rows = byDay[day]
            .map(
              (i) =>
                `<li class="list-group-item d-flex justify-content-between px-0">
                  <span>${i.ingredientName}${i.recipeName ? ` <small class="text-secondary">(${i.recipeName})</small>` : ""}</span>
                  <span>$${(parseFloat(i.price) || 0).toFixed(0)}</span>
                </li>`
            )
            .join("");
          return `<div class="mb-3"><div class="d-flex justify-content-between fw-semibold mb-1"><span>${day}</span><span>$${dayTotal.toFixed(0)}</span></div><ul class="list-group list-group-flush">${rows}</ul></div>`;
        })
        .join("");
    }

    document.getElementById("month-prev")?.addEventListener("click", () => {
      month -= 1;
      if (month < 0) { month = 11; year -= 1; }
      render();
    });
    document.getElementById("month-next")?.addEventListener("click", () => {
      month += 1;
      if (month > 11) { month = 0; year += 1; }
      render();
    });
  }

  render();
});
