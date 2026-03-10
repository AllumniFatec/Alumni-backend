import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import * as jobController from '../controllers/jobController.js';

const router = express.Router();

router.post('/job', auth, jobController.createJob);
router.get('/job', auth, jobController.getJobs);
router.get('/job/:id', auth, jobController.getJobById);
router.patch('/job/:id', auth, jobController.updateJob);
router.delete('/job/:id', auth, jobController.deleteJob);

export default router;
