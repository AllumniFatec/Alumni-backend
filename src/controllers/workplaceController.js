import * as workplaceService from '../services/workplaceService.js';
import CustomError from '../utils/CustomError.js';

export const listWorkplaces = async (req, res) => {
  try {
    const user = req.user;

    const workplaces = await workplaceService.getWorkplaces(user);

    return res.status(200).json(workplaces);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('workplaceController(listWorkplaces) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};
