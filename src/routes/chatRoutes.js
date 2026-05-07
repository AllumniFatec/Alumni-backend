import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import authId from '../middlewares/authIdMiddleware.js';
import * as chatController from '../controllers/chatController.js';
import { createRateLimit } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

const startChatRateLimit = createRateLimit({
  keyPrefix: 'chat-start',
  windowSeconds: 60,
  maxRequests: 10,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

const sendMessageRateLimit = createRateLimit({
  keyPrefix: 'chat-send-http',
  windowSeconds: 30,
  maxRequests: 30,
  getIdentifier: (req) => req.user?.id,
});

router.post('/chat/:id', auth, authId, startChatRateLimit, chatController.startChat);
router.get('/chat', auth, chatController.getChats);
router.get('/chat/:id', auth, authId, chatController.getChatMessages);
router.post('/chat/:id/message', auth, authId, sendMessageRateLimit, chatController.sendMessage);
router.patch('/chat/:id/read', auth, authId, chatController.markAsRead);

export default router;
