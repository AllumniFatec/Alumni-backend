import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import authId from '../middlewares/authIdMiddleware.js';
import adminOnly from '../middlewares/adminMiddleware.js';
import * as adminController from '../controllers/adminController.js';
import { createRateLimit } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

const adminMutationsRateLimit = createRateLimit({
  keyPrefix: 'admin-mutations',
  windowSeconds: 60,
  maxRequests: 10,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

router.get('/admin/dashboard', auth, adminOnly, adminController.dashboard);
router.get('/admin/usersInAnalysis', auth, adminOnly, adminController.listAllUsersInAnalysis);
router.post(
  '/admin/approve/:id',
  auth,
  adminOnly,
  adminMutationsRateLimit,
  authId,
  adminController.approveUser
);
router.post(
  '/admin/refuse/:id',
  auth,
  adminOnly,
  adminMutationsRateLimit,
  authId,
  adminController.refuseUser
);
router.post('/admin/users/ban/:id', auth, adminOnly, authId, adminController.banUser);

router.get('/admin/users', auth, adminOnly, adminController.getUsers);
router.get('/admin/users/search', auth, adminOnly, adminController.searchUsers);
router.patch(
  '/admin/users/changeType/:id',
  auth,
  adminOnly,
  authId,
  adminController.changeUserType
);

export default router;
