import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import * as feedController from '../controllers/feedController.js';

const router = express.Router();

router.get('/feed', auth, feedController.feed);

export default router;
