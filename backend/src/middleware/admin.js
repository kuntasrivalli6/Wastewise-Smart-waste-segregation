import { errorResponse } from '../utils/response.js';

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return errorResponse(res, 'UNAUTHORIZED', 'Authentication required.', 401);
  }

  if (req.user.role !== 'admin') {
    return errorResponse(
      res,
      'FORBIDDEN',
      'Access denied. Administrator privileges are required.',
      403
    );
  }

  next();
}

