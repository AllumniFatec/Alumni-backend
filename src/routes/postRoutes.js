import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import * as postController from '../controllers/postController.js';

const router = express.Router();

router.post('/post', auth, postController.createPost);
router.patch('/post/:id', auth, postController.updatePost);

export default router;
