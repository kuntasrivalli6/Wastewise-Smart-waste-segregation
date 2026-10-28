import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { dashboardService } from '../services/dashboardService.js';
import { successResponse } from '../utils/response.js';

const router = express.Router();

// GET /api/v1/dashboard/summary
router.get('/summary', requireAuth, async (req, res, next) => {
  try {
    const summary = await dashboardService.getSummary(req.user.id);
    return successResponse(res, summary);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/dashboard/activity
router.get('/activity', requireAuth, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const activity = await dashboardService.getActivity(req.user.id, limit);
    return successResponse(res, activity);
  } catch (err) {
    next(err);
  }
});

export default router;

