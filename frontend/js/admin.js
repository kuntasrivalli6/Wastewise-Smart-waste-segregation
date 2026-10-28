import { api } from './api.js';
import { auth } from './auth.js';
import { $, $$, showToast, formatDate, escapeHTML } from './utils.js';

export async function initAdmin() {
  if (!auth.requireAdmin()) return;

  // Tab switching
  const tabBtns = $$('.admin-tab-btn');
  const tabPanes = $$('.admin-tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active', 'btn-primary'));
      tabBtns.forEach(b => b.classList.add('btn-outline'));

      btn.classList.add('active', 'btn-primary');
      btn.classList.remove('btn-outline');

      const targetTab = btn.getAttribute('data-tab');
      tabPanes.forEach(pane => {
        pane.style.display = pane.id === `tab-${targetTab}` ? 'block' : 'none';
      });

      loadTabData(targetTab);
    });
  });

  // Load Initial Overview
  await loadOverview();
  await loadCategories();

  async function loadOverview() {
    try {
      const res = await api.getAdminOverview();
      const o = res.data;
      $('#metric-users').textContent = o.usersCount;
      $('#metric-classifications').textContent = o.classificationsCount;
      $('#metric-items').textContent = o.itemsCount;
      $('#metric-categories').textContent = o.categoriesCount;
      $('#metric-points').textContent = o.totalPointsAwarded;
    } catch (err) {
      showToast('Overview Error', err.message, 'error');
    }
  }

  async function loadTabData(tab) {
    if (tab === 'categories') await loadCategories();
    else if (tab === 'items') await loadItems();
    else if (tab === 'learning') await loadLearning();
    else if (tab === 'rules') await loadRules();
    else if (tab === 'users') await loadUsers();
    else if (tab === 'audit') await loadAudit();
  }

  // 1. Categories
  async function loadCategories() {
    const tbody = $('#admin-categories-tbody');
    if (!tbody) return;
    try {
      const res = await api.getCategories();
      const cats = res.data || [];
      tbody.innerHTML = cats.map(c => `
        <tr>
          <td style="font-weight: 600;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${c.color_hex}; margin-right: 6px;"></span>
            ${escapeHTML(c.name)}
          </td>
          <td style="font-family: monospace; font-size: 0.85rem;">${escapeHTML(c.slug)}</td>
          <td style="color: var(--color-text-muted); font-size: 0.85rem;">${escapeHTML(c.description?.slice(0, 60))}...</td>
          <td>
            <button class="btn btn-danger btn-sm btn-del-cat" data-id="${c.id}">Delete</button>
          </td>
        </tr>
      `).join('');

      $$('.btn-del-cat').forEach(b => {
        b.onclick = async () => {
          if (confirm('Delete this category?')) {
            try {
              await api.deleteAdminCategory(b.getAttribute('data-id'));
              showToast('Deleted', 'Category removed successfully.', 'info');
              loadCategories();
            } catch (err) {
              showToast('Delete Failed', err.message, 'error');
            }
          }
        };
      });
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="4" style="color: var(--color-danger);">${escapeHTML(err.message)}</td></tr>`;
    }
  }

  // 2. Items
  async function loadItems() {
    const tbody = $('#admin-items-tbody');
    if (!tbody) return;
    try {
      const res = await api.getItems({ limit: 50 });
      const items = res.data || [];
      tbody.innerHTML = items.map(item => `
        <tr>
          <td style="font-weight: 600;">${escapeHTML(item.name)}</td>
          <td>
            <span class="badge" style="background: ${item.category?.color_hex || '#10B981'}15; color: ${item.category?.color_hex || '#059669'};">
              ${escapeHTML(item.category?.name || 'Category')}
            </span>
          </td>
          <td style="font-size: 0.8rem; color: var(--color-text-muted);">
            ${(item.aliases || []).slice(0, 3).join(', ')}
          </td>
          <td>
            <button class="btn btn-danger btn-sm btn-del-item" data-id="${item.id}">Delete</button>
          </td>
        </tr>
      `).join('');

      $$('.btn-del-item').forEach(b => {
        b.onclick = async () => {
          if (confirm('Delete this waste catalog item?')) {
            try {
              await api.deleteAdminItem(b.getAttribute('data-id'));
              showToast('Deleted', 'Item removed from catalog.', 'info');
              loadItems();
            } catch (err) {
              showToast('Delete Failed', err.message, 'error');
            }
          }
        };
      });
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="4" style="color: var(--color-danger);">${escapeHTML(err.message)}</td></tr>`;
    }
  }

  // 3. Learning
  async function loadLearning() {
    const tbody = $('#admin-learning-tbody');
    if (!tbody) return;
    try {
      const res = await api.getLearningModules();
      const modules = res.data || [];
      tbody.innerHTML = modules.map(m => `
        <tr>
          <td style="font-weight: 600;">${escapeHTML(m.title)}</td>
          <td><span class="badge badge-wet">${escapeHTML(m.difficulty)}</span></td>
          <td>${m.estimated_minutes} min</td>
          <td>+${m.points_reward} Pts</td>
          <td>
            <button class="btn btn-danger btn-sm btn-del-mod" data-id="${m.id}">Delete</button>
          </td>
        </tr>
      `).join('');

      $$('.btn-del-mod').forEach(b => {
        b.onclick = async () => {
          if (confirm('Delete this learning module?')) {
            try {
              await api.deleteAdminLearning(b.getAttribute('data-id'));
              showToast('Deleted', 'Module removed.', 'info');
              loadLearning();
            } catch (err) {
              showToast('Delete Failed', err.message, 'error');
            }
          }
        };
      });
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5" style="color: var(--color-danger);">${escapeHTML(err.message)}</td></tr>`;
    }
  }

  // 4. Reward Rules
  async function loadRules() {
    const tbody = $('#admin-rules-tbody');
    if (!tbody) return;
    try {
      const res = await api.getRewardRules();
      const rules = res.data || [];
      tbody.innerHTML = rules.map(r => `
        <tr>
          <td style="font-weight: 600;">${escapeHTML(r.event_type)}</td>
          <td>${escapeHTML(r.description)}</td>
          <td>
            <input type="number" class="form-input rule-pts-input" data-id="${r.id}" value="${r.points}" min="0" style="width: 90px; padding: 0.35rem 0.5rem;" />
          </td>
          <td>
            <button class="btn btn-primary btn-sm btn-save-rule" data-id="${r.id}" data-event="${r.event_type}" data-desc="${r.description}">
              Save Points
            </button>
          </td>
        </tr>
      `).join('');

      $$('.btn-save-rule').forEach(b => {
        b.onclick = async () => {
          const id = b.getAttribute('data-id');
          const input = $(`input.rule-pts-input[data-id="${id}"]`);
          const pts = parseInt(input.value, 10);
          try {
            await api.updateAdminRewardRule(id, {
              event_type: b.getAttribute('data-event'),
              description: b.getAttribute('data-desc'),
              points: pts,
              is_active: true,
            });
            showToast('Updated', `Rule updated to ${pts} points.`, 'success');
          } catch (err) {
            showToast('Save Failed', err.message, 'error');
          }
        };
      });
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="4" style="color: var(--color-danger);">${escapeHTML(err.message)}</td></tr>`;
    }
  }

  // 5. Users
  async function loadUsers() {
    const tbody = $('#admin-users-tbody');
    if (!tbody) return;
    try {
      const res = await api.getAdminUsers();
      const users = res.data || [];
      tbody.innerHTML = users.map(u => `
        <tr>
          <td style="font-weight: 600;">${escapeHTML(u.full_name)}</td>
          <td>
            <span class="badge ${u.role === 'admin' ? 'badge-hazardous' : 'badge-wet'}">
              ${escapeHTML(u.role)}
            </span>
          </td>
          <td style="color: var(--color-text-muted); font-size: 0.85rem;">${formatDate(u.created_at)}</td>
        </tr>
      `).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="3" style="color: var(--color-danger);">${escapeHTML(err.message)}</td></tr>`;
    }
  }

  // 6. Audit Logs
  async function loadAudit() {
    const tbody = $('#admin-audit-tbody');
    if (!tbody) return;
    try {
      const res = await api.getAdminAuditLogs();
      const logs = res.data || [];
      if (logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--color-text-muted);">No audit entries recorded yet.</td></tr>`;
        return;
      }
      tbody.innerHTML = logs.map(l => `
        <tr>
          <td><span class="badge badge-dry">${escapeHTML(l.action)}</span></td>
          <td style="font-family: monospace; font-size: 0.85rem;">${escapeHTML(l.entity_type)}</td>
          <td style="color: var(--color-text-muted); font-size: 0.85rem;">${escapeHTML(JSON.stringify(l.metadata || {}))}</td>
          <td style="color: var(--color-text-muted); font-size: 0.85rem;">${formatDate(l.created_at)}</td>
        </tr>
      `).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="4" style="color: var(--color-danger);">${escapeHTML(err.message)}</td></tr>`;
    }
  }
}

