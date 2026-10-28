import express from 'express';
import { supabase, isConfigured } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { DEFAULT_CATEGORIES } from '../services/classificationService.js';

const router = express.Router();

// GET /api/v1/categories
router.get('/', async (req, res, next) => {
  try {
    if (!isConfigured) {
      return successResponse(res, DEFAULT_CATEGORIES);
    }

    const { data, error } = await supabase
      .from('waste_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error || !data || data.length === 0) {
      return successResponse(res, DEFAULT_CATEGORIES);
    }

    return successResponse(res, data);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/categories/:idOrSlug
router.get('/:idOrSlug', async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    const query = supabase.from('waste_categories').select('*');
    if (isUuid) {
      query.eq('id', idOrSlug);
    } else {
      query.eq('slug', idOrSlug);
    }

    const { data, error } = await query.single();
    if (error || !data) {
      const fallback = DEFAULT_CATEGORIES.find(c => c.id === idOrSlug || c.slug === idOrSlug);
      if (fallback) return successResponse(res, fallback);
      return errorResponse(res, 'CATEGORY_NOT_FOUND', 'Waste category not found', 404);
    }

    return successResponse(res, data);
  } catch (err) {
    next(err);
  }
});

export default router;
