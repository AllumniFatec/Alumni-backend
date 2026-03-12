import CustomError from '../utils/CustomError.js';
import { authenticateUser } from './userService.js';
import cloudinary from '../config/cloudinary.js';

const actions = {
  uploadImage: 'carregar imagem',
};

export const uploadImage = async (file, userToken) => {
  const user_id = userToken.id;

  return authenticateUser(user_id, actions.uploadImage, async (user) => {
    if (!file) {
      throw new CustomError('Nenhum arquivo enviado', 400);
    }

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'images',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      stream.end(file);
    });
  });
};
