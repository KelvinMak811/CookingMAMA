/**
 * Cloud sync — keeps shopping, calendar, and custom recipes on the PHP server
 * so data survives when switching computers or browsers.
 */
(function () {
  const SYNC_META_SUFFIX = "_cloud_meta";
  const DEBOUNCE_MS = 800;

  let syncTimer = null;
  let syncInFlight = null;

  function getApiBase() {
    if (typeof window.SMARTCOOK_API_BASE === "string" && window.SMARTCOOK_API_BASE !== "") {
      return window.SMARTCOOK_API_BASE;
    }
    if (window.SMARTCOOK_STATIC) return null;
    return window.SMARTCOOK_BASE || "";
  }

  function isCloudSyncEnabled() {
    return Boolean(getApiBase());
  }

  function storageKeyToSyncKey(localKey) {
    if (localKey === STORAGE_KEYS.SHOPPING) return "shopping";
    if (localKey === STORAGE_KEYS.COOKING_LOG) return "cooking_log";
    if (localKey === STORAGE_KEYS.MEAL_PLAN) return "meal_plan";
    if (localKey === STORAGE_KEYS.CUSTOM_RECIPES) return "custom_recipes";
    return null;
  }

  function getLocalPayload(localKey) {
    const raw = localStorage.getItem(localKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function getLocalUpdatedAt(localKey) {
    const metaRaw = localStorage.getItem(localKey + SYNC_META_SUFFIX);
    if (metaRaw) {
      try {
        const meta = JSON.parse(metaRaw);
        if (meta.updated_at) return meta.updated_at;
      } catch {
        /* ignore */
      }
    }
    const payload = getLocalPayload(localKey);
    return payload ? new Date().toISOString() : null;
  }

  function touchLocalMeta(localKey) {
    const updatedAt = new Date().toISOString();
    localStorage.setItem(localKey + SYNC_META_SUFFIX, JSON.stringify({ updated_at: updatedAt }));
    return updatedAt;
  }

  function applyPayloadToLocal(localKey, payload, updatedAt) {
    if (!payload || typeof payload !== "object") return;
    localStorage.setItem(localKey, JSON.stringify(payload));
    localStorage.setItem(localKey + SYNC_META_SUFFIX, JSON.stringify({ updated_at: updatedAt || new Date().toISOString() }));
  }

  function collectAccountSyncPayload(accountId) {
    const data = {};
    [
      [STORAGE_KEYS.SHOPPING, userStorageKey(STORAGE_KEYS.SHOPPING, accountId)],
      [STORAGE_KEYS.COOKING_LOG, userStorageKey(STORAGE_KEYS.COOKING_LOG, accountId)],
      [STORAGE_KEYS.MEAL_PLAN, userStorageKey(STORAGE_KEYS.MEAL_PLAN, accountId)],
    ].forEach(([syncName, localKey]) => {
      const payload = getLocalPayload(localKey);
      if (!payload) return;
      const key = storageKeyToSyncKey(syncName);
      if (!key) return;
      data[key] = { payload, updated_at: getLocalUpdatedAt(localKey) || new Date().toISOString() };
    });

    const customPayload = getLocalPayload(STORAGE_KEYS.CUSTOM_RECIPES);
    const customRecipes = customPayload
      ? {
          payload: customPayload,
          updated_at: getLocalUpdatedAt(STORAGE_KEYS.CUSTOM_RECIPES) || new Date().toISOString(),
        }
      : null;

    return { account_id: accountId, data, custom_recipes: customRecipes };
  }

  function applyServerSync(sync) {
    if (!sync || typeof sync !== "object") return false;
    let changed = false;
    const accountId = sync.account_id;
    if (!accountId) return false;

    const data = sync.data || {};
    const map = {
      shopping: userStorageKey(STORAGE_KEYS.SHOPPING, accountId),
      cooking_log: userStorageKey(STORAGE_KEYS.COOKING_LOG, accountId),
      meal_plan: userStorageKey(STORAGE_KEYS.MEAL_PLAN, accountId),
    };

    Object.entries(map).forEach(([key, localKey]) => {
      const entry = data[key];
      if (!entry || !entry.payload) return;
      const serverTime = entry.updated_at ? Date.parse(entry.updated_at) : 0;
      const localTime = Date.parse(getLocalUpdatedAt(localKey) || 0) || 0;
      if (serverTime >= localTime) {
        applyPayloadToLocal(localKey, entry.payload, entry.updated_at);
        changed = true;
      }
    });

    if (sync.custom_recipes && sync.custom_recipes.payload) {
      const entry = sync.custom_recipes;
      const serverTime = entry.updated_at ? Date.parse(entry.updated_at) : 0;
      const localTime = Date.parse(getLocalUpdatedAt(STORAGE_KEYS.CUSTOM_RECIPES) || 0) || 0;
      if (serverTime >= localTime) {
        applyPayloadToLocal(STORAGE_KEYS.CUSTOM_RECIPES, entry.payload, entry.updated_at);
        changed = true;
      }
    }

    return changed;
  }

  async function cloudSyncRequest(accountId) {
    const apiBase = getApiBase();
    if (!apiBase || !accountId) return null;

    const body = collectAccountSyncPayload(accountId);
    const res = await fetch(`${apiBase}/api/sync.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) {
      throw new Error(json.error || "Sync failed");
    }
    return json.sync;
  }

  window.syncPullAccount = async function syncPullAccount(accountId) {
    if (!isCloudSyncEnabled()) return false;
    try {
      const sync = await cloudSyncRequest(accountId);
      const changed = applyServerSync(sync);
      updateShoppingBubble();
      return changed;
    } catch {
      return false;
    }
  };

  window.scheduleCloudSync = function scheduleCloudSync() {
    if (!isCloudSyncEnabled()) return;
    const accountId = getCurrentUserId();
    if (!accountId) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      syncInFlight = cloudSyncRequest(accountId)
        .then((sync) => {
          applyServerSync(sync);
        })
        .catch(() => {})
        .finally(() => {
          syncInFlight = null;
        });
    }, DEBOUNCE_MS);
  };

  window.syncOnAppLoad = async function syncOnAppLoad() {
    const accountId = getCurrentUserId();
    if (!accountId || !isCloudSyncEnabled()) return;
    await syncPullAccount(accountId);
  };

  window.exportUserBackup = function exportUserBackup() {
    const backup = {
      version: 1,
      exported_at: new Date().toISOString(),
      current_user: getCurrentUserId(),
      accounts: {},
      custom_recipes: getLocalPayload(STORAGE_KEYS.CUSTOM_RECIPES),
    };
    Object.keys(ACCOUNTS).forEach((accountId) => {
      backup.accounts[accountId] = {
        shopping: getLocalPayload(userStorageKey(STORAGE_KEYS.SHOPPING, accountId)),
        cooking_log: getLocalPayload(userStorageKey(STORAGE_KEYS.COOKING_LOG, accountId)),
        meal_plan: getLocalPayload(userStorageKey(STORAGE_KEYS.MEAL_PLAN, accountId)),
      };
    });
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smartcook-backup-${toDateInputValue()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  window.importUserBackup = function importUserBackup(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const backup = JSON.parse(String(reader.result));
          if (!backup || !backup.accounts) {
            reject(new Error("Invalid backup file"));
            return;
          }
          Object.entries(backup.accounts).forEach(([accountId, data]) => {
            if (!ACCOUNTS[accountId] || !data) return;
            if (data.shopping) {
              applyPayloadToLocal(userStorageKey(STORAGE_KEYS.SHOPPING, accountId), data.shopping, backup.exported_at);
            }
            if (data.cooking_log) {
              applyPayloadToLocal(userStorageKey(STORAGE_KEYS.COOKING_LOG, accountId), data.cooking_log, backup.exported_at);
            }
            if (data.meal_plan) {
              applyPayloadToLocal(userStorageKey(STORAGE_KEYS.MEAL_PLAN, accountId), data.meal_plan, backup.exported_at);
            }
          });
          if (backup.custom_recipes) {
            applyPayloadToLocal(STORAGE_KEYS.CUSTOM_RECIPES, backup.custom_recipes, backup.exported_at);
          }
          scheduleCloudSync();
          updateShoppingBubble();
          resolve(true);
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    syncOnAppLoad();
  });
})();
