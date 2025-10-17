import express from 'express';
import * as userController from '../controllers/userController.js';
import auth from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/user/register', userController.register);
router.post('/user/login', userController.login);
router.get('/user/list-users', auth, userController.list);

export default router;
