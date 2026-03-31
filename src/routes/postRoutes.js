import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import authId from '../middlewares/authIdMiddleware.js';
import * as postController from '../controllers/postController.js';

const router = express.Router();

router.post('/post', auth, postController.createPost);
router.patch('/post/:id', auth, authId, postController.updatePost);
router.delete('/post/:id', auth, authId, postController.deletePost);

router.post('/post/comment/:id', auth, authId, postController.createCommentPost);
router.patch('/post/comment/:id', auth, authId, postController.updateCommentPost);
router.delete('/post/comment/:id', auth, authId, postController.deleteCommentPost);

router.post('/post/like/:id', auth, authId, postController.createLikePost);
//router.delete('/post/like/:id', auth, postController.deleteLikePost);

export default router;
