import express from 'express';
import * as userController from '../controllers/userController.js';
import auth from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/cadastro', userController.register);
router.post('/login', userController.login);
router.get('/listar-usuarios', auth, userController.list);

export default router;
