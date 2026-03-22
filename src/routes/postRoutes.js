import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import * as postController from '../controllers/postController.js';

const router = express.Router();

router.post('/post', auth, postController.createPost);
router.patch('/post/:id', auth, postController.updatePost);
router.delete('/post/:id', auth, postController.deletePost);

router.post('/post/comment/:id', auth, postController.createCommentPost);
router.patch('/post/comment/:id', auth, postController.updateCommentPost);
router.delete('/post/comment/:id', auth, postController.deleteCommentPost);

router.post('/post/like/:id', auth, postController.createLikePost);
//router.delete('/post/like/:id', auth, postController.deleteLikePost);

export default router;
