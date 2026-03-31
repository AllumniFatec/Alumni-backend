import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import authId from '../middlewares/authIdMiddleware.js';
import * as eventController from '../controllers/eventController.js';

const router = express.Router();

router.post('/event', auth, eventController.createEvent);
router.get('/event', auth, eventController.getEvents);
router.get('/event/:id', auth, authId, eventController.getEventById);
router.put('/event/:id', auth, authId, eventController.updateEvent);
router.delete('/event/:id', auth, authId, eventController.deleteEvent);
router.patch('/event/:id', auth, authId, eventController.closeEvent);

export default router;
