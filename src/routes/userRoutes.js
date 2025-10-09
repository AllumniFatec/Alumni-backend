import express from 'express';
import * as userController from '../controllers/userController.js';
import auth from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/cadastro', userController.cadastrar);
router.post('/login', userController.logar);
router.get('/listar-usuarios', auth, userController.listar);

export default router;
