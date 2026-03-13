import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

router.get('/user', auth, userController.getUsers);
router.get('/user/:id', auth, userController.getUserById);
router.get('/myProfile', auth, userController.getMyProfile);

router.post('/myProfile/insertJob', auth, userController.insertJob);

export default router;
