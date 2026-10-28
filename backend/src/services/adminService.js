import { supabase, isConfigured } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import { DEFAULT_CATEGORIES, DEFAULT_ITEMS } from './classificationService.js';

export const adminService = {
  /**
   * Log an administrative action to admin_audit_logs
   */
  logAudit: async (adminUserId, action, entityType, entityId, metadata = {}) => {
    if (!isConfigured) {
      logger.info('Admin audit action (in-memory mode)', { adminUserId, action, entityType, entityId });
      return;
    }
    try {
      await supabase.from('admin_audit_logs').insert({
        actor_user_id: adminUserId,
        action,
        entity_type: entityType,
        entity_id: String(entityId),
        metadata,
      });
      logger.info('Admin audit action recorded', { adminUserId, action, entityType, entityId });
    } catch (err) {
      logger.error('Failed to write admin audit log', { error: err.message });
    }
  },

  /**
   * Admin Platform Overview metrics
   */
  getOverview: async () => {
    let usersCount = 2;
    let classificationsCount = 12;
    let itemsCount = DEFAULT_ITEMS.length;
    let categoriesCount = DEFAULT_CATEGORIES.length;
    let totalPointsAwarded = 150;

    if (!isConfigured) {
      return {
        usersCount,
        classificationsCount,
        itemsCount,
        categoriesCount,
        totalPointsAwarded,
      };
    }

    try {
      const { count: uCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      if (uCount !== null) usersCount = uCount;

      const { count: cCount } = await supabase.from('classification_records').select('*', { count: 'exact', head: true });
      if (cCount !== null) classificationsCount = cCount;

      const { count: iCount } = await supabase.from('waste_items').select('*', { count: 'exact', head: true });
      if (iCount !== null) itemsCount = iCount;

      const { count: catCount } = await supabase.from('waste_categories').select('*', { count: 'exact', head: true });
      if (catCount !== null) categoriesCount = catCount;

      const { data: ledger } = await supabase.from('reward_ledger').select('points_delta');
      if (ledger) {
        totalPointsAwarded = ledger.reduce((sum, row) => sum + (row.points_delta || 0), 0);
      }
    } catch (err) {
      logger.warn('Failed to fetch full overview metrics from DB', { error: err.message });
    }

    return {
      usersCount,
      classificationsCount,
      itemsCount,
      categoriesCount,
      totalPointsAwarded,
    };
  },

  /**
   * Users list (sanitized: id, full_name, role, created_at)
   */
  getUsers: async (limit = 50) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && data) return data;
    } catch {}

    return [
      { id: 'usr-1', full_name: 'System Admin', role: 'admin', created_at: new Date().toISOString() },
      { id: 'usr-2', full_name: 'Priya Sharma', role: 'user', created_at: new Date().toISOString() },
    ];
  },

  /**
   * Audit logs
   */
  getAuditLogs: async (limit = 50) => {
    try {
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*, actor:profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && data) return data;
    } catch {}

    return [];
  },
};
