// ── Action metadata map ───────────────────────────────────────────────────
const ACTION_META = {
  product_created:  { label: 'Product created',  icon: '📦', color: 'green' },
  product_deleted:  { label: 'Product deleted',  icon: '🗑️',  color: 'red'   },
  stock_adjusted:   { label: 'Stock adjusted',   icon: '🔢', color: 'blue'  },
  quantity_added:   { label: 'Quantity added',   icon: '➕', color: 'blue'  },
  brand_created:    { label: 'Brand created',    icon: '🏷️',  color: 'green' },
  brand_deleted:    { label: 'Brand deleted',    icon: '🗑️',  color: 'red'   },
};
const FALLBACK_META = { label: null, icon: '🔹', color: 'grey' };

// ── State ─────────────────────────────────────────────────────────────────
let activeDays = 7;

// ── DOM refs ──────────────────────────────────────────────────────────────
const historyFeed   = document.getElementById('historyFeed');
const skeletonWrap  = document.getElementById('skeletonWrap');
const emptyState    = document.getElementById('emptyState');
const emptyMsg      = document.getElementById('emptyMsg');
const activityCount = document.getElementById('activityCount');
const pageError     = document.getElementById('pageError');
const pageErrorMsg  = document.getElementById('pageErrorMsg');

// ── Bootstrap ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  bindFilterToggle();
  bindRetry();
  loadHistory(activeDays);
});

// ── Fetch ─────────────────────────────────────────────────────────────────
async function loadHistory(days) {
  setLoading(true);
  pageError.hidden  = true;
  emptyState.hidden = true;
  historyFeed.hidden = true;

  try {
    const data = await apiFetch(`/api/history?days=${days}&limit=50`);
    const records = Array.isArray(data) ? data : (data.history || []);
    render(records, days);
  } catch (err) {
    skeletonWrap.hidden = true;
    pageErrorMsg.textContent = err.message || 'Failed to load history.';
    pageError.hidden = false;
    if (err.status === 401) window.location.replace('/login');
  } finally {
    setLoading(false);
  }
}

// ── Render ────────────────────────────────────────────────────────────────
function render(records, days) {
  historyFeed.innerHTML = '';

  const total = records.length;
  activityCount.textContent =
    total === 0 ? 'No activity'
    : `${total} activit${total === 1 ? 'y' : 'ies'} · last ${days} days`;

  if (total === 0) {
    emptyMsg.textContent = `No activity in the last ${days} days.`;
    emptyState.hidden = false;
    return;
  }

  const groups = groupByDate(records);

  let rowIndex = 0;
  for (const [dateKey, rows] of groups) {
    const section = buildDateGroup(dateKey, rows, rowIndex);
    historyFeed.appendChild(section);
    rowIndex += rows.length;
  }

  historyFeed.hidden = false;
}

// ── Date grouping ─────────────────────────────────────────────────────────
function groupByDate(records) {
  const map = new Map();
  records.forEach(r => {
    const key = toLocalDateKey(r.created_at);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(r);
  });
  return map;
}

function toLocalDateKey(iso) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dateKeyToLabel(key) {
  const today     = toLocalDateKey(new Date().toISOString());
  const yesterday = toLocalDateKey(new Date(Date.now() - 86400000).toISOString());

  if (key === today)     return 'Today';
  if (key === yesterday) return 'Yesterday';

  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

// ── DOM builders ──────────────────────────────────────────────────────────
function buildDateGroup(dateKey, rows, startIndex) {
  const group = document.createElement('div');
  group.className = 'date-group';

  const label = document.createElement('div');
  label.className = 'date-group-label';
  label.innerHTML = `
    ${escHtml(dateKeyToLabel(dateKey))}
    <span class="date-group-count">${rows.length}</span>
  `;
  group.appendChild(label);

  const list = document.createElement('div');
  list.className = 'history-list';

  rows.forEach((record, i) => {
    list.appendChild(buildRow(record, startIndex + i));
  });

  group.appendChild(list);
  return group;
}

function buildRow(record, index) {
  const meta = ACTION_META[record.action] || {
    ...FALLBACK_META,
    label: record.action
      ? record.action.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
      : 'Unknown action',
  };

  const row = document.createElement('div');
  row.className = 'history-row';
  row.style.animationDelay = `${Math.min(index * 20, 300)}ms`;

  row.innerHTML = `
    <div class="row-icon ${meta.color}" aria-hidden="true">${meta.icon}</div>
    <div class="row-body">
      <div class="row-action">${escHtml(meta.label)}</div>
      <div class="row-subject">${escHtml(record.target_subject || '—')}</div>
    </div>
    <div class="row-time" title="${escHtml(record.created_at)}">
      ${formatTime(record.created_at)}
    </div>
  `;

  return row;
}

// ── Filter toggle ─────────────────────────────────────────────────────────
function bindFilterToggle() {
  document.querySelectorAll('.filter-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const days = Number(btn.dataset.days);
      if (days === activeDays) return;

      activeDays = days;

      document.querySelectorAll('.filter-toggle-btn').forEach(b => {
        b.classList.toggle('is-active', b === btn);
      });

      loadHistory(days);
    });
  });
}

function bindRetry() {
  document.getElementById('retryBtn')
    .addEventListener('click', () => loadHistory(activeDays));
}

// ── Utilities ─────────────────────────────────────────────────────────────
function setLoading(on) {
  skeletonWrap.hidden = !on;
}

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
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
  toast.querySelector('.toast-close')
    .addEventListener('click', () => dismiss(toast));
  container.appendChild(toast);
  setTimeout(() => dismiss(toast), 4000);
  function dismiss(t) {
    t.classList.add('is-leaving');
    t.addEventListener('animationend', () => t.remove(), { once: true });
  }
}