document.addEventListener("DOMContentLoaded", () => {
  const listEl = document.getElementById("shopping-list");
  const totalEl = document.getElementById("shopping-total");
  if (!listEl) return;

  function render() {
    const items = getShoppingItems();
    if (items.length === 0) {
      listEl.innerHTML = '<p class="text-secondary text-center py-4">買餸清單係空嘅，去菜式庫加入材料啦</p>';
    } else {
      listEl.innerHTML = items
        .map((item) => {
          const label = item.amount
            ? `${item.ingredientName}（${item.amount}）`
            : item.ingredientName;
          const meta = item.recipeName ? `<small class="text-secondary d-block">${item.recipeName}</small>` : "";
          return `
            <div class="card border-0 shadow-sm mb-2 ${item.isBought ? "opacity-75" : ""}">
              <div class="card-body py-3">
                <div class="d-flex align-items-start gap-2">
                  <input class="form-check-input mt-1" type="checkbox" data-toggle-id="${item.id}" ${item.isBought ? "checked" : ""}>
                  <div class="flex-grow-1">
                    <div class="${item.isBought ? "text-decoration-line-through text-secondary" : "fw-semibold"}">${label}</div>
                    ${meta}
                  </div>
                  <button type="button" class="btn btn-link text-secondary p-0" data-remove-id="${item.id}" aria-label="刪除">✕</button>
                </div>
                ${
                  item.isBought
                    ? `<div class="mt-2 d-flex align-items-center gap-2">
                        <label class="small text-secondary mb-0">價錢 $</label>
                        <input type="number" min="0" step="0.1" class="form-control form-control-sm" style="max-width:6rem" data-price-id="${item.id}" value="${item.price || 0}">
                      </div>`
                    : ""
                }
              </div>
            </div>`;
        })
        .join("");
    }

    const boughtTotal = items
      .filter((i) => i.isBought)
      .reduce((sum, i) => sum + (parseFloat(i.price) || 0), 0);
    if (totalEl) totalEl.textContent = `$${boughtTotal.toFixed(0)}`;

    listEl.querySelectorAll("[data-toggle-id]").forEach((el) => {
      el.addEventListener("change", () => {
        const items = getShoppingItems();
        const item = items.find((i) => i.id === el.dataset.toggleId);
        if (!item) return;
        item.isBought = el.checked;
        if (item.isBought && !item.boughtAt) item.boughtAt = new Date().toISOString();
        setShoppingItems(items);
        render();
      });
    });

    listEl.querySelectorAll("[data-remove-id]").forEach((el) => {
      el.addEventListener("click", () => {
        setShoppingItems(getShoppingItems().filter((i) => i.id !== el.dataset.removeId));
        render();
      });
    });

    listEl.querySelectorAll("[data-price-id]").forEach((el) => {
      el.addEventListener("change", () => {
        const items = getShoppingItems();
        const item = items.find((i) => i.id === el.dataset.priceId);
        if (!item) return;
        item.price = parseFloat(el.value) || 0;
        setShoppingItems(items);
        render();
      });
    });
  }

  document.getElementById("add-shopping-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("new-item-name")?.value.trim();
    const amount = document.getElementById("new-item-amount")?.value.trim();
    if (!name) return;
    const items = getShoppingItems();
    items.unshift({
      id: generateId(),
      ingredientName: name,
      amount: amount || undefined,
      isBought: false,
      price: 0,
      addedAt: new Date().toISOString(),
    });
    setShoppingItems(items);
    e.target.reset();
    render();
  });

  document.getElementById("read-unbought-btn")?.addEventListener("click", () => {
    const text = getShoppingItems()
      .filter((i) => !i.isBought)
      .map((i) => (i.amount ? `${i.ingredientName} ${i.amount}` : i.ingredientName))
      .join("、");
    if (!text) {
      alert("未買材料清單係空嘅");
      return;
    }
    speakText(`要買：${text}`);
  });

  render();
});
