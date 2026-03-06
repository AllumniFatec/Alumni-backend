import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import * as postController from '../controllers/postController.js';

const router = express.Router();

router.post('/post', auth, postController.createPost);
router.patch('/post/:id', auth, postController.updatePost);
router.delete('/post/:id', auth, postController.deletePost);
router.post('/post/comment/:id', auth, postController.createCommentPost);

export default router;
