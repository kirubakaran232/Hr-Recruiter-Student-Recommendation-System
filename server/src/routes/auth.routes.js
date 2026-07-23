import { Router } from 'express';
import { login, me, providerAuth, register } from '../controllers/auth.controller.js';
import { authenticateFirebase } from '../middlewares/authenticateFirebase.js';

const router = Router();

router.post('/register', authenticateFirebase, register);
router.post('/login', authenticateFirebase, login);
router.post('/provider', authenticateFirebase, providerAuth);
router.get('/me', authenticateFirebase, me);

export default router;
