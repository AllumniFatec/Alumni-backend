import express from 'express';
import * as passwordController from '../controllers/passwordController.js';

const router = express.Router();

router.post('/forgotPassword', passwordController.forgotPassword);
router.patch('/resetPassword/:token', passwordController.resetPassword);

export default router;
