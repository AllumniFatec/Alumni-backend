import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

router.get('/admin/dashboard', auth, adminController.dashboard);

export default router;
