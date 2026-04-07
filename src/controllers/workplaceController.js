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
    return res.status(500).json({ error: err.message });
  }
};
