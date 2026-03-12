import * as imageService from '../services/imageService.js';
import CustomError from '../utils/CustomError.js';

export const uploadImage = async (req, res) => {
  try {
    const user = req.user;

    const images = req.files;

    const uploads = await Promise.all(
      images.map((file) => imageService.uploadImage(file.buffer, user))
    );

    const url = uploads.map((upload) => upload.secure_url);

    return res.status(201).json(url);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};
