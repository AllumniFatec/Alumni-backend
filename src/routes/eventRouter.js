import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import authId from '../middlewares/authIdMiddleware.js';
import * as eventController from '../controllers/eventController.js';
import { createRateLimit } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

const createEventRateLimit = createRateLimit({
  keyPrefix: 'event-create',
  windowSeconds: 60, //1 minuto
  maxRequests: 5,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

const updateEventRateLimit = createRateLimit({
  keyPrefix: 'event-update',
  windowSeconds: 60, //1 minuto
  maxRequests: 10,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

const deleteOrCloseEventRateLimit = createRateLimit({
  keyPrefix: 'event-delete-close',
  windowSeconds: 60, //1 minuto
  maxRequests: 8,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

const listEventsRateLimit = createRateLimit({
  keyPrefix: 'events-list',
  windowSeconds: 60, //1 minuto
  maxRequests: 60,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

const getEventIdRateLimit = createRateLimit({
  keyPrefix: 'event-id-get',
  windowSeconds: 60, //1 minuto
  maxRequests: 80,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

router.post('/event', auth, createEventRateLimit, eventController.createEvent);
router.get('/event', auth, listEventsRateLimit, eventController.getEvents);
router.get('/event/:id', auth, getEventIdRateLimit, authId, eventController.getEventById);
router.put('/event/:id', auth, updateEventRateLimit, authId, eventController.updateEvent);
router.delete('/event/:id', auth, deleteOrCloseEventRateLimit, authId, eventController.deleteEvent);
router.patch('/event/:id', auth, deleteOrCloseEventRateLimit, authId, eventController.closeEvent);

export default router;
