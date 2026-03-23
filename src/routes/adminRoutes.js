import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import * as adminController from '../controllers/adminController.js';
import { createRateLimit } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

const adminMutationsRateLimit = createRateLimit({
  keyPrefix: 'admin-mutations',
  windowSeconds: 60,
  maxRequests: 20,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

router.get('/admin/dashboard', auth, adminController.dashboard);
router.get('/admin/usersInAnalysis', auth, adminController.listAllUsersInAnalysis);
router.post('/admin/approve/:userId', auth, adminMutationsRateLimit, adminController.approveUser);
router.post('/admin/refuse/:userId', auth, adminMutationsRateLimit, adminController.refuseUser);

export default router;
