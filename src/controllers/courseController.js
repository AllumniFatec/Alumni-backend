import * as courseService from '../services/courseService.js';
import CustomError from '../utils/CustomError.js';

export const insertCourse = async (req, res) => {
  try {
    const course = await courseService.createCourse(req.body);
    return res.status(201).json({ message: 'Curso cadastrado com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err });
  }
};
