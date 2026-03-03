import express from 'express';
import * as courseController from '../controllers/courseController.js';

const router = express.Router();

router.post('/course', courseController.insertCourse);

export default router;
