import express from 'express';
import * as passwordController from '../controllers/passwordController.js';
import auth from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/password/forgot-password', passwordController.forgotPassword);
router.patch(
  '/password/reset-password/:token',
  auth,
  passwordController.resetPassword,
);

export default router;
