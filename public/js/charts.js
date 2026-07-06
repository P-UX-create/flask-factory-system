const PALETTE = [
  '#5B8CFF', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B', '#14B8A6',
  '#FFFFFF', '#1D4ED8', '#FF69B4', '#228B22', '#FF8C00', '#4B0082',
  '#111827', '#FFD700', '#00CED1', '#A52A2A', '#ADD8E6', '#9370DB',
  '#F97316', '#3B82F6', '#32CD32', '#EC4899', '#CD853F', '#F3F4F6',
  '#000000', '#00FF00', '#FF0000', '#0000FF', '#FFFF00', '#00FFFF',
  '#FF00FF', '#6EE7B7', '#C084FC', '#FCA5A5', '#FDE047', '#AFEEEE',
  '#800000', '#008000', '#000080', '#808080', '#C0C0C0', '#F5F5DC',
  '#DC143C', '#FF4500', '#FFA500', '#EAB308', '#34D399', '#60A5FA',
  '#9932CC', '#F472B6', '#D2691E', '#708090', '#F0F8FF', '#FFF8DC',
  '#8B0000', '#B22222', '#CD5C5C', '#F08080', '#FA8072', '#E9967A',
  '#FB923C', '#FDBA74', '#FED7AA', '#FBBF24', '#FEF08A', '#FFFFE0',
  '#006400', '#2E8B57', '#3CB371', '#00FF7F', '#7CFC00', '#9ACD32',
  '#008080', '#20B2AA', '#2DD4BF', '#5EEAD4', '#99F6E4', '#40E0D0',
  '#48D1CC', '#B0E0E6', '#87CEEB', '#87CEFA', '#4682B4', '#6495ED',
  '#1E90FF', '#00BFFF', '#00008B', '#0000CD', '#2563EB', '#93C5FD',
  '#BFDBFE', '#483D8B', '#6A5ACD', '#7B68EE', '#A855F7', '#D8B4FE',
  '#E9D5FF', '#9400D3', '#BA55D3', '#DA70D6', '#EE82EE', '#DB7093',
  '#FFC0CB', '#FF1493', '#FFB6C1', '#8B4513', '#A0522D', '#BC8F8F',
  '#DEB887', '#D2B48C', '#F4A460', '#C19A6B', '#1F2937', '#374151',
  '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB', '#F9FAFB',
  '#696969', '#A9A9A9', '#D3D3D3', '#778899', '#F8F8FF', '#FAFAFA',
  '#FFFAFA', '#FFFFF0', '#FDF5E6', '#FAEBD7', '#FFEFD5', '#FFF5EE',
  '#F0FFF0', '#F0FFFF', '#E6E6FA', '#556B2F', '#ADFF2F'
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
  const values  = top.map(b => b.totalQty || b.productCount || 0);
  const colors  = top.map((_, i) => PALETTE[i % PALETTE.length]);
  const total   = values.reduce((s, v) => s + v, 0);

  new Chart(canvas, {
    type: 'pie',
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
      const brandQty = brand.totalQty || brand.productCount || 0;
      const pct = total > 0 ? ((brandQty / total) * 100).toFixed(1) : 0;
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