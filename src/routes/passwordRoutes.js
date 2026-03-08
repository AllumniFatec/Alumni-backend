import express from 'express';
import * as passwordController from '../controllers/passwordController.js';

const router = express.Router();

router.post('/password/forgot-password', passwordController.forgotPassword);
router.patch('/password/reset-password/:token', passwordController.resetPassword);

export default router;
