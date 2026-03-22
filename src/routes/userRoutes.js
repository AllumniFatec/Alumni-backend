import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import upload from '../config/multer.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

const MAX_FILES_COUNT = 1;

router.get('/user/search', auth, userController.searchUser);
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

router.post('/myProfile/job', auth, userController.insertJob);
router.put('/myProfile/job', auth, userController.updateJob);
router.delete('/myProfile/job', auth, userController.deleteJob);

router.post('/myProfile/skill', auth, userController.insertSkill);
router.delete('/myProfile/skill', auth, userController.deleteSkill);

router.post('/myProfile/socialMedia', auth, userController.insertSocialMedia);
router.patch('/myProfile/socialMedia', auth, userController.updateSocialMedia);
router.delete('/myProfile/socialMedia', auth, userController.deleteSocialMedia);

export default router;
