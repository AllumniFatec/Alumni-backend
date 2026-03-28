import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import upload from '../config/multer.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

const MAX_FILES_COUNT = 1;

router.get('/user/search', auth, userController.searchUser);
router.get('/user', auth, userController.getUsers);
router.get('/user/:id', auth, userController.getUserById);

router.get('/my-profile', auth, userController.getMyProfile);
router.patch(
  '/my-profile/profile-photo',
  auth,
  upload.single('image', MAX_FILES_COUNT),
  userController.updateProfilePhoto
);
router.put('/my-profile', auth, userController.updateMyProfile);
router.delete('/my-profile', auth, userController.deleteMyProfile);

router.post('/my-profile/job', auth, userController.insertWorkplace);
router.put('/my-profile/job', auth, userController.updateWorkplace);
router.delete('/my-profile/job', auth, userController.deleteWorkplace);

router.post('/my-profile/skill', auth, userController.insertSkill);
router.delete('/my-profile/skill', auth, userController.deleteSkill);

router.post('/my-profile/social-media', auth, userController.insertSocialMedia);
router.patch('/my-profile/social-media', auth, userController.updateSocialMedia);
router.delete('/my-profile/social-media', auth, userController.deleteSocialMedia);

export default router;
