import { createClient } from '@supabase/supabase-js';
import { ENV } from './env.js';

export const isConfigured = Boolean(
  ENV.SUPABASE_URL &&
  !ENV.SUPABASE_URL.includes('mock-supabase-url') &&
  ENV.SUPABASE_ANON_KEY &&
  !ENV.SUPABASE_ANON_KEY.includes('mock-') &&
  process.env.NODE_ENV !== 'test'
);

// Server-side privileged client using service-role key for backend operations
export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Helper to create a client on behalf of an authenticated user token
export function createUserClient(token) {
  return createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
