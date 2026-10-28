import express from 'express';
import { supabase } from '../config/supabase.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { classifyInputSchema, paginationSchema } from '../validators/schemas.js';
import { classificationService } from '../services/classificationService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { strictLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// POST /api/v1/classifications
// Allows both guest classifications and authenticated saves
router.post(
  '/',
  strictLimiter,
  optionalAuth,
  validateBody(classifyInputSchema),
  async (req, res, next) => {
    try {
      const { text, saveRecord } = req.validatedBody;
      const result = await classificationService.classify(text, req.user, saveRecord);
      return successResponse(res, result);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/v1/classifications
// List authenticated user's classifications
router.get('/', requireAuth, validateQuery(paginationSchema), async (req, res, next) => {
  try {
    const { page, limit } = req.validatedQuery;
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from('classification_records')
      .select('*, category:waste_categories(name, slug, color_hex, icon_name)', { count: 'exact' })
      .eq('user_id', req.user.id)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      return successResponse(res, [], { page, limit, total: 0, totalPages: 0 });
    }

    return successResponse(res, data, {
      page,
      limit,
      total: count || data.length,
      totalPages: Math.ceil((count || data.length) / limit),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/classifications/:id
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('classification_records')
      .select('*, category:waste_categories(*), item:waste_items(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return errorResponse(res, 'RECORD_NOT_FOUND', 'Classification record not found', 404);
    }

    // IDOR protection: verify ownership unless admin
    if (data.user_id !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'FORBIDDEN', 'Access denied to this record', 403);
    }

    return successResponse(res, data);
  } catch (err) {
    next(err);
  }
});

export default router;

