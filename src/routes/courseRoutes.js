import express from 'express';
import * as courseController from '../controllers/courseController.js';
import { createRateLimit } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

const getCourseRateLimit = createRateLimit({
  keyPrefix: 'course-get',
  windowSeconds: 60,
  maxRequests: 15,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

router.get('/course', getCourseRateLimit, courseController.listCourses);

export default router;
