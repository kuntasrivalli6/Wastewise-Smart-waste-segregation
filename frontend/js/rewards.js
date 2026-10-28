import { api } from './api.js';
import { auth } from './auth.js';
import { $, showToast, formatDate, escapeHTML } from './utils.js';

export async function initRewards() {
  if (!auth.requireAuth()) return;

  try {
    // 1. Fetch balance & tier
    const balanceRes = await api.getRewardBalance();
    const balance = balanceRes.data;

    $('#user-total-points').textContent = balance.totalPoints;
    $('#user-tier-badge').textContent = balance.badge;
    $('#user-tier-name').textContent = balance.tier;

    // Progress Bar
    const progressBar = $('#tier-progress-fill');
    const nextTierText = $('#next-tier-info');

    let percent = 100;
    if (balance.pointsToNextTier > 0) {
      const target = balance.totalPoints + balance.pointsToNextTier;
      percent = Math.min(Math.round((balance.totalPoints / target) * 100), 100);
      nextTierText.textContent = `${balance.pointsToNextTier} points needed to reach ${balance.nextTier}`;
    } else {
      nextTierText.textContent = `You have reached the maximum Sustainability Champion rank! 🌟`;
    }
    if (progressBar) progressBar.style.width = `${percent}%`;

    // 2. Fetch Ledger Transactions
    const ledgerRes = await api.getRewardLedger();
    const ledger = ledgerRes.data || [];
    renderLedger(ledger);

    // 3. Fetch Reward Rules
    const rulesRes = await api.getRewardRules();
    const rules = rulesRes.data || [];
    renderRules(rules);
  } catch (err) {
    showToast('Failed to load rewards', err.message, 'error');
  }
}

function renderLedger(entries) {
  const container = $('#ledger-tbody');
  if (!container) return;

  if (entries.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
          No reward transactions recorded yet. Complete activities to earn your first points!
        </td>
      </tr>
    `;
    return;
  }

  container.innerHTML = entries.map(entry => `
    <tr>
      <td style="font-weight: 600;">
        ${formatEventType(entry.event_type)}
      </td>
      <td>
        <span class="badge badge-wet" style="font-size: 0.85rem;">
          +${entry.points_delta} Pts
        </span>
      </td>
      <td style="font-family: monospace; font-size: 0.8rem; color: var(--color-text-muted);">
        ${escapeHTML(entry.idempotency_key?.slice(0, 28) || '—')}...
      </td>
      <td style="color: var(--color-text-muted); font-size: 0.85rem;">
        ${formatDate(entry.created_at)}
      </td>
    </tr>
  `).join('');
}

function renderRules(rules) {
  const container = $('#rules-tbody');
  if (!container) return;

  container.innerHTML = rules.map(rule => `
    <tr>
      <td style="font-weight: 600;">${formatEventType(rule.event_type)}</td>
      <td style="color: var(--color-text-muted);">${escapeHTML(rule.description)}</td>
      <td>
        <span class="badge badge-dry">+${rule.points} Pts</span>
      </td>
    </tr>
  `).join('');
}

function formatEventType(type) {
  switch (type) {
    case 'classify_waste': return '🔍 Waste Classification';
    case 'complete_module': return '📚 Completed Learning Guide';
    case 'daily_streak': return '🔥 Daily Segregation Streak';
    default: return type || 'Civic Activity';
  }
}

