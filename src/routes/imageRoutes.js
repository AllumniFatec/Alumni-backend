import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import * as imageController from '../controllers/imageController.js';
import upload from '../config/multer.js';

const router = express.Router();

const MAX_FILES_COUNT = 10; // Maximum number of images allowed per upload

router.post(
  '/image-test',
  auth,
  upload.array('images', MAX_FILES_COUNT),
  imageController.uploadImage
);

export default router;
