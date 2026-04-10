import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import authId from '../middlewares/authIdMiddleware.js';
import * as jobController from '../controllers/jobController.js';
import { createRateLimit } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

const createJobRateLimit = createRateLimit({
  keyPrefix: 'job-create',
  windowSeconds: 60, //1 minuto
  maxRequests: 5,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

const updateJobRateLimit = createRateLimit({
  keyPrefix: 'job-update',
  windowSeconds: 60, //1 minuto
  maxRequests: 10,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

const deleteJobRateLimit = createRateLimit({
  keyPrefix: 'job-delete',
  windowSeconds: 60, //1 minuto
  maxRequests: 5,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

const closeJobRateLimit = createRateLimit({
  keyPrefix: 'job-close',
  windowSeconds: 60, //1 minuto
  maxRequests: 5,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

const listJobsRateLimit = createRateLimit({
  keyPrefix: 'job-list',
  windowSeconds: 60, //1 minuto
  maxRequests: 60,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

const getJobIdRateLimit = createRateLimit({
  keyPrefix: 'job-id-get',
  windowSeconds: 60, //1 minuto
  maxRequests: 80,
  getIdentifier: (req) => req.user?.id || req.user?.userId,
});

router.post('/job', auth, createJobRateLimit, jobController.createJob);
router.get('/job', auth, listJobsRateLimit, jobController.getJobs);
router.get('/job/:id', auth, getJobIdRateLimit, authId, jobController.getJobById);
router.put('/job/:id', auth, updateJobRateLimit, authId, jobController.updateJob);
router.delete('/job/:id', auth, deleteJobRateLimit, authId, jobController.deleteJob);
router.patch('/job/:id', auth, closeJobRateLimit, authId, jobController.closeJob);

export default router;
