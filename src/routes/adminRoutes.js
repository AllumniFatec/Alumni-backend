import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import authId from '../middlewares/authIdMiddleware.js';
import * as adminController from '../controllers/adminController.js';
import { createRateLimit } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

const adminMutationsRateLimit = createRateLimit({
  keyPrefix: 'admin-mutations',
  windowSeconds: 60,
  maxRequests: 10,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

router.get('/admin/dashboard', auth, adminController.dashboard);
router.get('/admin/usersInAnalysis', auth, adminController.listAllUsersInAnalysis);
router.post(
  '/admin/approve/:userId',
  auth,
  adminMutationsRateLimit,
  authId,
  adminController.approveUser
);
router.post(
  '/admin/refuse/:userId',
  auth,
  adminMutationsRateLimit,
  authId,
  adminController.refuseUser
);

router.get('/admin/users', auth, adminController.getUsers);
router.get('/admin/users/search', auth, adminController.searchUsers);
router.get('/admin/users/changeType/:id', auth, authId, adminController.changeUserType);

export default router;
