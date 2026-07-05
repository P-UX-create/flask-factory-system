const PALETTE = [
  '#5b8cff', '#f97316', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#14b8a6', '#ef4444',
];

function getAccentColor() {
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return dark ? '#5b8cff' : '#2563eb';
}

function getChartDefaults() {
  const dark  = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const muted = dark ? '#a3aab5' : '#5a6270';
  const grid  = dark ? '#2a2e38' : '#e2e5ea';
  return { muted, grid };
}

function renderDonut(brands) {
  const donutContent = document.getElementById('donutContent');
  const donutEmpty   = document.getElementById('donutEmpty');
  const canvas       = document.getElementById('donutChart');
  const legendEl     = document.getElementById('donutLegend');

  if (!brands || brands.length === 0) {
    if (donutContent) donutContent.hidden = true;
    if (donutEmpty) donutEmpty.hidden = false;
    return;
  }

  if (donutEmpty) donutEmpty.hidden = true;
  if (donutContent) donutContent.hidden = false;

  const top     = brands.slice(0, 8);
  const labels  = top.map(b => b.name);
  const values  = top.map(b => b.totalQty);
  const colors  = top.map((_, i) => PALETTE[i % PALETTE.length]);
  const total   = values.reduce((s, v) => s + v, 0);

  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: 'transparent',
        hoverOffset: 8,
      }],
    },
    options: {
      cutout: '68%',
      animation: { animateRotate: true, duration: 700 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
              return ` ${ctx.label}: ${ctx.parsed.toLocaleString()} units (${pct}%)`;
            },
          },
        },
      },
    },
  });

  if (legendEl) {
    legendEl.innerHTML = '';
    top.forEach((brand, i) => {
      const pct = total > 0 ? ((brand.totalQty / total) * 100).toFixed(1) : 0;
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="legend-dot" style="background:${colors[i]}"></span>
        <span class="legend-label">${brand.name}</span>
        <span class="legend-pct">${pct}%</span>
      `;
      legendEl.appendChild(li);
    });
  }
}

let trendChartInstance = null;

function renderTrend(products, months) {
  const trendContent = document.getElementById('trendContent');
  const trendEmpty   = document.getElementById('trendEmpty');
  const canvas       = document.getElementById('trendChart');

  if (!products || products.length === 0) {
    if (trendContent) trendContent.hidden = true;
    if (trendEmpty) trendEmpty.hidden = false;
    return;
  }

  if (trendEmpty) trendEmpty.hidden = true;
  if (trendContent) trendContent.hidden = false;

  const buckets = buildMonthBuckets(months);

  const productMap = {};
  products.forEach(record => {
    const name  = record.name || record.product || 'Unknown';
    const month = dateToMonthKey(record.date);
    if (!productMap[name]) productMap[name] = {};
    productMap[name][month] = (productMap[name][month] || 0) + (record.qty || 0);
  });

  const productNames = Object.keys(productMap);
  const { muted, grid } = getChartDefaults();

  const datasets = productNames.map((name, i) => ({
    label: name,
    data: buckets.map(b => productMap[name][b.key] || 0),
    borderColor: PALETTE[i % PALETTE.length],
    backgroundColor: PALETTE[i % PALETTE.length] + '22',
    borderWidth: 2,
    pointRadius: 3,
    pointHoverRadius: 5,
    tension: 0.35,
    fill: productNames.length === 1,
  }));

  if (trendChartInstance) {
    trendChartInstance.destroy();
    trendChartInstance = null;
  }

  trendChartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels: buckets.map(b => b.label),
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 500 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            color: muted,
            boxWidth: 12,
            boxHeight: 12,
            padding: 14,
            font: { size: 12, family: 'Inter, system-ui, sans-serif' },
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()} units`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: grid },
          ticks: { color: muted, font: { size: 11 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: grid },
          ticks: {
            color: muted,
            font: { size: 11 },
            callback: (v) => v.toLocaleString(),
          },
        },
      },
    },
  });
}

function buildMonthBuckets(count) {
  const buckets = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    buckets.push({ key, label });
  }
  return buckets;
}

function dateToMonthKey(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}