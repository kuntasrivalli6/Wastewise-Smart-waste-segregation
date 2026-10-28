import { api } from './api.js';
import { auth } from './auth.js';
import { $, $$, showToast, escapeHTML } from './utils.js';

export async function initLearning() {
  const container = $('#learning-grid');
  const filterBtns = $$('.filter-btn');
  let currentFilter = 'all';
  let modulesData = [];

  // Filter click handler
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active', 'btn-primary'));
      filterBtns.forEach(b => b.classList.add('btn-outline'));

      btn.classList.add('active', 'btn-primary');
      btn.classList.remove('btn-outline');
      currentFilter = btn.getAttribute('data-filter') || 'all';
      renderModules();
    });
  });

  async function loadModules() {
    if (!container) return;
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
        <div class="spinner" style="width: 2rem; height: 2rem; color: var(--color-primary); margin-bottom: 1rem;"></div>
        <p>Loading educational guides and best practices...</p>
      </div>
    `;

    try {
      const response = await api.getLearningModules();
      modulesData = response.data || [];
      renderModules();
    } catch (err) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
          <p style="color: var(--color-danger);">${escapeHTML(err.message)}</p>
        </div>
      `;
    }
  }

  function renderModules() {
    if (!container) return;

    let filtered = modulesData;
    if (currentFilter !== 'all') {
      filtered = modulesData.filter(m => m.difficulty.toLowerCase() === currentFilter.toLowerCase());
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1;" class="empty-state">
          <div class="empty-state-icon">📚</div>
          <h3>No modules found</h3>
          <p>Try switching filter tabs to see other educational guides.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(mod => `
      <div class="card card-hover" style="display: flex; flex-direction: column;">
        <div class="card-body" style="flex: 1;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <span class="badge" style="background-color: var(--color-primary-light); color: var(--color-primary-dark);">
              ${escapeHTML(mod.category_tag || 'Guide')}
            </span>
            <span style="font-size: 0.8rem; color: var(--color-text-muted);">
              ⏱ ${mod.estimated_minutes} min read
            </span>
          </div>

          <h3 style="font-size: 1.25rem; margin-bottom: 0.75rem; line-height: 1.35;">
            ${escapeHTML(mod.title)}
          </h3>

          <p style="font-size: 0.95rem; margin-bottom: 1.25rem;">
            ${escapeHTML(mod.summary)}
          </p>
        </div>

        <div class="card-footer" style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--color-primary-dark);">
            🏆 +${mod.points_reward} Points
          </span>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${mod.isCompleted ? `
              <span class="badge badge-wet">✓ Completed</span>
            ` : ''}
            <button class="btn btn-outline btn-sm btn-read-module" data-slug="${escapeHTML(mod.slug)}">
              Read Guide →
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach read handlers
    $$('.btn-read-module').forEach(btn => {
      btn.addEventListener('click', () => {
        const slug = btn.getAttribute('data-slug');
        openModuleModal(slug);
      });
    });
  }

  async function openModuleModal(slug) {
    const modal = $('#module-modal');
    const titleEl = $('#modal-title');
    const metaEl = $('#modal-meta');
    const contentEl = $('#modal-content');
    const completeBtn = $('#btn-modal-complete');

    if (!modal) return;

    modal.classList.add('active');
    titleEl.textContent = 'Loading guide...';
    contentEl.innerHTML = '<div class="spinner" style="color: var(--color-primary);"></div>';

    try {
      const response = await api.getLearningModule(slug);
      const mod = response.data;

      titleEl.textContent = mod.title;
      metaEl.innerHTML = `
        <span class="badge badge-wet">${escapeHTML(mod.difficulty)}</span>
        <span>⏱ ${mod.estimated_minutes} min</span>
        <span>🏆 Earn ${mod.points_reward} points</span>
        ${mod.isCompleted ? '<span class="badge badge-wet">✓ Already Completed</span>' : ''}
      `;

      // Simple Markdown parser for headers and lists
      contentEl.innerHTML = formatMarkdown(mod.content);

      if (completeBtn) {
        if (mod.isCompleted) {
          completeBtn.disabled = true;
          completeBtn.textContent = '✓ Already Completed';
        } else {
          completeBtn.disabled = false;
          completeBtn.textContent = `Complete & Earn +${mod.points_reward} Points`;
          completeBtn.onclick = async () => {
            if (!auth.isAuthenticated()) {
              showToast('Log in Required', 'Please log in to record completion and earn points.', 'warning');
              window.location.href = 'login.html';
              return;
            }

            completeBtn.disabled = true;
            completeBtn.innerHTML = `<span class="spinner"></span> Verifying completion...`;

            try {
              const res = await api.completeModule(mod.id);
              if (res.data.reward?.awarded) {
                showToast('Reward Earned!', `You received ${res.data.reward.points} points for completing this module!`, 'success');
              } else {
                showToast('Completed', res.data.message || 'Module marked as completed.', 'info');
              }
              completeBtn.textContent = '✓ Completed!';
              // Refresh modules list
              await loadModules();
            } catch (err) {
              completeBtn.disabled = false;
              completeBtn.textContent = 'Complete & Earn Points';
              showToast('Error', err.message, 'error');
            }
          };
        }
      }
    } catch (err) {
      contentEl.innerHTML = `<p style="color: var(--color-danger);">${escapeHTML(err.message)}</p>`;
    }
  }

  // Close modal listeners
  const modalClose = $('#modal-close');
  const modalOverlay = $('#module-modal');
  if (modalClose && modalOverlay) {
    modalClose.addEventListener('click', () => modalOverlay.classList.remove('active'));
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove('active');
    });
  }

  await loadModules();
}

function formatMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/^# (.*$)/gim, '<h2 style="margin: 1.25rem 0 0.5rem; font-size: 1.5rem;">$1</h2>')
    .replace(/^## (.*$)/gim, '<h3 style="margin: 1rem 0 0.4rem; font-size: 1.25rem;">$1</h3>')
    .replace(/^### (.*$)/gim, '<h4 style="margin: 0.75rem 0 0.35rem; font-size: 1.1rem;">$1</h4>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^\* (.*$)/gim, '<li style="margin-left: 1.25rem; margin-bottom: 0.35rem;">$1</li>')
    .replace(/\n{2,}/g, '<p style="margin: 0.75rem 0;"></p>');
}

