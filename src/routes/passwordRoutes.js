import express from 'express';
import * as passwordController from '../controllers/passwordController.js';
import { createRateLimit } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

const forgotPasswordRateLimit = createRateLimit({
  keyPrefix: 'password-forgot',
  windowSeconds: 60 * 30,
  maxRequests: 3,
});

const resetPasswordRateLimit = createRateLimit({
  keyPrefix: 'password-reset',
  windowSeconds: 60 * 30,
  maxRequests: 5,
});

router.post(
  '/password/forgot-password',
  forgotPasswordRateLimit,
  passwordController.forgotPassword
);
router.patch(
  '/password/reset-password/:token',
  resetPasswordRateLimit,
  passwordController.resetPassword
);

export default router;
