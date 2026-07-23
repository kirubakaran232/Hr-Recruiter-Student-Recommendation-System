import { getFirebaseAdmin } from '../config/firebaseAdmin.js';

export async function authenticateFirebase(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      const error = new Error('Authentication token is required');
      error.statusCode = 401;
      throw error;
    }

    const admin = getFirebaseAdmin();
    req.firebaseUser = await admin.auth().verifyIdToken(token);
    next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    next(error);
  }
}
