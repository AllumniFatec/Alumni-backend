import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import upload from '../config/multer.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

const MAX_FILES_COUNT = 1;

router.get('/user', auth, userController.getUsers);
router.get('/user/:id', auth, userController.getUserById);

router.get('/myProfile', auth, userController.getMyProfile);
router.patch(
  '/myProfile/profilePhoto',
  auth,
  upload.single('image', MAX_FILES_COUNT),
  userController.updateProfilePhoto
);
router.put('/myProfile', auth, userController.updateMyProfile);
router.delete('/myProfile', auth, userController.deleteMyProfile);

router.post('/myProfile/insertJob', auth, userController.insertJob);
router.put('/myProfile/editJob', auth, userController.updateJob);
router.delete('/myProfile/deleteJob', auth, userController.deleteJob);

export default router;
