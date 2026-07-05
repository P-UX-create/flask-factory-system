document.addEventListener('DOMContentLoaded', () => {
  const grid          = document.getElementById('brandsGrid');
  const skeletonWrap  = document.getElementById('skeletonWrap');
  const pageError     = document.getElementById('pageError');
  const pageErrorMsg  = document.getElementById('pageErrorMsg');
  const retryBtn      = document.getElementById('retryBtn');
  const emptyAll      = document.getElementById('emptyAll');
  const emptySearch   = document.getElementById('emptySearch');
  const emptySearchTerm = document.getElementById('emptySearchTerm');
  const brandCount    = document.getElementById('brandCount');
  const searchInput   = document.getElementById('brandSearch');
  const searchClear   = document.getElementById('searchClear');
  const createBtn     = document.getElementById('createBrandBtn');
  const createPanel   = document.getElementById('createPanel');
  const createSaveBtn = document.getElementById('createSaveBtn');
  const createCancelBtn = document.getElementById('createCancelBtn');
  const newBrandName  = document.getElementById('newBrandName');
  const newBrandError = document.getElementById('newBrandError');
  const toastContainer = document.getElementById('toastContainer');

  const state = {
    brands: [],
    query: '',
    activeMenu: null,
  };

  loadBrands();
  if (retryBtn) retryBtn.addEventListener('click', loadBrands);

  searchInput.addEventListener('input', () => {
    state.query = searchInput.value.trim().toLowerCase();
    searchClear.hidden = state.query.length === 0;
    render();
  });
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    state.query = '';
    searchClear.hidden = true;
    searchInput.focus();
    render();
  });

  createBtn.addEventListener('click', () => {
    const isOpen = !createPanel.hidden;
    createPanel.hidden = isOpen;
    if (!isOpen) {
      newBrandName.value = '';
      newBrandError.textContent = '';
      newBrandName.classList.remove('is-invalid');
      requestAnimationFrame(() => newBrandName.focus());
    }
  });
  createCancelBtn.addEventListener('click', () => {
    createPanel.hidden = true;
  });
  newBrandName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') createSaveBtn.click();
    if (e.key === 'Escape') createPanel.hidden = true;
  });
  createSaveBtn.addEventListener('click', handleCreate);

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dot-menu-wrap')) {
      closeAllMenus();
    }
  });

  const TOAST_ICONS = {
    success: '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>',
    error:   '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>',
    info:    '<path d="M11 7h2v2h-2V7zm0 4h2v6h-2v-6zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>',
  };

  function showToast(message, type = 'info', duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

    toast.innerHTML = `
      <svg class="toast-icon" viewBox="0 0 24 24" aria-hidden="true">${TOAST_ICONS[type] || TOAST_ICONS.info}</svg>
      <span class="toast-body"></span>
      <button class="toast-close" aria-label="Dismiss notification">✕</button>
    `;
    toast.querySelector('.toast-body').textContent = message;

    const timer = setTimeout(dismiss, duration);

    function dismiss() {
      clearTimeout(timer);
      toast.classList.add('is-leaving');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }

    toast.querySelector('.toast-close').addEventListener('click', dismiss);
    toastContainer.appendChild(toast);
    return dismiss;
  }

  async function loadBrands() {
    setLoadingState(true);
    pageError.hidden = true;

    try {
      const data = await apiFetch('/api/brands');
      state.brands = sortBrands(Array.isArray(data) ? data : []);
      setLoadingState(false);
      render();
    } catch (err) {
      setLoadingState(false);
      if (pageErrorMsg) pageErrorMsg.textContent = err.message || 'Failed to load brands.';
      pageError.hidden = false;
    }
  }

  async function handleCreate() {
    const name = newBrandName.value.trim();
    newBrandError.textContent = '';
    newBrandName.classList.remove('is-invalid');

    if (!name) {
      newBrandName.classList.add('is-invalid');
      newBrandError.textContent = 'Brand name is required.';
      newBrandName.focus();
      return;
    }
    if (state.brands.some(b => b.name.toLowerCase() === name.toLowerCase())) {
      newBrandName.classList.add('is-invalid');
      newBrandError.textContent = 'A brand with this name already exists.';
      newBrandName.focus();
      return;
    }

    setBtn(createSaveBtn, true, 'Creating…');

    const tempId = `temp-${Date.now()}`;
    const tempBrand = { id: tempId, name, productCount: 0, createdAt: new Date().toISOString() };
    state.brands = sortBrands([tempBrand, ...state.brands]);
    render();

    try {
      const created = await apiFetch('/api/brands', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });

      state.brands = sortBrands(
        state.brands.map(b => b.id === tempId ? { ...tempBrand, ...created } : b)
      );
      createPanel.hidden = true;
      newBrandName.value = '';
      showToast(`"${name}" created.`, 'success');
    } catch (err) {
      state.brands = state.brands.filter(b => b.id !== tempId);
      newBrandError.textContent = err.message || 'Failed to create brand.';
      newBrandName.classList.add('is-invalid');
      showToast(err.message || 'Failed to create brand.', 'error');
    } finally {
      setBtn(createSaveBtn, false, 'Create');
      render();
    }
  }

  async function handleUpdate(id, newName, inputEl, errorEl, saveBtn) {
    const original = state.brands.find(b => b.id === id);
    if (!original) return;

    errorEl.textContent = '';
    inputEl.classList.remove('is-invalid');

    if (!newName) {
      inputEl.classList.add('is-invalid');
      errorEl.textContent = 'Name cannot be empty.';
      inputEl.focus();
      return;
    }

    if (newName === original.name) {
      closeEditOverlay(id);
      return;
    }

    setBtn(saveBtn, true, 'Saving…');

    const prev = { ...original };

    state.brands = sortBrands(
      state.brands.map(b =>
        b.id === id ? { ...b, name: newName } : b
      )
    );

    render();

    try {
      const updated = await apiFetch(`/api/brands/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: newName }),
      });

      state.brands = sortBrands(
        state.brands.map(b =>
          b.id === id ? { ...b, ...updated } : b
        )
      );

      showToast(`Renamed to "${updated.name ?? newName}".`, 'success');
      closeEditOverlay(id);
      render();
    } catch (err) {
      state.brands = sortBrands(
        state.brands.map(b =>
          b.id === id ? prev : b
        )
      );
      render();
      showToast(err.message || 'Failed to update brand.', 'error');
      openEditOverlay(id, err.message || 'Failed to update brand.');
    }
  }

  async function handleDelete(id) {
    const card = document.querySelector(`[data-brand-id="${id}"]`);
    if (card) card.classList.add('is-deleting');

    const prev = [...state.brands];
    const target = state.brands.find(b => b.id === id);

    setTimeout(() => {
      state.brands = state.brands.filter(b => b.id !== id);
      render();
    }, 240);

    try {
      await apiFetch(`/api/brands/${id}`, { method: 'DELETE' });
      showToast(`"${target?.name ?? 'Brand'}" deleted.`, 'success');
    } catch (err) {
      state.brands = sortBrands(prev);
      render();
      showToast(err.message || 'Delete failed. Please try again.', 'error');
    }
  }

  function render() {
    const filtered = state.query
      ? state.brands.filter(b =>
          b.name.toLowerCase().includes(state.query.toLowerCase())
        )
      : state.brands;

    const total = state.brands.length;

    brandCount.textContent =
      total === 0
        ? "No brands yet"
        : `${total} brand${total !== 1 ? "s" : ""}, sorted by product count`;

    const hasBrands = total > 0;
    const hasFiltered = filtered.length > 0;
    const searching = state.query.trim().length > 0;

    grid.hidden = !hasFiltered;
    emptyAll.hidden = hasBrands || searching;
    emptySearch.hidden = !searching || hasFiltered;

    if (emptySearchTerm) {
      emptySearchTerm.textContent = state.query;
    }

    if (!hasFiltered) {
      grid.innerHTML = "";
      return;
    }

    const existing = new Map(
      [...grid.querySelectorAll("[data-brand-id]")].map(el => [
        String(el.dataset.brandId),
        el
      ])
    );

    const newIds = new Set(filtered.map(b => String(b.id)));

    existing.forEach((el, id) => {
      if (!newIds.has(id)) {
        el.remove();
      }
    });

    filtered.forEach((brand, index) => {
      const id = String(brand.id);

      if (existing.has(id)) {
        const card = existing.get(id);

        const nameEl = card.querySelector(".brand-name-text");
        if (nameEl && nameEl.textContent !== brand.name) {
          nameEl.textContent = brand.name;
        }

        const countEl = card.querySelector(".product-count");
        if (countEl) {
          countEl.textContent = brand.productCount;
        }

        grid.insertBefore(card, grid.children[index] || null);
      } else {
        const card = buildCard(brand);
        grid.insertBefore(card, grid.children[index] || null);
      }
    });
  }

  function buildCard(brand) {
    const card = document.createElement('div');
    card.className = 'brand-card';
    card.dataset.brandId = brand.id;

    const count  = brand.productCount ?? 0;
    const age    = timeAgo(brand.createdAt);

    card.innerHTML = `
      <div class="card-top">
        <button class="brand-name-btn" aria-label="Edit brand name">
          <span class="brand-name-text">${escapeHtml(brand.name)}</span>
          <svg class="edit-icon" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
        <div class="dot-menu-wrap">
          <button class="dot-menu-btn" aria-label="More options" aria-haspopup="true" aria-expanded="false">⋮</button>
        </div>
      </div>

      <div class="card-stats">
        <span class="stat-pill">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.06 15.93 0 13.36 0c-1.33 0-2.52.58-3.36 1.5C9.16.58 7.97 0 6.64 0 4.07 0 2 2.06 2 4.64c0 .48.11.92.18 1.36H0v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6zM4 8h7v12H4V8zm9 12V8h7v12h-7z"/>
          </svg>
          <span class="product-count">${count}</span> product${count !== 1 ? 's' : ''}
        </span>
      </div>

      <div class="card-meta">
        <span class="card-age">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
          </svg>
          ${age}
        </span>
        <button class="trash-btn" aria-label="Delete brand">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </div>
    `;

    card.querySelector('.brand-name-btn').addEventListener('click', () => {
      openEditOverlay(brand.id);
    });

    const dotBtn  = card.querySelector('.dot-menu-btn');
    const menuWrap = card.querySelector('.dot-menu-wrap');

    dotBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menuWrap.querySelector('.dot-menu');
      if (isOpen) {
        closeAllMenus();
      } else {
        closeAllMenus();
        openDotMenu(brand.id, menuWrap, dotBtn);
      }
    });

    card.querySelector('.trash-btn').addEventListener('click', () => {
      openConfirmOverlay(brand.id);
    });

    return card;
  }

  function openDotMenu(id, wrap, triggerBtn) {
    const menu = document.createElement('div');
    menu.className = 'dot-menu';
    menu.setAttribute('role', 'menu');
    menu.innerHTML = `
      <button role="menuitem">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
        </svg>
        Rename
      </button>
    `;
    menu.querySelector('button').addEventListener('click', () => {
      closeAllMenus();
      openEditOverlay(id);
    });
    wrap.appendChild(menu);
    triggerBtn.setAttribute('aria-expanded', 'true');
    state.activeMenu = id;
  }

  function closeAllMenus() {
    document.querySelectorAll('.dot-menu').forEach(m => m.remove());
    document.querySelectorAll('.dot-menu-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
    state.activeMenu = null;
  }

  function openEditOverlay(id, prefillError = '') {
    const card = document.querySelector(`[data-brand-id="${id}"]`);
    if (!card) return;

    card.querySelector('.card-edit-overlay, .card-confirm-overlay')?.remove();

    const brand    = state.brands.find(b => b.id === id);
    const overlay  = document.createElement('div');
    overlay.className = 'card-edit-overlay';

    overlay.innerHTML = `
      <span class="card-edit-label">Rename brand</span>
      <input class="card-edit-input" type="text" maxlength="80" value="${escapeHtml(brand?.name || '')}" autocomplete="off">
      <span class="card-edit-error">${escapeHtml(prefillError)}</span>
      <div class="card-edit-actions">
        <button class="btn btn-ghost btn-sm" data-action="cancel">Cancel</button>
        <button class="btn btn-primary btn-sm" data-action="save" disabled>Save</button>
      </div>
    `;

    const input   = overlay.querySelector('.card-edit-input');
    const errorEl = overlay.querySelector('.card-edit-error');
    const saveBtn = overlay.querySelector('[data-action="save"]');
    const cancelBtn = overlay.querySelector('[data-action="cancel"]');

    input.addEventListener('input', () => {
      const changed = input.value.trim() !== (brand?.name || '');
      saveBtn.disabled = !changed || input.value.trim().length === 0;
    });

    cancelBtn.addEventListener('click', () => overlay.remove());

    saveBtn.addEventListener('click', () => {
      handleUpdate(id, input.value.trim(), input, errorEl, saveBtn);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !saveBtn.disabled) saveBtn.click();
      if (e.key === 'Escape') overlay.remove();
    });

    card.appendChild(overlay);
    requestAnimationFrame(() => { input.focus(); input.select(); });
  }

  function closeEditOverlay(id) {
    document.querySelector(`[data-brand-id="${id}"] .card-edit-overlay`)?.remove();
  }

  function openConfirmOverlay(id) {
    const card = document.querySelector(`[data-brand-id="${id}"]`);
    if (!card) return;

    card.querySelector('.card-edit-overlay, .card-confirm-overlay')?.remove();

    const brand   = state.brands.find(b => b.id === id);
    const overlay = document.createElement('div');
    overlay.className = 'card-confirm-overlay';

    overlay.innerHTML = `
      <span class="confirm-icon" aria-hidden="true">🗑️</span>
      <p class="confirm-title">Delete "${escapeHtml(brand?.name || 'this brand')}"?</p>
      <p class="confirm-sub">This cannot be undone.<br>Any linked products will lose their brand.</p>
      <div class="confirm-actions">
        <button class="btn btn-ghost btn-sm" data-action="cancel">Cancel</button>
        <button class="btn btn-danger btn-sm" data-action="confirm">
          <span class="btn-label">Delete</span>
          <span class="btn-spinner" hidden aria-hidden="true"></span>
        </button>
      </div>
    `;

    overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => {
      overlay.remove();
    });
    overlay.querySelector('[data-action="confirm"]').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      setBtn(btn, true, 'Deleting…');
      await handleDelete(id);
    });

    card.appendChild(overlay);
  }

  function setLoadingState(loading) {
    skeletonWrap.hidden = !loading;
    skeletonWrap.setAttribute("aria-busy", loading ? "true" : "false");

    if (loading) {
      grid.hidden = true;
      emptyAll.hidden = true;
      emptySearch.hidden = true;
      pageError.hidden = true;
    }
  }

  function sortBrands(arr) {
    return [...arr].sort((a, b) => (b.productCount ?? 0) - (a.productCount ?? 0));
  }

  function setBtn(btn, loading, label) {
    btn.disabled = loading;
    const labelEl   = btn.querySelector('.btn-label');
    const spinnerEl = btn.querySelector('.btn-spinner');
    if (labelEl)  labelEl.textContent = label;
    if (spinnerEl) spinnerEl.hidden = !loading;
  }

  function timeAgo(dateStr) {
    if (!dateStr) return 'Unknown date';
    const diff  = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years  = Math.floor(days / 365);
    if (mins < 1)    return 'Just now';
    if (mins < 60)   return `${mins}m ago`;
    if (hours < 24)  return `${hours}h ago`;
    if (days < 7)    return `${days}d ago`;
    if (weeks < 5)   return `${weeks}w ago`;
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
});