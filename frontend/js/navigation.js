import { auth } from './auth.js';
import { $ } from './utils.js';

export function initNavigation() {
  const headerContainer = $('#site-header-container');
  const user = auth.getUser();
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  const navHtml = `
    <header class="site-header">
      <div class="container nav-wrapper">
        <a href="index.html" class="brand-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
          </svg>
          <span>Waste Wise</span>
          <span class="brand-badge">India</span>
        </a>

        <button class="mobile-menu-btn" id="mobile-toggle" aria-label="Toggle Navigation Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <nav class="main-nav" id="main-nav">
          <ul class="nav-links">
            <li><a href="index.html" class="nav-link ${currentPath === 'index.html' ? 'active' : ''}">Home</a></li>
            <li><a href="classifier.html" class="nav-link ${currentPath === 'classifier.html' ? 'active' : ''}">Waste Classifier</a></li>
            <li><a href="learn.html" class="nav-link ${currentPath === 'learn.html' ? 'active' : ''}">Learn Center</a></li>
            ${user ? `
              <li><a href="dashboard.html" class="nav-link ${currentPath === 'dashboard.html' ? 'active' : ''}">Dashboard</a></li>
              <li><a href="rewards.html" class="nav-link ${currentPath === 'rewards.html' ? 'active' : ''}">Rewards</a></li>
              ${user.role === 'admin' ? `<li><a href="admin.html" class="nav-link ${currentPath === 'admin.html' ? 'active' : ''}">Admin</a></li>` : ''}
            ` : ''}
          </ul>

          <div class="nav-actions">
            ${user ? `
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span class="badge ${user.role === 'admin' ? 'badge-hazardous' : 'badge-wet'}">
                  ${user.role === 'admin' ? 'Admin' : 'Resident'}
                </span>
                <span style="font-size: 0.9rem; font-weight: 600; color: var(--color-text-main);">${escapeHTML(user.full_name || 'User')}</span>
                <button class="btn btn-outline btn-sm" id="btn-nav-logout">Log Out</button>
              </div>
            ` : `
              <a href="login.html" class="btn btn-outline btn-sm">Log In</a>
              <a href="register.html" class="btn btn-primary btn-sm">Get Started</a>
            `}
          </div>
        </nav>
      </div>
    </header>
  `;

  if (headerContainer) {
    headerContainer.innerHTML = navHtml;
  }

  // Mobile toggle click
  const toggleBtn = $('#mobile-toggle');
  const mainNav = $('#main-nav');
  if (toggleBtn && mainNav) {
    toggleBtn.addEventListener('click', () => {
      mainNav.classList.toggle('active');
    });
  }

  // Logout listener
  const logoutBtn = $('#btn-nav-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      auth.logout();
    });
  }

  // Inject Footer if footer container exists
  const footerContainer = $('#site-footer-container');
  if (footerContainer) {
    footerContainer.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-col">
              <div class="brand-logo" style="color: #FFFFFF; margin-bottom: 1rem;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34D399" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                </svg>
                <span>Waste Wise</span>
              </div>
              <p style="color: #94A3B8; font-size: 0.9rem;">
                Empowering Indian households and communities with smart, rule-based waste segregation guidance and rewards for responsible disposal.
              </p>
            </div>
            <div class="footer-col">
              <h4>Platform</h4>
              <ul>
                <li><a href="classifier.html">Waste Classifier</a></li>
                <li><a href="learn.html">Education Center</a></li>
                <li><a href="rewards.html">Points & Rewards</a></li>
                <li><a href="dashboard.html">Resident Dashboard</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Waste Streams</h4>
              <ul>
                <li><a href="classifier.html">Wet & Biodegradable</a></li>
                <li><a href="classifier.html">Dry Recyclables</a></li>
                <li><a href="classifier.html">Domestic Hazardous</a></li>
                <li><a href="classifier.html">Sanitary & E-Waste</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Compliance & Civic</h4>
              <ul>
                <li><a href="privacy.html">Privacy Policy</a></li>
                <li><a href="terms.html">Terms of Service</a></li>
                <li><a href="https://moef.gov.in/" target="_blank" rel="noopener">SWM Rules (2016)</a></li>
                <li><a href="https://swachhbharatmission.ddws.gov.in/" target="_blank" rel="noopener">Swachh Bharat Mission</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <div>© ${new Date().getFullYear()} Waste Wise. Built for sustainable Indian communities.</div>
            <div>Segregate Smart. Live Green. 🌿</div>
          </div>
        </div>
      </footer>
    `;
  }
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

