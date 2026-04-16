import * as imageService from '../services/imageService.js';
import CustomError from '../utils/CustomError.js';

export const uploadImage = async (req, res) => {
  try {
    const user = req.user;

    const images = req.files;

    const uploads = await Promise.all(
      images.map((file) => imageService.uploadImage(file.buffer, user))
    );

    const url = uploads.map((upload) => ({
      url: upload.secure_url,
      public_id: upload.public_id,
      asset_id: upload.asset_id,
    }));

    return res.status(201).json(url);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('imageController(uploadImage) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};
