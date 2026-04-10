import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import authId from '../middlewares/authIdMiddleware.js';
import * as notificationController from '../controllers/notificationController.js';

const router = express.Router();

router.get('/notification', auth, notificationController.getNotifications);
router.patch('/notification/:id', auth, authId, notificationController.readNotification);

export default router;
