import { CONFIG } from './config.js';
import { api } from './api.js';
import { showToast } from './utils.js';

class AuthService {
  constructor() {
    this.tokenKey = 'waste_wise_token';
    this.userKey = 'waste_wise_user';
    this.supabaseClient = null;

    // Initialize Supabase if script is loaded
    if (window.supabase && CONFIG.SUPABASE_URL && !CONFIG.SUPABASE_URL.includes('mock-')) {
      this.supabaseClient = window.supabase.createClient(
        CONFIG.SUPABASE_URL,
        CONFIG.SUPABASE_ANON_KEY
      );
    }
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  getUser() {
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) : null;
  }

  isAuthenticated() {
    return Boolean(this.getToken() && this.getUser());
  }

  isAdmin() {
    const user = this.getUser();
    return user?.role === 'admin';
  }

  setSession(token, user) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  clearSession() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  /**
   * User registration
   */
  async register(fullName, email, password) {
    if (this.supabaseClient) {
      const { data, error } = await this.supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) throw error;

      if (data?.session) {
        this.setSession(data.session.access_token, {
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          role: 'user',
        });
      }
      return data;
    } else {
      // Local development fallback mock
      const mockUser = {
        id: `mock-user-${Date.now()}`,
        email,
        full_name: fullName,
        role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
      };
      this.setSession(`mock-token-${mockUser.id}`, mockUser);
      return { user: mockUser };
    }
  }

  /**
   * User login
   */
  async login(email, password) {
    if (this.supabaseClient) {
      const { data, error } = await this.supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.session) {
        this.setSession(data.session.access_token, {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || 'Eco Citizen',
          role: data.user.user_metadata?.role || 'user',
        });

        // Sync fresh profile from API
        try {
          const me = await api.getMe();
          if (me?.data?.user) {
            this.setSession(data.session.access_token, me.data.user);
          }
        } catch {}
      }
      return data;
    } else {
      // Local development fallback mock
      const mockRole = email.toLowerCase().includes('admin') ? 'admin' : 'user';
      const mockUser = {
        id: `mock-user-${Date.now()}`,
        email,
        full_name: mockRole === 'admin' ? 'Chief Sustainability Officer' : 'Priya Sharma',
        role: mockRole,
      };
      this.setSession(`mock-token-${mockRole}-${mockUser.id}`, mockUser);
      return { user: mockUser };
    }
  }

  /**
   * Logout
   */
  async logout() {
    if (this.supabaseClient) {
      try {
        await this.supabaseClient.auth.signOut();
      } catch {}
    }
    this.clearSession();
    showToast('Signed Out', 'You have been successfully signed out.', 'info');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 400);
  }

  /**
   * Route guard for authenticated pages (e.g. dashboard.html, rewards.html)
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      showToast('Authentication Required', 'Please log in to access this page.', 'warning');
      window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
      return false;
    }
    return true;
  }

  /**
   * Route guard for administrator pages (admin.html)
   */
  requireAdmin() {
    if (!this.isAuthenticated()) {
      window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
      return false;
    }
    if (!this.isAdmin()) {
      showToast('Access Denied', 'Administrator privileges are required.', 'error');
      window.location.href = 'dashboard.html';
      return false;
    }
    return true;
  }
}

export const auth = new AuthService();

