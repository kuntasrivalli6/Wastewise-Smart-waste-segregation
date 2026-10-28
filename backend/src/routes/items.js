import express from 'express';
import { supabase } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { validateQuery } from '../middleware/validate.js';
import { paginationSchema } from '../validators/schemas.js';
import { DEFAULT_ITEMS, DEFAULT_CATEGORIES } from '../services/classificationService.js';

const router = express.Router();

// GET /api/v1/items
router.get('/', validateQuery(paginationSchema), async (req, res, next) => {
  try {
    const { page, limit, search, category } = req.validatedQuery;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('waste_items')
      .select('*, category:waste_categories(id, name, slug, color_hex)', { count: 'exact' })
      .eq('is_active', true);

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    if (category) {
      query = query.eq('category_id', category);
    }

    query = query.range(offset, offset + limit - 1).order('name');
    const { data, count, error } = await query;

    if (error || !data || data.length === 0) {
      // Fallback filtering on DEFAULT_ITEMS
      let filtered = [...DEFAULT_ITEMS];
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(i => 
          i.name.toLowerCase().includes(s) || 
          (i.aliases && i.aliases.some(a => a.toLowerCase().includes(s)))
        );
      }
      if (category) {
        filtered = filtered.filter(i => i.category_id === category);
      }

      const paginated = filtered.slice(offset, offset + limit).map(item => {
        const cat = DEFAULT_CATEGORIES.find(c => c.id === item.category_id);
        return { ...item, category: cat };
      });

      return successResponse(res, paginated, {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      });
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

// GET /api/v1/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('waste_items')
      .select('*, category:waste_categories(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      const fallback = DEFAULT_ITEMS.find(i => i.id === id);
      if (fallback) {
        const cat = DEFAULT_CATEGORIES.find(c => c.id === fallback.category_id);
        return successResponse(res, { ...fallback, category: cat });
      }
      return errorResponse(res, 'ITEM_NOT_FOUND', 'Waste item not found in catalog', 404);
    }

    return successResponse(res, data);
  } catch (err) {
    next(err);
  }
});

export default router;

