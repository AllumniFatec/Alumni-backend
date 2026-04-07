import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import * as workplaceController from '../controllers/workplaceController.js';

const router = express.Router();

router.get('/workplace', auth, workplaceController.listWorkplaces);

export default router;
