import { User } from '../models/User.js';

/**
 * Middleware — ensures the authenticated Firebase user exists in DB
 * and has the 'hr' role. Attaches the User doc to req.user.
 */
export async function requireHR(req, _res, next) {
  try {
    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });

    if (!user) {
      const err = new Error('User account not found');
      err.statusCode = 404;
      throw err;
    }

    if (user.role !== 'hr') {
      const err = new Error('Access denied — HR role required');
      err.statusCode = 403;
      throw err;
    }

    req.user = user;
    next();
  } catch (error) {
    error.statusCode = error.statusCode || 403;
    next(error);
  }
}
