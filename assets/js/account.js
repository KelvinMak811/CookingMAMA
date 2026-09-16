document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-account]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const userId = btn.dataset.account;
      if (!ACCOUNTS[userId]) return;
      setCurrentUser(userId);
      if (typeof syncPullAccount === "function") {
        await syncPullAccount(userId);
      }
      scheduleCloudSync?.();
      const base = window.SMARTCOOK_BASE || "";
      const recipesUrl = window.SMARTCOOK_STATIC ? `${base}/recipes/` : `${base}/recipes.php`;
      location.replace(recipesUrl);
    });
  });

  document.getElementById("export-backup-btn")?.addEventListener("click", () => {
    if (typeof exportUserBackup === "function") {
      exportUserBackup();
    }
  });

  document.getElementById("import-backup-input")?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importUserBackup(file);
      alert("備份已還原！");
      e.target.value = "";
    } catch (err) {
      alert(err.message || "還原失敗");
      e.target.value = "";
    }
  });

  const current = getCurrentUser();
  if (current) {
    const hint = document.getElementById("current-account-hint");
    if (hint) {
      hint.textContent = `目前登入：${current.name}`;
      hint.classList.remove("d-none");
    }
  }
});
