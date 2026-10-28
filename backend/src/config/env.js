import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'http://localhost:3000,http://127.0.0.1:5500,http://localhost:5500',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://mock-supabase-url.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'mock-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'mock-service-role-key',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
};

export function validateEnv() {
  const missing = [];
  if (!process.env.SUPABASE_URL && ENV.IS_PRODUCTION) missing.push('SUPABASE_URL');
  if (!process.env.SUPABASE_ANON_KEY && ENV.IS_PRODUCTION) missing.push('SUPABASE_ANON_KEY');
  
  if (missing.length > 0) {
    console.warn(`[Config Warning] Missing production environment variables: ${missing.join(', ')}`);
  }
}

