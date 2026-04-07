import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import authId from '../middlewares/authIdMiddleware.js';
import upload from '../config/multer.js';
import * as userController from '../controllers/userController.js';
import { createRateLimit } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

const MAX_FILES_COUNT = 1;

const profilePhotoRateLimit = createRateLimit({
  keyPrefix: 'profile-photo-upload',
  windowSeconds: 60, //1 minuto
  maxRequests: 5,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

const updateProfileRateLimit = createRateLimit({
  keyPrefix: 'profile-update',
  windowSeconds: 60, //1 minuto
  maxRequests: 8,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

const skillsProfileRateLimit = createRateLimit({
  keyPrefix: 'profile-skills-crud',
  windowSeconds: 60, //1 minuto
  maxRequests: 15,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

const socialMediaProfileRateLimit = createRateLimit({
  keyPrefix: 'profile-social-media-crud',
  windowSeconds: 60, //1 minuto
  maxRequests: 15,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

const workplaceProfileRateLimit = createRateLimit({
  keyPrefix: 'profile-workplace-crud',
  windowSeconds: 60, //1 minuto
  maxRequests: 12,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

const searchUserRateLimit = createRateLimit({
  keyPrefix: 'search-user',
  windowSeconds: 60, //1 minuto
  maxRequests: 10,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

router.get('/user/search', auth, searchUserRateLimit, userController.searchUser);
router.get('/user', auth, userController.getUsers);
router.get('/user/:id', auth, authId, userController.getUserById);

router.get('/my-profile', auth, userController.getMyProfile);
router.patch(
  '/my-profile/profile-photo',
  auth,
  profilePhotoRateLimit,
  upload.single('image', MAX_FILES_COUNT),
  userController.updateProfilePhoto
);
router.put('/my-profile', auth, updateProfileRateLimit, userController.updateMyProfile);
router.delete('/my-profile', auth, userController.deleteMyProfile);

router.post(
  '/my-profile/workplace',
  auth,
  workplaceProfileRateLimit,
  userController.insertWorkplace
);
router.put(
  '/my-profile/workplace',
  auth,
  workplaceProfileRateLimit,
  userController.updateWorkplace
);
router.delete(
  '/my-profile/workplace',
  auth,
  workplaceProfileRateLimit,
  userController.deleteWorkplace
);

router.post('/my-profile/skill', auth, skillsProfileRateLimit, userController.insertSkill);
router.delete('/my-profile/skill', auth, skillsProfileRateLimit, userController.deleteSkill);

router.post(
  '/my-profile/social-media',
  auth,
  socialMediaProfileRateLimit,
  userController.insertSocialMedia
);
router.patch(
  '/my-profile/social-media',
  auth,
  socialMediaProfileRateLimit,
  userController.updateSocialMedia
);
router.delete(
  '/my-profile/social-media',
  auth,
  socialMediaProfileRateLimit,
  userController.deleteSocialMedia
);

export default router;
