document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-account]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const userId = btn.dataset.account;
      if (!ACCOUNTS[userId]) return;
      setCurrentUser(userId);
      const base = window.SMARTCOOK_BASE || "";
      const recipesUrl = window.SMARTCOOK_STATIC ? `${base}/recipes/` : `${base}/recipes.php`;
      location.replace(recipesUrl);
    });
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
