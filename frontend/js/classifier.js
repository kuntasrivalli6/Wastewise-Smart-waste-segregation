import { api } from './api.js';
import { auth } from './auth.js';
import { $, $$, showToast, escapeHTML } from './utils.js';

export function initClassifier() {
  const form = $('#classifier-form');
  const input = $('#waste-input');
  const resultContainer = $('#classification-result-container');
  const quickChips = $$('.chip');

  // Handle quick chip clicks
  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-item') || chip.textContent.trim();
      if (input) {
        input.value = query;
        performClassification(query);
      }
    });
  });

  // Handle form submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = input?.value?.trim();
      if (!query) {
        showToast('Input Required', 'Please enter a waste item to classify.', 'warning');
        return;
      }
      performClassification(query);
    });
  }

  async function performClassification(query) {
    if (!resultContainer) return;

    // Show loading skeleton
    resultContainer.innerHTML = `
      <div class="card" style="padding: 2.5rem; text-align: center;">
        <div class="spinner" style="width: 2rem; height: 2rem; color: var(--color-primary); margin-bottom: 1rem;"></div>
        <h4>Analyzing "${escapeHTML(query)}" against classification rules...</h4>
        <p>Checking household catalog, material composition, and safety norms.</p>
      </div>
    `;

    try {
      const response = await api.classifyWaste(query, false);
      const data = response.data;

      if (!data.recognized) {
        renderUnrecognized(data);
        return;
      }

      renderRecognizedResult(data);
    } catch (err) {
      resultContainer.innerHTML = `
        <div class="card" style="padding: 2rem; border-color: var(--color-danger); text-align: center;">
          <h4 style="color: var(--color-danger); margin-bottom: 0.5rem;">Classification Error</h4>
          <p>${escapeHTML(err.message || 'Unable to complete classification. Please check your network.')}</p>
        </div>
      `;
    }
  }

  function renderRecognizedResult(data) {
    const isUser = auth.isAuthenticated();
    const cat = data.category;
    const item = data.item;

    resultContainer.innerHTML = `
      <div class="classification-result" style="border-top: 6px solid ${cat.color_hex};">
        <div class="result-badge-wrap">
          <div>
            <span class="badge" style="background-color: ${cat.color_hex}15; color: ${cat.color_hex}; border: 1px solid ${cat.color_hex}40; font-size: 0.9rem; padding: 0.4rem 0.8rem;">
              ● ${escapeHTML(cat.name)}
            </span>
            <h2 style="margin-top: 0.75rem; font-size: 1.75rem;">${escapeHTML(item.name)}</h2>
          </div>
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted); background: var(--color-bg-alt); padding: 0.25rem 0.65rem; border-radius: var(--radius-full);">
            Rule Match: ${data.confidence}
          </span>
        </div>

        <p style="font-size: 1.05rem; color: var(--color-text-main); margin-bottom: 1.25rem;">
          ${escapeHTML(item.description)}
        </p>

        <div class="result-steps">
          <h4>📋 Correct Disposal Instructions:</h4>
          <p style="color: var(--color-text-main); margin-bottom: 0;">${escapeHTML(data.disposal_instructions)}</p>
        </div>

        ${data.safety_notes ? `
          <div class="result-warning">
            <strong>⚠️ Safety & Environmental Precautions:</strong>
            <p style="margin-top: 0.25rem; margin-bottom: 0;">${escapeHTML(data.safety_notes)}</p>
          </div>
        ` : ''}

        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-border);">
          <small style="color: var(--color-text-muted);">
            Classification rule: ${escapeHTML(data.result_explanation)}
          </small>

          ${isUser ? `
            <button class="btn btn-primary" id="btn-save-classification">
              <span>Save to History & Earn +10 Pts</span>
            </button>
          ` : `
            <a href="login.html" class="btn btn-secondary">
              <span>Log In to Save & Earn +10 Pts</span>
            </a>
          `}
        </div>
      </div>
    `;

    // Handle Save and Points Award
    const saveBtn = $('#btn-save-classification');
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<span class="spinner"></span> Saving...`;

        try {
          const saveRes = await api.classifyWaste(data.inputText, true);
          const saveResult = saveRes.data;

          if (saveResult.reward?.awarded) {
            showToast('Activity Logged! +10 Points', `Congratulations! You earned ${saveResult.reward.points} points for segregating responsibly.`, 'success');
            saveBtn.innerHTML = `✓ Saved (+10 Pts)`;
          } else {
            showToast('Saved to History', saveResult.reward?.message || 'Item logged to your activity history.', 'info');
            saveBtn.innerHTML = `✓ Saved to History`;
          }
        } catch (err) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = `Save to History & Earn +10 Pts`;
          showToast('Save Failed', err.message, 'error');
        }
      });
    }
  }

  function renderUnrecognized(data) {
    resultContainer.innerHTML = `
      <div class="card" style="padding: 2.25rem; border-left: 4px solid var(--color-warning);">
        <div style="display: flex; gap: 1rem; align-items: flex-start;">
          <div style="font-size: 2rem;">🔍</div>
          <div>
            <h3 style="margin-bottom: 0.5rem;">Item Not Recognized</h3>
            <p style="color: var(--color-text-main);">${escapeHTML(data.message)}</p>
            <p style="font-size: 0.95rem; color: var(--color-text-muted);">${escapeHTML(data.guidance)}</p>
            
            <div style="margin-top: 1.5rem;">
              <h5 style="margin-bottom: 0.75rem; font-size: 0.9rem; text-transform: uppercase; color: var(--color-text-muted);">Available Categories to Review:</h5>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                ${(data.suggestedCategories || []).map(cat => `
                  <span class="badge" style="background-color: ${cat.color_hex}15; color: ${cat.color_hex}; border: 1px solid ${cat.color_hex}40;">
                    ${escapeHTML(cat.name)}
                  </span>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

