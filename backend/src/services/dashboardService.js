import { supabase } from '../config/supabase.js';
import { rewardService } from './rewardService.js';
import { DEFAULT_CATEGORIES } from './classificationService.js';

export const dashboardService = {
  /**
   * Get summarized dashboard metrics for the authenticated user
   */
  getSummary: async (userId) => {
    // 1. Get user reward balance
    const balance = await rewardService.getUserBalance(userId);

    // 2. Fetch user classification records
    let classifications = [];
    try {
      const { data, error } = await supabase
        .from('classification_records')
        .select('id, category_id, input_text, created_at, category:waste_categories(name, color_hex, slug)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        classifications = data;
      }
    } catch {
      // In-memory fallback
    }

    // 3. Category breakdown computation
    const categoryCounts = {};
    DEFAULT_CATEGORIES.forEach(c => {
      categoryCounts[c.name] = {
        name: c.name,
        slug: c.slug,
        color: c.color_hex,
        count: 0
      };
    });

    classifications.forEach(record => {
      const catName = record.category?.name || 'General';
      if (!categoryCounts[catName]) {
        categoryCounts[catName] = {
          name: catName,
          slug: 'other',
          color: '#10B981',
          count: 0
        };
      }
      categoryCounts[catName].count += 1;
    });

    // 4. Learning completions
    let completedModuleIds = [];
    try {
      const { data } = await supabase
        .from('learning_completions')
        .select('module_id')
        .eq('user_id', userId);
      if (data) {
        completedModuleIds = data.map(d => d.module_id);
      }
    } catch {}

    return {
      userId,
      points: balance.totalPoints,
      tier: balance.tier,
      badge: balance.badge,
      nextTier: balance.nextTier,
      pointsToNextTier: balance.pointsToNextTier,
      totalClassifications: classifications.length,
      completedModulesCount: completedModuleIds.length,
      categoryBreakdown: Object.values(categoryCounts),
      recentActivity: classifications.slice(0, 5),
    };
  },

  /**
   * Get detailed activity log for user
   */
  getActivity: async (userId, limit = 20) => {
    try {
      const { data, error } = await supabase
        .from('classification_records')
        .select('id, input_text, classification_method, result_explanation, created_at, category:waste_categories(name, color_hex, slug)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && data) {
        return data;
      }
    } catch {}

    return [];
  },
};

