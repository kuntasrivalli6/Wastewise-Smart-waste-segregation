import rateLimit from 'express-rate-limit';
import { errorResponse } from '../utils/response.js';

export const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 'RATE_LIMIT_EXCEEDED', 'Too many requests. Please try again later.', 429);
  },
});

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60, // Limit each IP to 60 requests per 15 min for write endpoints
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 'RATE_LIMIT_EXCEEDED', 'Too many submissions. Please wait before trying again.', 429);
  },
});

