import app from './app.js';
import { ENV, validateEnv } from './config/env.js';
import { logger } from './utils/logger.js';

validateEnv();

const server = app.listen(ENV.PORT, () => {
  logger.info(`Waste Wise backend REST API listening on port ${ENV.PORT} [${ENV.NODE_ENV}]`);
  console.log(`\n🌿 Waste Wise API running at: http://localhost:${ENV.PORT}/api/v1/health\n`);
});

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

