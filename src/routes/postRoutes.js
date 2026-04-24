import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import authId from '../middlewares/authIdMiddleware.js';
import * as postController from '../controllers/postController.js';
import { createRateLimit } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

const createPostRateLimit = createRateLimit({
  keyPrefix: 'post-create',
  windowSeconds: 60, //1 minuto
  maxRequests: 10,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

const updatePostRateLimit = createRateLimit({
  keyPrefix: 'post-update',
  windowSeconds: 60, //1 minuto
  maxRequests: 10,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

const deletePostRateLimit = createRateLimit({
  keyPrefix: 'post-delete',
  windowSeconds: 60, //1 minuto
  maxRequests: 10,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

const createCommentPostRateLimit = createRateLimit({
  keyPrefix: 'post-comment-create',
  windowSeconds: 60, //1 minuto
  maxRequests: 10,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

const updateCommentPostRateLimit = createRateLimit({
  keyPrefix: 'post-comment-update',
  windowSeconds: 60, //1 minuto
  maxRequests: 10,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

const deleteCommentPostRateLimit = createRateLimit({
  keyPrefix: 'post-comment-delete',
  windowSeconds: 60, //1 minuto
  maxRequests: 10,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

const createOrRemoveLikePostRateLimit = createRateLimit({
  keyPrefix: 'post-like-create-remove',
  windowSeconds: 60, //1 minuto
  maxRequests: 20,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

const getPostsByUserRateLimit = createRateLimit({
  keyPrefix: 'posts-user-get',
  windowSeconds: 60, //1 minuto
  maxRequests: 80,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

router.post('/post', auth, createPostRateLimit, postController.createPost);
router.get('/post/:id', auth, authId, postController.getPost);
router.patch('/post/:id', auth, updatePostRateLimit, authId, postController.updatePost);
router.delete('/post/:id', auth, deletePostRateLimit, authId, postController.deletePost);

router.post(
  '/post/comment/:id',
  auth,
  createCommentPostRateLimit,
  authId,
  postController.createCommentPost
);
router.patch(
  '/post/comment/:id',
  auth,
  updateCommentPostRateLimit,
  authId,
  postController.updateCommentPost
);
router.delete(
  '/post/comment/:id',
  auth,
  deleteCommentPostRateLimit,
  authId,
  postController.deleteCommentPost
);

router.post(
  '/post/like/:id',
  auth,
  createOrRemoveLikePostRateLimit,
  authId,
  postController.createLikePost
);

router.get('/post/user/:id', auth, getPostsByUserRateLimit, authId, postController.getPostsByUser);
//router.delete('/post/like/:id', auth, postController.deleteLikePost);

export default router;
