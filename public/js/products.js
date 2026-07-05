const CATEGORIES = [
  'Beverages', 'Food & Consumables', 'Pharmaceuticals',
  'Cosmetics & Personal Care', 'Electronics', 'Packaging',
  'Textiles', 'Chemicals', 'Automotive Parts', 'Raw Materials', 'Other',
];

// ── State ─────────────────────────────────────────────────────────────────
let allProducts  = [];   
let allBrands    = [];  
let activeDetail = null; 

// ── DOM refs ──────────────────────────────────────────────────────────────
const productsGrid    = document.getElementById('productsGrid');
const skeletonWrap    = document.getElementById('skeletonWrap');
const emptyAll        = document.getElementById('emptyAll');
const emptyFiltered   = document.getElementById('emptyFiltered');
const emptyFilteredMsg= document.getElementById('emptyFilteredMsg');
const productCount    = document.getElementById('productCount');
const pageError       = document.getElementById('pageError');
const pageErrorMsg    = document.getElementById('pageErrorMsg');

const searchInput     = document.getElementById('searchInput');
const searchClear     = document.getElementById('searchClear');
const filterCategory  = document.getElementById('filterCategory');
const filterBrand     = document.getElementById('filterBrand');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');

const openCreateBtn   = document.getElementById('openCreateBtn');
const modalBackdrop   = document.getElementById('modalBackdrop');
const productModal    = document.getElementById('productModal');
const modalTitle      = document.getElementById('modalTitle');
const modalAlert      = document.getElementById('modalAlert');
const productForm     = document.getElementById('productForm');
const productId       = document.getElementById('productId');
const fieldName       = document.getElementById('fieldName');
const fieldBrand      = document.getElementById('fieldBrand');
const fieldCategory   = document.getElementById('fieldCategory');
const fieldStock      = document.getElementById('fieldStock');
const modalSubmitBtn  = document.getElementById('modalSubmitBtn');
const modalCancelBtn  = document.getElementById('modalCancelBtn');
const modalClose      = document.getElementById('modalClose');

const detailBackdrop  = document.getElementById('detailBackdrop');
const detailPanel     = document.getElementById('detailPanel');
const detailClose     = document.getElementById('detailClose');
const detailName      = document.getElementById('detailName');
const detailBrand     = document.getElementById('detailBrand');
const detailCategory  = document.getElementById('detailCategory');
const detailStock     = document.getElementById('detailStock');
const detailCreated   = document.getElementById('detailCreated');
const detailUpdated   = document.getElementById('detailUpdated');
const detailEditBtn   = document.getElementById('detailEditBtn');
const detailDeleteBtn = document.getElementById('detailDeleteBtn');
const detailConfirm   = document.getElementById('detailConfirm');
const detailConfirmName   = document.getElementById('detailConfirmName');
const detailConfirmCancel = document.getElementById('detailConfirmCancel');
const detailConfirmOk     = document.getElementById('detailConfirmOk');

// ── Bootstrap ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([loadProducts(), loadBrands()]);
  bindFilters();
  bindModal();
  bindDetail();
});

// ── Data loading ──────────────────────────────────────────────────────────
async function loadProducts() {
  setLoading(true);
  pageError.hidden = true;
  try {
    const data = await apiFetch('/api/products');
    allProducts = Array.isArray(data) ? data : (data.products || []);
    renderGrid(applyFilters());
  } catch (err) {
    skeletonWrap.hidden = true;
    pageErrorMsg.textContent = err.message || 'Failed to load products.';
    pageError.hidden = false;
    if (err.status === 401) window.location.replace('/');
  } finally {
    setLoading(false);
  }
}

async function loadBrands() {
  try {
    const data = await apiFetch('/api/brands/select');
    allBrands = Array.isArray(data) ? data : (data.brands || []);
    populateBrandDropdowns();
  } catch {
    showToast('Could not load brands list.', 'error');
  }
}

