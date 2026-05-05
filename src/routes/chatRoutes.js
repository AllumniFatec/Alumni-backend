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

const saveMessageRateLimit = createRateLimit({
  keyPrefix: 'chat-save-message',
  windowSeconds: 60,
  maxRequests: 15,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

router.post('/chat/:id', auth, authId, startChatRateLimit, chatController.startChat);
router.get('/chat', auth, chatController.getChats);
router.get('/chat/:id', auth, authId, chatController.getChatMessages);
router.post('/chat/:id/message', auth, authId, saveMessageRateLimit, chatController.saveMessage);

export default router;
