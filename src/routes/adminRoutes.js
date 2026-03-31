import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import authId from '../middlewares/authIdMiddleware.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

router.get('/admin/dashboard', auth, adminController.dashboard);
router.get('/admin/usersInAnalysis', auth, adminController.listAllUsersInAnalysis);
router.post('/admin/approve/:id', auth, authId, adminController.approveUser);
router.post('/admin/refuse/:id', auth, authId, adminController.refuseUser);

export default router;
