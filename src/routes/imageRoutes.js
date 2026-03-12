import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import * as imageController from '../controllers/imageController.js';
import upload from '../config/multer.js';

const router = express.Router();

router.post('/image-test', auth, upload.array('images', 10), imageController.uploadImage);

export default router;
