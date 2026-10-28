import { supabase } from '../config/supabase.js';
import { errorResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'UNAUTHORIZED', 'Authentication token required.', 401);
  }

  const token = authHeader.split(' ')[1];

  // Support for testing/mock environment
  if (process.env.NODE_ENV === 'test' && token.startsWith('mock-token-')) {
    const role = token.includes('admin') ? 'admin' : 'user';
    req.user = {
      id: token.replace('mock-token-', ''),
      email: `${role}@wastewise.test`,
      role: role,
      full_name: role === 'admin' ? 'Test Administrator' : 'Test Citizen',
    };
    return next();
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      logger.warn('Token validation failed', { error: error?.message });
      return errorResponse(res, 'UNAUTHORIZED', 'Invalid or expired authentication session.', 401);
    }

    // Fetch profile to verify role
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email,
      role: profile?.role || 'user',
      full_name: profile?.full_name || 'Eco Citizen',
    };

    next();
  } catch (err) {
    logger.error('Authentication middleware error', { error: err.message });
    return errorResponse(res, 'AUTH_ERROR', 'Authentication verification failed.', 500);
  }
}

export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  if (process.env.NODE_ENV === 'test' && token.startsWith('mock-token-')) {
    const role = token.includes('admin') ? 'admin' : 'user';
    req.user = {
      id: token.replace('mock-token-', ''),
      email: `${role}@wastewise.test`,
      role: role,
      full_name: role === 'admin' ? 'Test Administrator' : 'Test Citizen',
    };
    return next();
  }

  try {
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single();

      req.user = {
        id: user.id,
        email: user.email,
        role: profile?.role || 'user',
        full_name: profile?.full_name || 'Eco Citizen',
      };
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }

  next();
}

