document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("maintain-app");
  if (!root) return;

  const apiBase = root.dataset.apiBase || "";
  let state = { tab: "summary", dishes: [], logs: [], summary: null };

  function api(path, options = {}) {
    return fetch(`${apiBase}/api/admin.php${path}`, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      credentials: "same-origin",
      ...options,
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Request failed");
      return data;
    });
  }

  function esc(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderLogin() {
    root.innerHTML = `
      <div class="row justify-content-center">
        <div class="col-md-5">
          <div class="card bg-secondary-subtle text-dark border-0 shadow">
            <div class="card-body p-4">
              <h1 class="h4 fw-bold mb-1">🔧 Maintain</h1>
              <p class="text-secondary small mb-4">Admin only — manage system dishes & view activity logs</p>
              <form id="maintain-login-form">
                <label class="form-label">Admin password</label>
                <input type="password" class="form-control mb-3" id="maintain-password" required autocomplete="current-password">
                <button type="submit" class="btn btn-primary w-100">Login</button>
              </form>
              <p id="maintain-login-error" class="text-danger small mt-3 mb-0 d-none"></p>
            </div>
          </div>
        </div>
      </div>`;

    document.getElementById("maintain-login-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const err = document.getElementById("maintain-login-error");
      err.classList.add("d-none");
      try {
        await api("?action=login", {
          method: "POST",
          body: JSON.stringify({ password: document.getElementById("maintain-password").value }),
        });
        await loadDashboard();
      } catch (ex) {
        err.textContent = ex.message || "Login failed";
        err.classList.remove("d-none");
      }
    });
  }

  async function loadDashboard() {
    const [summaryRes, logsRes, dishesRes] = await Promise.all([
      api("?action=summary"),
      api("?action=logs&limit=200"),
      api("?action=dishes"),
    ]);
    state.summary = summaryRes.summary;
    state.logs = logsRes.logs;
    state.dishes = dishesRes.dishes;
    renderDashboard();
  }

  function renderDashboard() {
    const s = state.summary || {};
    const logins = (s.logins || [])
      .map((l) => `<li class="list-group-item d-flex justify-content-between"><span>${esc(l.account_id)}</span><strong>${l.login_count}</strong></li>`)
      .join("");

    root.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div><h1 class="h4 mb-0">🔧 Maintain</h1><small class="text-secondary">System admin</small></div>
        <button type="button" class="btn btn-outline-light btn-sm" id="maintain-logout">Logout</button>
      </div>
      <ul class="nav nav-pills mb-4 gap-2" id="maintain-tabs">
        <li class="nav-item"><button type="button" class="nav-link ${state.tab === "summary" ? "active" : ""}" data-tab="summary">Summary</button></li>
        <li class="nav-item"><button type="button" class="nav-link ${state.tab === "logs" ? "active" : ""}" data-tab="logs">Activity logs</button></li>
        <li class="nav-item"><button type="button" class="nav-link ${state.tab === "dishes" ? "active" : ""}" data-tab="dishes">System dishes</button></li>
      </ul>
      <div id="maintain-panel"></div>`;

    document.getElementById("maintain-logout").addEventListener("click", async () => {
      await api("?action=logout", { method: "POST", body: "{}" });
      renderLogin();
    });

    root.querySelectorAll("[data-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.tab = btn.dataset.tab;
        renderDashboard();
      });
    });

    const panel = document.getElementById("maintain-panel");
    if (state.tab === "summary") panel.innerHTML = renderSummary(s, logins);
    if (state.tab === "logs") panel.innerHTML = renderLogs();
    if (state.tab === "dishes") panel.innerHTML = renderDishes();
    bindPanelEvents();
  }

  function renderSummary(s, logins) {
    return `
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3"><div class="card bg-secondary text-white border-0"><div class="card-body"><div class="small opacity-75">Total events</div><div class="fs-4 fw-bold">${s.total_events || 0}</div></div></div></div>
        <div class="col-6 col-md-3"><div class="card bg-secondary text-white border-0"><div class="card-body"><div class="small opacity-75">Today</div><div class="fs-4 fw-bold">${s.events_today || 0}</div></div></div></div>
        <div class="col-6 col-md-3"><div class="card bg-secondary text-white border-0"><div class="card-body"><div class="small opacity-75">Sessions</div><div class="fs-4 fw-bold">${s.sessions || 0}</div></div></div></div>
        <div class="col-6 col-md-3"><div class="card bg-secondary text-white border-0"><div class="card-body"><div class="small opacity-75">Dish views</div><div class="fs-4 fw-bold">${s.dish_views || 0}</div></div></div></div>
      </div>
      <div class="card bg-secondary text-white border-0">
        <div class="card-body">
          <h2 class="h6">Login count per account</h2>
          <ul class="list-group list-group-flush">${logins || '<li class="list-group-item bg-transparent text-white-50">No logins yet</li>'}</ul>
        </div>
      </div>`;
  }

  function renderLogs() {
    const options = ["", "account_login", "page_view", "page_leave", "dish_view", "dish_add_custom", "shopping_add", "meal_plan_add", "cooking_complete", "admin_dish_save", "admin_dish_delete"];
    return `
      <div class="row g-2 mb-3">
        <div class="col-md-4"><select class="form-select form-select-sm" id="log-filter-account"><option value="">All accounts</option><option value="kelvin">Kelvin</option><option value="yuetsum">YuetSum</option><option value="admin">admin</option></select></div>
        <div class="col-md-4"><select class="form-select form-select-sm" id="log-filter-event">${options.map((o) => `<option value="${o}">${o || "All events"}</option>`).join("")}</select></div>
        <div class="col-md-4"><button type="button" class="btn btn-sm btn-outline-light w-100" id="log-refresh">Refresh</button></div>
      </div>
      <div class="table-responsive">
        <table class="table table-dark table-sm table-striped align-middle mb-0">
          <thead><tr><th>Time</th><th>Account</th><th>Event</th><th>Page / Dish</th><th>Duration</th><th>Details</th></tr></thead>
          <tbody id="log-table-body">${renderLogRows(state.logs)}</tbody>
        </table>
      </div>`;
  }

  function renderLogRows(logs) {
    if (!logs.length) return '<tr><td colspan="6" class="text-secondary">No logs yet</td></tr>';
    return logs
      .map((log) => {
        const meta = log.metadata ? (typeof log.metadata === "string" ? log.metadata : JSON.stringify(log.metadata)) : "";
        const dish = log.dish_name ? `${esc(log.dish_name)} (${esc(log.dish_id || "")})` : esc(log.page_path || "");
        const dur = log.duration_ms ? `${Math.round(log.duration_ms / 1000)}s` : "";
        return `<tr>
          <td class="text-nowrap small">${esc(new Date(log.created_at).toLocaleString("zh-HK"))}</td>
          <td>${esc(log.account_id || "—")}</td>
          <td><code>${esc(log.event_type)}</code></td>
          <td class="small">${dish}</td>
          <td>${dur}</td>
          <td class="small text-secondary">${esc(meta)}</td>
        </tr>`;
      })
      .join("");
  }

  function renderDishes() {
    const rows = state.dishes
      .map(
        (d) => `<tr>
          <td><code>${esc(d.id)}</code></td>
          <td>${esc(d.name)}</td>
          <td>${esc(d.cuisine || "")}</td>
          <td><span class="badge bg-primary">${esc(d.source || "system")}</span></td>
          <td class="text-end">
            <button type="button" class="btn btn-sm btn-outline-light me-1" data-edit-dish="${esc(d.id)}">Edit</button>
            <button type="button" class="btn btn-sm btn-outline-danger" data-delete-dish="${esc(d.id)}">Delete</button>
          </td>
        </tr>`
      )
      .join("");

    return `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="h6 mb-0">System dishes (${state.dishes.length})</h2>
        <button type="button" class="btn btn-sm btn-primary" id="dish-add-btn">+ Add dish</button>
      </div>
      <div class="table-responsive">
        <table class="table table-dark table-sm table-striped align-middle">
          <thead><tr><th>ID</th><th>Name</th><th>Cuisine</th><th>Source</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div id="dish-editor" class="d-none"></div>`;
  }

  function bindPanelEvents() {
    document.getElementById("log-refresh")?.addEventListener("click", async () => {
      const account = document.getElementById("log-filter-account")?.value || "";
      const eventType = document.getElementById("log-filter-event")?.value || "";
      const qs = new URLSearchParams({ action: "logs", limit: "200" });
      if (account) qs.set("account", account);
      if (eventType) qs.set("event_type", eventType);
      const res = await api(`?${qs.toString()}`);
      state.logs = res.logs;
      const body = document.getElementById("log-table-body");
      if (body) body.innerHTML = renderLogRows(state.logs);
    });

    document.getElementById("dish-add-btn")?.addEventListener("click", () => showDishEditor());
    root.querySelectorAll("[data-edit-dish]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const dish = state.dishes.find((d) => d.id === btn.dataset.editDish);
        showDishEditor(dish);
      });
    });
    root.querySelectorAll("[data-delete-dish]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm(`Delete dish ${btn.dataset.deleteDish}?`)) return;
        await api(`?action=dishes&id=${encodeURIComponent(btn.dataset.deleteDish)}`, { method: "DELETE" });
        await loadDashboard();
        state.tab = "dishes";
        renderDashboard();
      });
    });
  }

  function showDishEditor(dish = null) {
    const editor = document.getElementById("dish-editor");
    if (!editor) return;
    const ing = dish?.ingredients?.length
      ? dish.ingredients.map((i) => `${i.name}|${i.amount || ""}`).join("\n")
      : "";
    const steps = dish?.steps?.length ? dish.steps.join("\n") : "";
    editor.classList.remove("d-none");
    editor.innerHTML = `
      <div class="card bg-secondary text-white border-0 mt-3">
        <div class="card-body">
          <h3 class="h6">${dish ? "Edit" : "Add"} system dish</h3>
          <form id="dish-editor-form" class="row g-3">
            <div class="col-md-4"><label class="form-label small">ID</label><input class="form-control form-control-sm" name="id" value="${esc(dish?.id || "")}" ${dish ? "readonly" : ""} required></div>
            <div class="col-md-8"><label class="form-label small">Name *</label><input class="form-control form-control-sm" name="name" value="${esc(dish?.name || "")}" required></div>
            <div class="col-md-3"><label class="form-label small">Cuisine</label><select class="form-select form-select-sm" name="cuisine">
              ${["chinese", "western", "japanese", "italian"].map((c) => `<option value="${c}" ${dish?.cuisine === c ? "selected" : ""}>${c}</option>`).join("")}
            </select></div>
            <div class="col-md-3"><label class="form-label small">Servings</label><input type="number" class="form-control form-control-sm" name="baseServings" value="${dish?.baseServings || 2}"></div>
            <div class="col-md-3"><label class="form-label small">Difficulty</label><input type="number" min="1" max="5" class="form-control form-control-sm" name="difficulty" value="${dish?.difficulty || 1}"></div>
            <div class="col-md-3"><label class="form-label small">Prep (min)</label><input type="number" class="form-control form-control-sm" name="prepTime" value="${dish?.prepTime || 0}"></div>
            <div class="col-12"><label class="form-label small">Description</label><textarea class="form-control form-control-sm" name="description" rows="2">${esc(dish?.description || "")}</textarea></div>
            <div class="col-12"><label class="form-label small">Image URL</label><input class="form-control form-control-sm" name="imageUrl" value="${esc(dish?.imageUrl || "")}"></div>
            <div class="col-md-6"><label class="form-label small">Ingredients * (name|amount per line)</label><textarea class="form-control form-control-sm" name="ingredients" rows="6" required>${esc(ing)}</textarea></div>
            <div class="col-md-6"><label class="form-label small">Steps (one per line)</label><textarea class="form-control form-control-sm" name="steps" rows="6">${esc(steps)}</textarea></div>
            <div class="col-12 d-flex gap-2">
              <button type="submit" class="btn btn-primary btn-sm">Save</button>
              <button type="button" class="btn btn-outline-light btn-sm" id="dish-editor-cancel">Cancel</button>
            </div>
          </form>
        </div>
      </div>`;

    document.getElementById("dish-editor-cancel").addEventListener("click", () => editor.classList.add("d-none"));
    document.getElementById("dish-editor-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const ingredients = String(fd.get("ingredients") || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, idx) => {
          const [name, amount = "適量"] = line.split("|");
          return { id: `ing-${idx + 1}`, name: name.trim(), amount: amount.trim() };
        });
      const steps = String(fd.get("steps") || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = {
        id: String(fd.get("id") || "").trim(),
        name: String(fd.get("name") || "").trim(),
        cuisine: String(fd.get("cuisine") || "chinese"),
        baseServings: parseInt(fd.get("baseServings"), 10) || 2,
        difficulty: parseInt(fd.get("difficulty"), 10) || 1,
        prepTime: parseInt(fd.get("prepTime"), 10) || 0,
        description: String(fd.get("description") || ""),
        imageUrl: String(fd.get("imageUrl") || ""),
        ingredients,
        steps,
        createdAt: dish?.createdAt,
      };
      await api("?action=dishes", { method: "POST", body: JSON.stringify(payload) });
      await loadDashboard();
      state.tab = "dishes";
      renderDashboard();
    });
  }

  api("?action=session")
    .then((res) => (res.logged_in ? loadDashboard() : renderLogin()))
    .catch(() => renderLogin());
});
