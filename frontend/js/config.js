/**
 * Waste Wise Frontend Configuration
 * Auto-detects runtime API endpoints and Supabase configuration
 */
export const CONFIG = {
  // Configured via window.__ENV__ or sensible defaults
  API_BASE_URL: window.__ENV__?.API_BASE_URL || 'http://localhost:5000/api/v1',
  SUPABASE_URL: window.__ENV__?.SUPABASE_URL || 'https://mock-supabase-url.supabase.co',
  SUPABASE_ANON_KEY: window.__ENV__?.SUPABASE_ANON_KEY || 'mock-anon-key',
  APP_NAME: 'Waste Wise',
  TAGLINE: 'Segregate Smart. Live Green.',
};

