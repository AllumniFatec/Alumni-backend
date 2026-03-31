import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import authId from '../middlewares/authIdMiddleware.js';
import * as jobController from '../controllers/jobController.js';

const router = express.Router();

router.post('/job', auth, jobController.createJob);
router.get('/job', auth, jobController.getJobs);
router.get('/job/:id', auth, authId, jobController.getJobById);
router.patch('/job/:id', auth, authId, jobController.updateJob);
router.delete('/job/:id', auth, authId, jobController.deleteJob);

export default router;
