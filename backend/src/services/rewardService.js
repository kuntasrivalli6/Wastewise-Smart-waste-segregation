import { supabase, isConfigured } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

const DEFAULT_RULE_POINTS = {
  classify_waste: 10,
  complete_module: 25,
  daily_streak: 5,
};

// In-memory ledger fallback for tests / when DB is offline
const memoryLedger = [];

export const rewardService = {
  /**
   * Safely and idempotently award points to a user.
   */
  awardPoints: async (userId, eventType, idempotencyKey, sourceReference = null) => {
    try {
      // 1. Get points configured for this event type
      let points = DEFAULT_RULE_POINTS[eventType] || 0;
      if (isConfigured) {
        try {
          const { data: rule } = await supabase
            .from('reward_rules')
            .select('points, is_active')
            .eq('event_type', eventType)
            .single();

          if (rule && rule.is_active) {
            points = rule.points;
          }
        } catch (err) {
          logger.warn('Using default points for event type', { eventType, error: err.message });
        }
      }

      if (points <= 0) {
        return { awarded: false, reason: 'ZERO_POINTS', points: 0 };
      }

      // 2. If configured, insert into reward_ledger with idempotency key
      if (isConfigured) {
        try {
          const { data, error } = await supabase
            .from('reward_ledger')
            .insert({
              user_id: userId,
              event_type: eventType,
              points_delta: points,
              source_reference: sourceReference ? String(sourceReference) : null,
              idempotency_key: idempotencyKey,
            })
            .select()
            .single();

          if (error) {
            if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
              logger.info('Duplicate reward attempt blocked by idempotency key', { idempotencyKey });
              return {
                awarded: false,
                reason: 'DUPLICATE_EVENT',
                message: 'Points have already been awarded for this activity.',
                points: 0,
              };
            }
            throw error;
          }

          logger.info('Reward points awarded', { userId, eventType, points, idempotencyKey });
          return {
            awarded: true,
            points,
            eventType,
            ledgerId: data?.id,
          };
        } catch (dbErr) {
          logger.warn('Database error writing ledger, falling back to memory', { error: dbErr.message });
        }
      }

      // Fallback for tests / memory mock
      const existing = memoryLedger.find(entry => entry.idempotency_key === idempotencyKey);
      if (existing) {
        return {
          awarded: false,
          reason: 'DUPLICATE_EVENT',
          message: 'Points have already been awarded for this activity.',
          points: 0,
        };
      }

      const newEntry = {
        id: `mem-${Date.now()}-${Math.random()}`,
        user_id: userId,
        event_type: eventType,
        points_delta: points,
        source_reference: sourceReference,
        idempotency_key: idempotencyKey,
        created_at: new Date().toISOString(),
      };
      memoryLedger.push(newEntry);

      return {
        awarded: true,
        points,
        eventType,
        ledgerId: newEntry.id,
      };
    } catch (err) {
      logger.error('Failed to process reward points', { userId, eventType, error: err.message });
      return { awarded: false, reason: 'LEDGER_ERROR', points: 0 };
    }
  },

  /**
   * Get user points balance and rank tier
   */
  getUserBalance: async (userId) => {
    let totalPoints = 0;
    if (isConfigured) {
      try {
        const { data, error } = await supabase
          .from('reward_ledger')
          .select('points_delta')
          .eq('user_id', userId);

        if (!error && data) {
          totalPoints = data.reduce((sum, item) => sum + (item.points_delta || 0), 0);
        }
      } catch {}
    } else {
      const userEntries = memoryLedger.filter(e => e.user_id === userId);
      totalPoints = userEntries.reduce((sum, item) => sum + item.points_delta, 0);
    }

    const tier = calculateTier(totalPoints);
    return {
      totalPoints,
      tier: tier.name,
      nextTier: tier.nextTier,
      pointsToNextTier: tier.pointsToNextTier,
      badge: tier.badge,
    };
  },

  /**
   * Get reward ledger entries for user
   */
  getUserLedger: async (userId, limit = 50) => {
    if (isConfigured) {
      try {
        const { data, error } = await supabase
          .from('reward_ledger')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (!error && data) {
          return data;
        }
      } catch (err) {
        logger.warn('Failed to fetch ledger from DB, returning memory entries', { error: err.message });
      }
    }

    return memoryLedger
      .filter(e => e.user_id === userId)
      .slice(-limit)
      .reverse();
  },

  /**
   * Get active reward rules
   */
  getRules: async () => {
    if (isConfigured) {
      try {
        const { data, error } = await supabase
          .from('reward_rules')
          .select('*')
          .eq('is_active', true);

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        logger.warn('Failed to fetch reward rules from DB', { error: err.message });
      }
    }

    return [
      { event_type: 'classify_waste', description: 'Classify and log a waste item', points: 10, is_active: true },
      { event_type: 'complete_module', description: 'Complete an educational guide', points: 25, is_active: true },
      { event_type: 'daily_streak', description: 'Consecutive daily activity streak', points: 5, is_active: true },
    ];
  },
};

function calculateTier(points) {
  if (points >= 600) {
    return {
      name: 'Sustainability Champion',
      badge: '🏆',
      nextTier: 'Max Level',
      pointsToNextTier: 0,
    };
  } else if (points >= 300) {
    return {
      name: 'Earth Guardian',
      badge: '🌍',
      nextTier: 'Sustainability Champion',
      pointsToNextTier: 600 - points,
    };
  } else if (points >= 100) {
    return {
      name: 'Eco Warrior',
      badge: '🌱',
      nextTier: 'Earth Guardian',
      pointsToNextTier: 300 - points,
    };
  } else {
    return {
      name: 'Green Starter',
      badge: '🍃',
      nextTier: 'Eco Warrior',
      pointsToNextTier: 100 - points,
    };
  }
}
