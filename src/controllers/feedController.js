import * as feedService from '../services/feedService.js';
import CustomError from '../utils/CustomError.js';

export const feed = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const user = req.user;

    const data = await feedService.loadFeed(page, user);

    return res.status(200).json(data);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('feedController(feed) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};
