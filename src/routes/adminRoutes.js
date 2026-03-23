import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

router.get('/admin/dashboard', auth, adminController.dashboard);
router.get('/admin/usersInAnalysis', auth, adminController.listAllUsersInAnalysis);
router.post('/admin/approve/:userId', auth, adminController.approveUser);
router.post('/admin/refuse/:userId', auth, adminController.refuseUser);

export default router;
