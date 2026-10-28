import { api } from './api.js';
import { auth } from './auth.js';
import { $, showToast, formatDate, escapeHTML } from './utils.js';

export async function initDashboard() {
  if (!auth.requireAuth()) return;

  const user = auth.getUser();
  const welcomeEl = $('#dashboard-welcome');
  if (welcomeEl) {
    welcomeEl.textContent = `Welcome back, ${user.full_name || 'Resident'}!`;
  }

  try {
    const summaryRes = await api.getDashboardSummary();
    const summary = summaryRes.data;

    // Populate metric cards
    $('#stat-classifications').textContent = summary.totalClassifications;
    $('#stat-points').textContent = summary.points;
    $('#stat-tier').textContent = `${summary.badge} ${summary.tier}`;
    $('#stat-modules').textContent = summary.completedModulesCount;

    // Render Chart
    renderActivityChart(summary.categoryBreakdown || []);

    // Render Recent Activity Feed
    renderRecentActivity(summary.recentActivity || []);
  } catch (err) {
    showToast('Failed to load dashboard', err.message, 'error');
  }
}

function renderActivityChart(categories) {
  const chartCanvas = $('#categoryChart');
  if (!chartCanvas) return;

  const labels = categories.map(c => c.name);
  const dataValues = categories.map(c => c.count);
  const bgColors = categories.map(c => c.color);

  const total = dataValues.reduce((a, b) => a + b, 0);

  // If Chart.js is present on window
  if (window.Chart) {
    new window.Chart(chartCanvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: total === 0 ? [1, 1, 1, 1, 1, 1] : dataValues,
          backgroundColor: total === 0 ? ['#E2E8F0', '#E2E8F0', '#E2E8F0', '#E2E8F0', '#E2E8F0', '#E2E8F0'] : bgColors,
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          tooltip: {
            enabled: total > 0,
          },
        },
      },
    });
  } else {
    // Fallback accessible HTML list
    const chartWrapper = chartCanvas.parentElement;
    chartWrapper.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem;">
        ${categories.map(c => `
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
              <span>${escapeHTML(c.name)}</span>
              <strong>${c.count} items</strong>
            </div>
            <div style="background: var(--color-bg-alt); height: 8px; border-radius: 4px; overflow: hidden;">
              <div style="background: ${c.color}; width: ${total > 0 ? (c.count / total) * 100 : 0}%; height: 100%;"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

function renderRecentActivity(records) {
  const container = $('#recent-activity-list');
  if (!container) return;

  if (records.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 2rem 1rem;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🌱</div>
        <h4>No activity recorded yet</h4>
        <p>Classify your household waste items to see your history and earn reward points.</p>
        <a href="classifier.html" class="btn btn-primary btn-sm">Classify Your First Item</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Waste Item</th>
            <th>Category</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${records.map(rec => `
            <tr>
              <td style="font-weight: 600;">${escapeHTML(rec.input_text)}</td>
              <td>
                <span class="badge" style="background-color: ${rec.category?.color_hex || '#10B981'}15; color: ${rec.category?.color_hex || '#059669'};">
                  ${escapeHTML(rec.category?.name || 'General')}
                </span>
              </td>
              <td style="color: var(--color-text-muted); font-size: 0.85rem;">
                ${formatDate(rec.created_at)}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

