import { errorResponse } from '../utils/response.js';

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      return errorResponse(res, 'VALIDATION_ERROR', 'Please check your input.', 422, details);
    }
    req.validatedBody = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const details = result.error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      return errorResponse(res, 'VALIDATION_ERROR', 'Invalid query parameters.', 422, details);
    }
    req.validatedQuery = result.data;
    next();
  };
}

