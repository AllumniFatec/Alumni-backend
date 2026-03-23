import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import * as imageController from '../controllers/imageController.js';
import upload from '../config/multer.js';
import { createRateLimit } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

const MAX_FILES_COUNT = 10; // Maximum number of images allowed per upload
const uploadRateLimit = createRateLimit({
  keyPrefix: 'image-upload',
  windowSeconds: 60,
  maxRequests: 5,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

router.post(
  '/image-test',
  auth,
  uploadRateLimit,
  upload.array('images', MAX_FILES_COUNT),
  imageController.uploadImage
);

export default router;
