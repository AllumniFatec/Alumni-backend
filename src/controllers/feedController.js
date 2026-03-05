import * as feedService from '../services/feedService.js';
import CustomError from '../utils/CustomError.js';

export const feed = async (req, res) => {
  try {
    const page = req.query.page || 1;

    const data = await feedService.loadFeed(page);

    return res.status(200).json(data);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};
