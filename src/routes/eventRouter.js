import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import * as eventController from '../controllers/eventController.js';

const router = express.Router();

router.post('/event', auth, eventController.createEvent);
router.get('/event', auth, eventController.getEvents);
router.get('/event/:id', auth, eventController.getEventById);
router.put('/event/:id', auth, eventController.updateEvent);
router.delete('/event/:id', auth, eventController.deleteEvent);
router.patch('/event/:id', auth, eventController.closeEvent);

export default router;
