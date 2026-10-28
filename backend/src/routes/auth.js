import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { successResponse } from '../utils/response.js';

const router = express.Router();

// GET /api/v1/health
router.get('/health', (req, res) => {
  return successResponse(res, {
    status: 'healthy',
    service: 'Waste Wise API',
    version: '1.0.0',
    uptime: process.uptime(),
  });
});

// GET /api/v1/me
router.get('/me', requireAuth, (req, res) => {
  return successResponse(res, {
    user: req.user,
  });
});

export default router;

