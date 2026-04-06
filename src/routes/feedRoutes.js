import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import * as feedController from '../controllers/feedController.js';
import { createRateLimit } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

const loadFeedRateLimit = createRateLimit({
  keyPrefix: 'load-feed',
  windowSeconds: 60, //1 minuto
  maxRequests: 60,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

router.get('/feed', auth, loadFeedRateLimit, feedController.feed);

export default router;
