import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { validateBody } from '../middleware/validate.js';
import { categorySchema, itemSchema, moduleSchema, rewardRuleSchema } from '../validators/schemas.js';
import { adminService } from '../services/adminService.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

// Enforce authentication & admin privilege on all admin routes
router.use(requireAuth, requireAdmin);

// GET /api/v1/admin/overview
router.get('/overview', async (req, res, next) => {
  try {
    const overview = await adminService.getOverview();
    return successResponse(res, overview);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/users
router.get('/users', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const users = await adminService.getUsers(limit);
    return successResponse(res, users);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/audit-logs
router.get('/audit-logs', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const logs = await adminService.getAuditLogs(limit);
    return successResponse(res, logs);
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// CATEGORIES MANAGEMENT
// -------------------------------------------------------------

// GET /api/v1/admin/categories
router.get('/categories', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('waste_categories')
      .select('*')
      .order('name');
    if (error) throw error;
    return successResponse(res, data || []);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/categories
router.post('/categories', validateBody(categorySchema), async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('waste_categories')
      .insert(req.validatedBody)
      .select()
      .single();

    if (error) throw error;

    await adminService.logAudit(req.user.id, 'CREATE_CATEGORY', 'waste_categories', data.id, {
      name: data.name,
      slug: data.slug,
    });

    return successResponse(res, data, {}, 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/admin/categories/:id
router.put('/categories/:id', validateBody(categorySchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('waste_categories')
      .update(req.validatedBody)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return errorResponse(res, 'NOT_FOUND', 'Category not found', 404);

    await adminService.logAudit(req.user.id, 'UPDATE_CATEGORY', 'waste_categories', id, req.validatedBody);
    return successResponse(res, data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/admin/categories/:id
router.delete('/categories/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('waste_categories').delete().eq('id', id);
    if (error) throw error;

    await adminService.logAudit(req.user.id, 'DELETE_CATEGORY', 'waste_categories', id);
    return successResponse(res, { deleted: true, id });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// WASTE ITEMS MANAGEMENT
// -------------------------------------------------------------

// GET /api/v1/admin/items
router.get('/items', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('waste_items')
      .select('*, category:waste_categories(name, color_hex)')
      .order('name');
    if (error) throw error;
    return successResponse(res, data || []);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/items
router.post('/items', validateBody(itemSchema), async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('waste_items')
      .insert(req.validatedBody)
      .select()
      .single();

    if (error) throw error;

    await adminService.logAudit(req.user.id, 'CREATE_ITEM', 'waste_items', data.id, {
      name: data.name,
      category_id: data.category_id,
    });

    return successResponse(res, data, {}, 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/admin/items/:id
router.put('/items/:id', validateBody(itemSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('waste_items')
      .update(req.validatedBody)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return errorResponse(res, 'NOT_FOUND', 'Item not found', 404);

    await adminService.logAudit(req.user.id, 'UPDATE_ITEM', 'waste_items', id, req.validatedBody);
    return successResponse(res, data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/admin/items/:id
router.delete('/items/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('waste_items').delete().eq('id', id);
    if (error) throw error;

    await adminService.logAudit(req.user.id, 'DELETE_ITEM', 'waste_items', id);
    return successResponse(res, { deleted: true, id });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// LEARNING MODULES MANAGEMENT
// -------------------------------------------------------------

// GET /api/v1/admin/learning
router.get('/learning', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('learning_modules')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return successResponse(res, data || []);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/learning
router.post('/learning', validateBody(moduleSchema), async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('learning_modules')
      .insert(req.validatedBody)
      .select()
      .single();

    if (error) throw error;

    await adminService.logAudit(req.user.id, 'CREATE_MODULE', 'learning_modules', data.id, {
      title: data.title,
    });

    return successResponse(res, data, {}, 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/admin/learning/:id
router.put('/learning/:id', validateBody(moduleSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('learning_modules')
      .update(req.validatedBody)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return errorResponse(res, 'NOT_FOUND', 'Module not found', 404);

    await adminService.logAudit(req.user.id, 'UPDATE_MODULE', 'learning_modules', id, req.validatedBody);
    return successResponse(res, data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/admin/learning/:id
router.delete('/learning/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('learning_modules').delete().eq('id', id);
    if (error) throw error;

    await adminService.logAudit(req.user.id, 'DELETE_MODULE', 'learning_modules', id);
    return successResponse(res, { deleted: true, id });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// REWARD RULES MANAGEMENT
// -------------------------------------------------------------

// GET /api/v1/admin/reward-rules
router.get('/reward-rules', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('reward_rules').select('*').order('event_type');
    if (error) throw error;
    return successResponse(res, data || []);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/admin/reward-rules/:id
router.put('/reward-rules/:id', validateBody(rewardRuleSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('reward_rules')
      .update(req.validatedBody)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return errorResponse(res, 'NOT_FOUND', 'Reward rule not found', 404);

    await adminService.logAudit(req.user.id, 'UPDATE_REWARD_RULE', 'reward_rules', id, req.validatedBody);
    return successResponse(res, data);
  } catch (err) {
    next(err);
  }
});

export default router;

