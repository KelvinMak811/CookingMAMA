(function () {
  const SESSION_KEY = "smartcook_analytics_session";
  let pageEnteredAt = Date.now();
  let currentPath = location.pathname + location.search;

  function getApiBase() {
    if (typeof window.SMARTCOOK_API_BASE === "string") {
      return window.SMARTCOOK_API_BASE;
    }
    if (window.SMARTCOOK_STATIC) return null;
    return window.SMARTCOOK_BASE || "";
  }

  function getSessionId() {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }

  function basePayload() {
    return {
      session_id: getSessionId(),
      account_id: typeof getCurrentUserId === "function" ? getCurrentUserId() : null,
      page_path: location.pathname + location.search,
      created_at: new Date().toISOString(),
    };
  }

  function sendEvents(events) {
    const apiBase = getApiBase();
    if (!apiBase) return;
    const url = `${apiBase}/api/track.php`;
    const body = JSON.stringify({ events });
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(url, blob);
      return;
    }
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }

  window.trackEvent = function trackEvent(eventType, extra = {}) {
    sendEvents([
      {
        ...basePayload(),
        event_type: eventType,
        ...extra,
      },
    ]);
  };

  window.trackDishView = function trackDishView(recipe) {
    if (!recipe) return;
    trackEvent("dish_view", {
      dish_id: recipe.id,
      dish_name: recipe.name,
      metadata: { cuisine: recipe.cuisine, source: recipe.source || (recipe.isCustom ? "custom" : "system") },
    });
  };

  function trackPageLeave() {
    const durationMs = Date.now() - pageEnteredAt;
    sendEvents([
      {
        ...basePayload(),
        event_type: "page_leave",
        page_path: currentPath,
        duration_ms: durationMs,
        metadata: { title: document.title },
      },
    ]);
  }

  document.addEventListener("DOMContentLoaded", () => {
    trackEvent("page_view", { metadata: { title: document.title } });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      trackPageLeave();
    } else {
      pageEnteredAt = Date.now();
      currentPath = location.pathname + location.search;
    }
  });

  window.addEventListener("pagehide", trackPageLeave);
})();
