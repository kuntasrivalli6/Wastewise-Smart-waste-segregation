import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { rewardService } from '../services/rewardService.js';
import { successResponse } from '../utils/response.js';

const router = express.Router();

// GET /api/v1/rewards/balance
router.get('/balance', requireAuth, async (req, res, next) => {
  try {
    const balance = await rewardService.getUserBalance(req.user.id);
    return successResponse(res, balance);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/rewards/ledger
router.get('/ledger', requireAuth, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const ledger = await rewardService.getUserLedger(req.user.id, limit);
    return successResponse(res, ledger);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/rewards/rules
router.get('/rules', async (req, res, next) => {
  try {
    const rules = await rewardService.getRules();
    return successResponse(res, rules);
  } catch (err) {
    next(err);
  }
});

export default router;

