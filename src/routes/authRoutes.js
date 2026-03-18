import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', auth, authController.getMe);
router.post('/auth/logout', auth, authController.logout);

export default router;
