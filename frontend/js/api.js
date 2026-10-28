import { CONFIG } from './config.js';
import { showToast } from './utils.js';

class ApiClient {
  constructor() {
    this.baseUrl = CONFIG.API_BASE_URL;
  }

  getAuthToken() {
    return localStorage.getItem('waste_wise_token') || null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const error = new Error(data?.error?.message || `HTTP ${response.status} Request failed`);
        error.status = response.status;
        error.code = data?.error?.code || 'API_ERROR';
        error.details = data?.error?.details;
        throw error;
      }

      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        showToast('Network Error', 'Cannot connect to Waste Wise server. Please verify the backend is running.', 'error');
      }
      throw err;
    }
  }

  // 1. Health & Identity
  getHealth() { return this.request('/health'); }
  getMe() { return this.request('/me'); }

  // 2. Categories & Items
  getCategories() { return this.request('/categories'); }
  getItems(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/items${query ? `?${query}` : ''}`);
  }

  // 3. Classifier
  classifyWaste(text, saveRecord = false) {
    return this.request('/classifications', {
      method: 'POST',
      body: JSON.stringify({ text, saveRecord }),
    });
  }

  getClassificationHistory(page = 1) {
    return this.request(`/classifications?page=${page}`);
  }

  // 4. Learning
  getLearningModules() { return this.request('/learning'); }
  getLearningModule(slug) { return this.request(`/learning/${slug}`); }
  completeModule(id) {
    return this.request(`/learning/${id}/complete`, {
      method: 'POST',
    });
  }

  // 5. Rewards
  getRewardBalance() { return this.request('/rewards/balance'); }
  getRewardLedger(limit = 50) { return this.request(`/rewards/ledger?limit=${limit}`); }
  getRewardRules() { return this.request('/rewards/rules'); }

  // 6. Dashboard
  getDashboardSummary() { return this.request('/dashboard/summary'); }
  getDashboardActivity() { return this.request('/dashboard/activity'); }

  // 7. Admin
  getAdminOverview() { return this.request('/admin/overview'); }
  getAdminUsers() { return this.request('/admin/users'); }
  getAdminAuditLogs() { return this.request('/admin/audit-logs'); }

  getAdminCategories() { return this.request('/admin/categories'); }
  createAdminCategory(data) { return this.request('/admin/categories', { method: 'POST', body: JSON.stringify(data) }); }
  updateAdminCategory(id, data) { return this.request(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  deleteAdminCategory(id) { return this.request(`/admin/categories/${id}`, { method: 'DELETE' }); }

  getAdminItems() { return this.request('/admin/items'); }
  createAdminItem(data) { return this.request('/admin/items', { method: 'POST', body: JSON.stringify(data) }); }
  updateAdminItem(id, data) { return this.request(`/admin/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  deleteAdminItem(id) { return this.request(`/admin/items/${id}`, { method: 'DELETE' }); }

  getAdminLearning() { return this.request('/admin/learning'); }
  createAdminLearning(data) { return this.request('/admin/learning', { method: 'POST', body: JSON.stringify(data) }); }
  updateAdminLearning(id, data) { return this.request(`/admin/learning/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  deleteAdminLearning(id) { return this.request(`/admin/learning/${id}`, { method: 'DELETE' }); }

  getAdminRewardRules() { return this.request('/admin/reward-rules'); }
  updateAdminRewardRule(id, data) { return this.request(`/admin/reward-rules/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
}

export const api = new ApiClient();