function populateBrandDropdowns() {
  filterBrand.innerHTML = '<option value="">All brands</option>';
  fieldBrand.innerHTML = '<option value="">Select a brand…</option>';

  allBrands.forEach(b => {
    const opt1 = new Option(b.name, b.id);
    const opt2 = new Option(b.name, b.id);
    filterBrand.appendChild(opt1);
    fieldBrand.appendChild(opt2);
  });
}

// ── Filtering and search ──────────────────────────────────────────────────
function applyFilters() {
  const q      = searchInput.value.trim().toLowerCase();
  const cat    = filterCategory.value;
  const brandId = filterBrand.value;

  return allProducts.filter(p => {
    const matchName  = !q || p.name.toLowerCase().includes(q);
    const matchCat   = !cat || p.category === cat;
    const matchBrand = !brandId || p.brand_id === brandId;
    return matchName && matchCat && matchBrand;
  });
}

function bindFilters() {
  searchInput.addEventListener('input', () => {
    searchClear.hidden = searchInput.value.length === 0;
    renderGrid(applyFilters());
    updateClearBtn();
  });
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.hidden = true;
    renderGrid(applyFilters());
    updateClearBtn();
  });
  filterCategory.addEventListener('change', () => {
    renderGrid(applyFilters());
    updateClearBtn();
  });
  filterBrand.addEventListener('change', () => {
    renderGrid(applyFilters());
    updateClearBtn();
  });
  clearFiltersBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.hidden = true;
    filterCategory.value = '';
    filterBrand.value = '';
    clearFiltersBtn.hidden = true;
    renderGrid(applyFilters());
  });
  document.getElementById('retryBtn')
    .addEventListener('click', loadProducts);
}

function updateClearBtn() {
  const active = searchInput.value || filterCategory.value || filterBrand.value;
  clearFiltersBtn.hidden = !active;
}

// ── Render ────────────────────────────────────────────────────────────────
function renderGrid(products) {
  productsGrid.innerHTML = '';
  emptyAll.hidden = true;
  emptyFiltered.hidden = true;
  productsGrid.hidden = true;

  const total    = allProducts.length;
  const filtered = products.length;
  const hasFilter = searchInput.value || filterCategory.value || filterBrand.value;

  productCount.textContent =
    filtered === total
      ? `${total} product${total !== 1 ? 's' : ''}`
      : `${filtered} of ${total} products`;

  if (total === 0) {
    emptyAll.hidden = false;
    return;
  }
  if (filtered === 0) {
    emptyFilteredMsg.textContent = hasFilter
      ? 'No products match your filters.'
      : 'No products yet.';
    emptyFiltered.hidden = false;
    return;
  }

  products.forEach((p, i) => {
    const card = buildCard(p, i);
    productsGrid.appendChild(card);
  });
  productsGrid.hidden = false;
}

function buildCard(p, index) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.style.animationDelay = `${index * 30}ms`;
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `View details for ${p.name}`);

  const stockClass = p.stock === 0 ? 'empty' : p.stock < 10 ? 'low' : 'ok';
  const stockLabel = p.stock === 0 ? 'Out of stock' : `${p.stock.toLocaleString()} units`;

  card.innerHTML = `
    <div class="product-card-top">
      <span class="product-card-name">${escHtml(p.name)}</span>
      <span class="product-card-category">${escHtml(p.category)}</span>
    </div>
    <div class="product-card-brand">${escHtml(p.brand_name || '—')}</div>
    <div class="product-card-stock">
      <span class="stock-dot ${stockClass}"></span>
      ${stockLabel}
    </div>
  `;

  card.addEventListener('click', () => openDetail(p));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(p); }
  });

  return card;
}

