/**
 * Standardized JSON response helpers
 */

export function successResponse(res, data, meta = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  });
}

export function errorResponse(res, code, message, statusCode = 400, details = null) {
  const payload = {
    error: {
      code,
      message,
    },
  };
  if (details) {
    payload.error.details = details;
  }
  return res.status(statusCode).json(payload);
}

