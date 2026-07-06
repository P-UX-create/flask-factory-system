document.addEventListener('DOMContentLoaded', () => {
  const skeletonWrap = document.getElementById('skeletonWrap');
  const dashContent  = document.getElementById('dashContent');
  const pageError    = document.getElementById('pageError');
  const pageErrorMsg = document.getElementById('pageErrorMsg');
  const retryBtn     = document.getElementById('retryBtn');
  const trendPeriod  = document.getElementById('trendPeriod');
  const exportTrendPdf = document.getElementById('exportTrendPdf');
  const exportDonutPdf = document.getElementById('exportDonutPdf');

  let state = { brands: [], trends: [] };

  async function loadDashboard() {
    skeletonWrap.hidden = false;
    dashContent.hidden  = true;
    pageError.hidden    = true;
    skeletonWrap.setAttribute('aria-busy', 'true');

    try {
      const data = await apiFetch('/api/dashboard');

      state.brands = data.brands || [];
      state.trends = data.trends || [];

      if (typeof initUsername === 'function' && data.user) {
        initUsername(data.user);
      }

      renderBrandsList(state.brands.slice(0, 5));
      renderDonut(state.brands);
      renderTrend(state.trends, trendPeriod ? Number(trendPeriod.value) : 6);

      skeletonWrap.hidden = true;
      skeletonWrap.setAttribute('aria-busy', 'false');
      dashContent.hidden  = false;

    } catch (err) {
      skeletonWrap.hidden = true;
      if (err.status === 401) { window.location.replace('/login'); return; }
      if (pageErrorMsg) pageErrorMsg.textContent = err.message || 'Failed to load dashboard.';
      pageError.hidden = false;
    }
  }

  if (retryBtn) retryBtn.addEventListener('click', loadDashboard);

  if (trendPeriod) {
    trendPeriod.addEventListener('change', () => {
      renderTrend(state.trends, Number(trendPeriod.value));
    });
  }

  if (exportTrendPdf) {
    exportTrendPdf.addEventListener('click', () => {
      const canvas = document.getElementById('trendChart');
      if (!canvas) return;
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('landscape');
      pdf.setFont('Helvetica', 'bold');
      pdf.text('Product Trend Report', 14, 15);
      pdf.addImage(imgData, 'PNG', 14, 25, 268, 140);
      pdf.save('trend-chart.pdf');
    });
  }

  if (exportDonutPdf) {
    exportDonutPdf.addEventListener('click', () => {
      const canvas = document.getElementById('donutChart');
      if (!canvas) return;
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('portrait');
      
      // Title
      pdf.setFont('Helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('Production by Brand Report', 14, 15);
      
      // Render Pie Chart Image
      pdf.addImage(imgData, 'PNG', 45, 25, 120, 120);
      
      // Add Color Guide/Legend Section
      const top = state.brands.slice(0, 8);
      if (top.length > 0) {
        const values = top.map(b => b.totalQty || b.productCount || 0);
        const total = values.reduce((s, v) => s + v, 0);
        
        let currentY = 160;
        
        pdf.setFont('Helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text('Brand Color Guide', 14, currentY);
        currentY += 8;
        
        pdf.setFont('Helvetica', 'normal');
        pdf.setFontSize(10);
        
        top.forEach((brand, i) => {
          const brandQty = brand.totalQty || brand.productCount || 0;
          const pct = total > 0 ? ((brandQty / total) * 100).toFixed(1) : 0;
          const color = PALETTE[i % PALETTE.length];
          
          // Draw indicator color block
          pdf.setFillColor(color);
          pdf.rect(14, currentY - 3.5, 4, 4, 'F');
          
          // Draw text labels
          pdf.setTextColor('#111418');
          pdf.text(`${brand.name}: ${brandQty.toLocaleString()} units (${pct}%)`, 22, currentY);
          
          currentY += 6.5;
        });
      }
      
      pdf.save('brand-pie-chart.pdf');
    });
  }

  loadDashboard();
});

function renderBrandsList(brands) {
  const container = document.getElementById('brandsContent');
  if (!container) return;

  if (!brands || brands.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span aria-hidden="true">🏷️</span>
        <p>No brands recorded yet.<br>Add production records to see your top brands.</p>
      </div>`;
    return;
  }

  const maxQty = Math.max(...brands.map(b => b.productCount || 0), 1);
  const ul = document.createElement('ul');
  ul.className = 'brands-list';

  brands.forEach((brand, i) => {
    const count = brand.productCount || 0;
    const pct   = Math.round((count / maxQty) * 100);
    const color = PALETTE[i % PALETTE.length];
    const li    = document.createElement('li');
    li.className = 'brand-item';
    li.innerHTML = `
      <div class="brand-item-row">
        <span class="brand-name">${escapeHtml(brand.name)}</span>
        <span class="brand-qty">${count.toLocaleString()} products</span>
      </div>
      <div class="brand-bar-track">
        <div class="brand-bar-fill" style="width:0%;background:${color}"
          data-pct="${pct}"></div>
      </div>`;
    ul.appendChild(li);
  });

  container.innerHTML = '';
  container.appendChild(ul);

  requestAnimationFrame(() => {
    container.querySelectorAll('.brand-bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.pct + '%';
    });
  });
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}