// ── Detail panel ──────────────────────────────────────────────────────────
function openDetail(p) {
  activeDetail = p;
  detailName.textContent     = p.name;
  detailBrand.textContent    = p.brand_name || '—';
  detailCategory.textContent = p.category;
  detailStock.textContent    = `${p.stock.toLocaleString()} units`;
  detailCreated.textContent  = formatDate(p.created_at);
  detailUpdated.textContent  = formatDate(p.updated_at);

  detailConfirm.hidden = true;
  detailBackdrop.hidden = false;
  detailPanel.hidden = false;
  detailBackdrop.removeAttribute('aria-hidden');
  document.body.style.overflow = 'hidden';
  detailClose.focus();
}

function closeDetail() {
  detailPanel.hidden = true;
  detailBackdrop.hidden = true;
  detailBackdrop.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  activeDetail = null;
  detailConfirm.hidden = true;
}

function bindDetail() {
  detailClose.addEventListener('click', closeDetail);
  detailBackdrop.addEventListener('click', closeDetail);

  detailEditBtn.addEventListener('click', () => {
  if (!activeDetail) return;
  const product = activeDetail;
  closeDetail();
  openModal(product);
});

  detailDeleteBtn.addEventListener('click', () => {
    if (!activeDetail) return;
    detailConfirmName.textContent = activeDetail.name;
    detailConfirm.hidden = false;
    detailConfirmOk.focus();
  });

  detailConfirmCancel.addEventListener('click', () => {
    detailConfirm.hidden = true;
  });

  detailConfirmOk.addEventListener('click', () => deleteProduct());

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !detailPanel.hidden) closeDetail();
  });
}

// ── Modal (create / edit) ─────────────────────────────────────────────────
function openModal(product = null) {
  modalTitle.textContent = 'Update stock';
  modalSubmitBtn.querySelector('.btn-label').textContent = 'Save changes';

  productId.value     = product.id;
  fieldName.value     = product.name;
  fieldBrand.value    = product.brand_id;
  fieldCategory.value = product.category;
  fieldStock.value    = product.stock;

  fieldName.readOnly     = true;
  fieldBrand.disabled    = true;
  fieldCategory.disabled = true;

  [fieldName, fieldBrand, fieldCategory].forEach(el => {
    el.style.opacity = '0.6';
    el.style.cursor  = 'not-allowed';
  });

  clearModalErrors();
  modalAlert.hidden  = false;
  modalAlert.textContent = 'Only stock quantity can be updated.';
  modalAlert.className   = 'form-alert form-alert-info';
  modalBackdrop.hidden   = false;
  productModal.hidden    = false;
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => fieldStock.focus());
}

function closeModal() {
  productModal.hidden  = true;
  modalBackdrop.hidden = true;
  document.body.style.overflow = '';
  productForm.reset();
  productId.value = '';
  clearModalErrors();
  modalAlert.hidden    = true;
  modalAlert.className = 'form-alert';

  setSubmitting(modalSubmitBtn, false);
  modalSubmitBtn.querySelector('.btn-label').textContent = 'Create product';

  fieldName.readOnly     = false;
  fieldBrand.disabled    = false;
  fieldCategory.disabled = false;
  [fieldName, fieldBrand, fieldCategory].forEach(el => {
    el.style.opacity = '';
    el.style.cursor  = '';
  });
}

function clearModalErrors() {
  ['fieldName', 'fieldBrand', 'fieldCategory', 'fieldStock'].forEach(id => {
    const input = document.getElementById(id);
    const err   = document.getElementById(`${id}Error`);
    if (input) input.classList.remove('is-invalid');
    if (err)   err.textContent = '';
  });
}

function setModalFieldError(id, msg) {
  const input = document.getElementById(id);
  const err   = document.getElementById(`${id}Error`);
  if (input) input.classList.add('is-invalid');
  if (err)   err.textContent = msg;
}

