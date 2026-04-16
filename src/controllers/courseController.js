import * as courseService from '../services/courseService.js';
import CustomError from '../utils/CustomError.js';

export const insertCourse = async (req, res) => {
  try {
    const user = req.user;
    const courseInfo = req.body;

    const course = await courseService.createCourse(user, courseInfo);

    return res.status(201).json({ message: 'Curso cadastrado com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('courseController(insertCourse) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const listCourses = async (req, res) => {
  try {
    const courses = await courseService.getCourses();

    return res.status(200).json(courses);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('courseController(listCourses) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};
