import express from 'express';
import * as courseController from '../controllers/courseController.js';

const router = express.Router();

router.post('/course/create', courseController.insertCourse);

export default router;
