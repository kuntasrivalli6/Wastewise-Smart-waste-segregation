import { logger } from '../utils/logger.js';
import { errorResponse } from '../utils/response.js';

export function errorHandler(err, req, res, next) {
  logger.error(err.message || 'Unhandled Server Error', {
    method: req.method,
    url: req.originalUrl,
    name: err.name,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  if (err.name === 'ZodError') {
    return errorResponse(res, 'VALIDATION_ERROR', 'Input validation failed.', 422, err.errors);
  }

  if (err.status || err.statusCode) {
    const status = err.status || err.statusCode;
    return errorResponse(res, err.code || 'API_ERROR', err.message || 'An error occurred', status);
  }

  return errorResponse(
    res,
    'INTERNAL_SERVER_ERROR',
    'An unexpected error occurred. Please try again later.',
    500
  );
}

export function notFoundHandler(req, res) {
  return errorResponse(res, 'NOT_FOUND', `Cannot ${req.method} ${req.originalUrl}`, 404);
}

