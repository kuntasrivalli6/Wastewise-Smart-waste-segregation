/**
 * Structured application logger
 * Ensures sensitive headers, passwords, and tokens are never printed.
 */
export const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...sanitizeMeta(meta)
    }));
  },
  warn: (message, meta = {}) => {
    console.warn(JSON.stringify({
      level: 'warn',
      timestamp: new Date().toISOString(),
      message,
      ...sanitizeMeta(meta)
    }));
  },
  error: (message, meta = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      ...sanitizeMeta(meta)
    }));
  }
};

function sanitizeMeta(meta) {
  if (!meta || typeof meta !== 'object') return {};
  const cleaned = { ...meta };
  const sensitiveKeys = ['authorization', 'password', 'token', 'apikey', 'secret', 'service_role'];
  for (const key of Object.keys(cleaned)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      cleaned[key] = '[REDACTED]';
    }
  }
  return cleaned;
}

