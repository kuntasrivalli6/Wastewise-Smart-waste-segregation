import express from 'express';
import { supabase } from '../config/supabase.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { rewardService } from '../services/rewardService.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

const FALLBACK_MODULES = [
  {
    id: 'm1111111-1111-1111-1111-111111111111',
    title: 'The 3-Way Waste Segregation Rule in Indian Cities',
    slug: 'three-way-segregation-guide',
    summary: 'Master the fundamentals of segregating wet, dry, and sanitary waste at home under the Solid Waste Management Rules (SWM).',
    difficulty: 'Beginner',
    estimated_minutes: 4,
    points_reward: 25,
    category_tag: 'Fundamentals',
    is_published: true,
  },
  {
    id: 'm2222222-2222-2222-2222-222222222222',
    title: 'Kitchen Composting: Turn Scraps into Garden Gold',
    slug: 'kitchen-composting-guide',
    summary: 'A step-by-step guide to starting an odor-free, pest-free composting system on your balcony or backyard.',
    difficulty: 'Beginner',
    estimated_minutes: 5,
    points_reward: 25,
    category_tag: 'Composting',
    is_published: true,
  },
  {
    id: 'm3333333-3333-3333-3333-333333333333',
    title: 'Demystifying Plastics: Wash, Dry, and Flatten',
    slug: 'clean-dry-flatten-plastics',
    summary: 'Why unwashed plastics end up in dumps and how the simple habit of washing milk pouches saves thousands of tons from landfills.',
    difficulty: 'Intermediate',
    estimated_minutes: 4,
    points_reward: 25,
    category_tag: 'Recycling',
    is_published: true,
  },
  {
    id: 'm4444444-4444-4444-4444-444444444444',
    title: 'Safe Handling of Domestic Hazardous and Sanitary Waste',
    slug: 'hazardous-and-sanitary-protocols',
    summary: 'Protect sanitation workers and safeguard groundwater by following strict disposal protocols for batteries, chemicals, and medical waste.',
    difficulty: 'Intermediate',
    estimated_minutes: 5,
    points_reward: 25,
    category_tag: 'Safety',
    is_published: true,
  },
];

// GET /api/v1/learning
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    let modules = FALLBACK_MODULES;
    try {
      const { data, error } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        modules = data;
      }
    } catch {}

    // Attach completion status if user is authenticated
    let userCompletions = new Set();
    if (req.user) {
      try {
        const { data: completions } = await supabase
          .from('learning_completions')
          .select('module_id')
          .eq('user_id', req.user.id);

        if (completions) {
          userCompletions = new Set(completions.map(c => c.module_id));
        }
      } catch {}
    }

    const result = modules.map(m => ({
      ...m,
      isCompleted: userCompletions.has(m.id),
    }));

    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/learning/:slug
router.get('/:slug', optionalAuth, async (req, res, next) => {
  try {
    const { slug } = req.params;
    let module = null;

    try {
      const { data, error } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!error && data) {
        module = data;
      }
    } catch {}

    if (!module) {
      module = FALLBACK_MODULES.find(m => m.slug === slug || m.id === slug);
    }

    if (!module) {
      return errorResponse(res, 'MODULE_NOT_FOUND', 'Educational module not found', 404);
    }

    let isCompleted = false;
    if (req.user) {
      try {
        const { data: completion } = await supabase
          .from('learning_completions')
          .select('id')
          .eq('user_id', req.user.id)
          .eq('module_id', module.id)
          .single();

        if (completion) isCompleted = true;
      } catch {}
    }

    return successResponse(res, {
      ...module,
      isCompleted,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/learning/:id/complete
router.post('/:id/complete', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Check if already completed
    try {
      const { data: existing } = await supabase
        .from('learning_completions')
        .select('id')
        .eq('user_id', req.user.id)
        .eq('module_id', id)
        .single();

      if (existing) {
        return successResponse(res, {
          completed: true,
          alreadyCompleted: true,
          message: 'You have already completed this module.',
          reward: { awarded: false, points: 0, reason: 'ALREADY_COMPLETED' },
        });
      }
    } catch {}

    // 2. Insert completion record
    try {
      await supabase.from('learning_completions').insert({
        user_id: req.user.id,
        module_id: id,
      });
    } catch {}

    // 3. Award points idempotently
    const idempotencyKey = `module:${req.user.id}:${id}`;
    const award = await rewardService.awardPoints(
      req.user.id,
      'complete_module',
      idempotencyKey,
      id
    );

    return successResponse(res, {
      completed: true,
      alreadyCompleted: false,
      message: 'Module completed successfully!',
      reward: award,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