function validateModal() {
  let ok = true;
  const isEdit = Boolean(productId.value);

  if (!isEdit) {
    if (!fieldName.value.trim()) {
      setModalFieldError('fieldName', 'Product name is required.');
      ok = false;
    }
    if (!fieldBrand.value) {
      setModalFieldError('fieldBrand', 'Please select a brand.');
      ok = false;
    }
    if (!fieldCategory.value) {
      setModalFieldError('fieldCategory', 'Please select a category.');
      ok = false;
    }
  }

  const stock = parseInt(fieldStock.value, 10);
  if (fieldStock.value === '' || isNaN(stock) || stock <= 0) {
    setModalFieldError('fieldStock', 'Enter a valid stock quantity (greater than 0).');
    ok = false;
  }

  return ok;
}

function bindModal() {
  openCreateBtn.addEventListener('click', () => {
    fieldName.readOnly     = false;
    fieldBrand.disabled    = false;
    fieldCategory.disabled = false;
    [fieldName, fieldBrand, fieldCategory].forEach(el => {
      el.style.opacity = '';
      el.style.cursor  = '';
    });

    modalTitle.textContent = 'New product';
    modalSubmitBtn.querySelector('.btn-label').textContent = 'Create product';
    modalAlert.hidden  = true;
    modalAlert.className = 'form-alert';
    productId.value    = '';
    fieldName.value    = '';
    fieldBrand.value   = '';
    fieldCategory.value = '';
    fieldStock.value   = '';

    clearModalErrors();
    modalBackdrop.hidden = false;
    productModal.hidden  = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => fieldName.focus());
  });

  modalClose.addEventListener('click', closeModal);
  modalCancelBtn.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !productModal.hidden) closeModal();
  });

  productForm.addEventListener('submit', async e => {
    e.preventDefault();
    clearModalErrors();
    modalAlert.hidden = true;

    if (!validateModal()) return;

    const isEdit = Boolean(productId.value);
    const payload = isEdit
      ? { stock: fieldStock.valueAsNumber }
      : {
          name: fieldName.value.trim(),
          brand_id: fieldBrand.value,
          category: fieldCategory.value,
          stock: fieldStock.valueAsNumber,
        };

    setSubmitting(modalSubmitBtn, true);

    try {
      if (isEdit) {
        await apiFetch(`/api/products/${productId.value}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        showToast('Product updated.', 'success');
      } else {
        await apiFetch('/api/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showToast('Product created.', 'success');
      }
      closeModal();
      await loadProducts();
    } catch (err) {
      modalAlert.textContent = err.message || 'Something went wrong. Please try again.';
      modalAlert.hidden = false;
      setSubmitting(modalSubmitBtn, false);
    }
  });
}

// ── Delete ────────────────────────────────────────────────────────────────
async function deleteProduct() {
  if (!activeDetail) return;
  setSubmitting(detailConfirmOk, true);
  try {
    await apiFetch(`/api/products/${activeDetail.id}`, { method: 'DELETE' });
    showToast(`"${activeDetail.name}" deleted.`, 'success');
    closeDetail();
    await loadProducts();
  } catch (err) {
    showToast(err.message || 'Delete failed.', 'error');
  } finally {
    setSubmitting(detailConfirmOk, false);
  }
}

// ── Utilities ─────────────────────────────────────────────────────────────
function setLoading(on) {
  skeletonWrap.hidden = !on;
  if (on) skeletonWrap.setAttribute('aria-busy', 'true');
  else    skeletonWrap.removeAttribute('aria-busy');
}

function setSubmitting(btn, on) {
  btn.disabled = on;
  const label   = btn.querySelector('.btn-label');
  const spinner = btn.querySelector('.btn-spinner');
  if (label)  label.style.opacity = on ? '0.6' : '1';
  if (spinner) spinner.hidden = !on;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span style="flex:1">${escHtml(message)}</span>
    <button class="toast-close" aria-label="Dismiss">✕</button>
  `;
  toast.querySelector('.toast-close').addEventListener('click', () => dismiss(toast));
  container.appendChild(toast);
  setTimeout(() => dismiss(toast), 4000);

  function dismiss(t) {
    t.classList.add('is-leaving');
    t.addEventListener('animationend', () => t.remove(), { once: true });
  }
}