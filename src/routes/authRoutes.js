import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import * as authController from '../controllers/authController.js';
import { createRateLimit } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

const registerRateLimit = createRateLimit({
  keyPrefix: 'auth-register',
  windowSeconds: 60 * 10,
  maxRequests: 5,
});

const loginRateLimit = createRateLimit({
  keyPrefix: 'auth-login',
  windowSeconds: 60 * 10,
  maxRequests: 10,
});

router.post('/auth/register', registerRateLimit, authController.register);
router.post('/auth/login', loginRateLimit, authController.login);
router.get('/auth/me', auth, authController.getMe);
router.post('/auth/logout', auth, authController.logout);

export default router;
