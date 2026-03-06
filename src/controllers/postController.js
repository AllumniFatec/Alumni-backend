import * as postService from '../services/postService.js';
import CustomError from '../utils/CustomError.js';

export const createPost = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;

    const post = await postService.create(data, user);

    return res.status(201).json({ message: 'Postagem criada com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const data = req.body;
    const postId = req.params.id;
    const user = req.user;

    const updatedPost = await postService.update(postId, data, user);

    return res.status(200).json({ message: 'Postagem atualizada com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};
