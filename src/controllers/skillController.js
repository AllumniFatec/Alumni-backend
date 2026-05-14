import * as skillService from '../services/skillService.js';
import CustomError from '../utils/CustomError.js';

export const listSkills = async (req, res) => {
  try {
    const user = req.user;

    const skills = await skillService.getSkills(user);

    return res.status(200).json(skills);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('skillController(listSkills) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};
