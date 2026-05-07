import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import * as skillController from '../controllers/skillController.js';

const router = express.Router();

router.get('/skill', auth, skillController.listSkills);

export default router;
