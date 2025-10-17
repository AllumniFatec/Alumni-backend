import express from 'express';
import * as passwordController from '../controllers/passwordController.js';
import auth from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/password/forgotPassword', passwordController.forgotPassword);
router.patch(
  '/password/resetPassword/:token',
  auth,
  passwordController.resetPassword,
);

export default router;
