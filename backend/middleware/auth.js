import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { supabaseAdmin, supabase } from '../config/supabase.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Resolve user from either the app's JWT or a Supabase access token.
// Sets req.authUser = { id, userType, source }
export const resolveUserAnyToken = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization') || '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!bearer) {
      console.warn('[auth] resolveUserAnyToken: missing bearer token');
      return res.status(401).json({ success: false, message: 'Unauthorized: missing token' });
    }

    // Try app JWT first
    let decodedId = null;
    try {
      const decoded = jwt.verify(bearer, process.env.JWT_SECRET);
      if (decoded?.id) {
        // Try Supabase lookup first for latest role
        try {
          const { data: user, error } = await supabase
            .from('users')
            .select('id, user_type, is_active')
            .eq('id', decoded.id)
            .single();
          
          if (!error && user && user.is_active !== false) {
            req.authUser = { id: user.id, userType: user.user_type, source: 'app' };
            console.info('[auth] resolveUserAnyToken: app JWT (supabase) user=', { id: user.id, role: user.user_type });
            return next();
          }
        } catch (dbErr) {
          console.warn('[auth] resolveUserAnyToken: supabase lookup failed for app JWT', dbErr.message);
        }
        
        // If Supabase user not found, use decoded payload
        if (decoded?.userType) {
          req.authUser = { id: decoded.id, userType: decoded.userType, source: 'app' };
          console.info('[auth] resolveUserAnyToken: app JWT (decoded payload) user=', { id: decoded.id, role: decoded.userType });
          return next();
        }
        // Keep decoded id to resolve against Supabase users table for role
        decodedId = decoded.id;
      }
    } catch (_) {
      // Not an app JWT; will try as Supabase token
      console.info('[auth] resolveUserAnyToken: attempting Supabase auth');
    }
    let supaId = null;
    let sbEmail = null;
    let sbName = null;
    if (decodedId) {
      // Resolve via Supabase users table using decoded id
      supaId = decodedId;
      // Try to pull minimal profile from app users table if present
      try {
        const { data: profile } = await supabase
          .from('users')
          .select('email, name')
          .eq('id', supaId)
          .maybeSingle();
        if (profile) {
          sbEmail = profile.email || `${supaId}@placeholder.local`;
          sbName = profile.name || (sbEmail ? sbEmail.split('@')[0] : 'New User');
        }
      } catch {}
      if (!sbEmail) {
        sbEmail = `${supaId}@placeholder.local`;
        sbName = 'New User';
      }
    } else {
      // Resolve via Supabase auth using access token
      if (!bearer) {
        console.warn('[auth] resolveUserAnyToken: missing bearer token');
        return res.status(401).json({ success: false, message: 'Unauthorized: missing token' });
      }
      const { data: authUser, error } = await supabaseAdmin.auth.getUser(bearer);
      if (error || !authUser?.user) {
        console.warn('[auth] resolveUserAnyToken: supabase auth getUser failed');
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      supaId = authUser.user.id;
      sbEmail = authUser.user.email || `${supaId}@placeholder.local`;
      sbName = (authUser.user.user_metadata && (authUser.user.user_metadata.full_name || authUser.user.user_metadata.name))
        || (sbEmail ? sbEmail.split('@')[0] : 'New User');
    }
    let { data: dbUser, error: dbErr } = await supabase
      .from('users')
      .select('id, user_type')
      .eq('id', supaId)
      .single();
    if (dbErr && dbErr.code !== 'PGRST116') {
      console.error('[auth] resolveUserAnyToken: user lookup failed', dbErr);
      return res.status(500).json({ success: false, message: 'User lookup failed' });
    }

    if (!dbUser) {
      // Optionally auto-provision as basic user (role decided later by requireSeller)
      const provisionRole = process.env.DEFAULT_NEW_USER_ROLE || 'buyer';
      const { data: inserted, error: insErr } = await supabaseAdmin
        .from('users')
        .insert({
          id: supaId,
          name: sbName,
          email: sbEmail,
          user_type: provisionRole,
          is_active: true
        })
        .select('id, user_type')
        .single();
      if (insErr || !inserted) {
        console.error('[auth] resolveUserAnyToken: auto-provision failed', insErr);
        return res.status(500).json({ success: false, message: 'Failed to auto-provision user' });
      }
      dbUser = inserted;
    }

    req.authUser = { id: dbUser.id, userType: dbUser.user_type, source: decodedId ? 'app' : 'supabase' };
    console.info('[auth] resolveUserAnyToken: resolved via', decodedId ? 'app->supabase' : 'supabase', 'user=', { id: dbUser.id, role: dbUser.user_type });
    return next();
  } catch (err) {
    console.error('[auth] resolveUserAnyToken: unexpected error', err?.message || String(err));
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

// Require seller role. If not seller and AUTO_PROMOTE_TO_SELLER === 'true',
// will update Supabase users.user_type to 'seller' for Supabase-auth users.
// Also supports auto-provision from resolveUserAnyToken above.
export const requireSeller = async (req, res, next) => {
  try {
    const autoPromote = String(process.env.AUTO_PROMOTE_TO_SELLER || 'false').toLowerCase() === 'true';
    const userId = req.authUser?.id || req.user?.id;
    const userType = req.authUser?.userType || req.user?.userType;
    const source = req.authUser?.source || (req.user ? 'app' : undefined);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (userType === 'seller') {
      return next();
    }

    if (autoPromote && (source === 'supabase' || source === 'app')) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .update({ user_type: 'seller' })
        .eq('id', userId)
        .select('id, user_type')
        .single();
      if (error || !data) {
        return res.status(403).json({ success: false, message: 'Access denied. Seller role required.' });
      }
      req.authUser = { id: data.id, userType: data.user_type, source };
      return next();
    }

    return res.status(403).json({ success: false, message: 'Access denied. Seller role required.' });
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Access denied. Seller role required.' });
  }
};
