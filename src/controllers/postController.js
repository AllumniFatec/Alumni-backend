import * as postService from '../services/postService.js';
import CustomError from '../utils/CustomError.js';
import { logUserAction } from '../modules/auditLog/auditLog.helper.js';
import { POST_CREATED, POST_UPDATED, POST_DELETED } from '../common/enums/auditActions.js';

export const createPost = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;

    const post = await postService.createPost(data, user);

    await logUserAction(req, {
      action: POST_CREATED,
      entity: 'POST',
      entityId: post?.post_id ?? post?.id,
      description: 'Post criado',
      metadata: undefined,
    });

    return res.status(201).json({
      message: 'Postagem criada com sucesso!',
      post,
    });
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

    const post = await postService.updatePost(postId, data, user);

    await logUserAction(req, {
      action: POST_UPDATED,
      entity: 'POST',
      entityId: postId,
      description: 'Post atualizado',
      metadata: { updated_fields: Object.keys(data || {}) },
    });

    return res.status(200).json({
      message: 'Postagem atualizada com sucesso!',
      post,
    });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const user = req.user;

    const updatedPost = await postService.deletePost(postId, user);

    await logUserAction(req, {
      action: POST_DELETED,
      entity: 'POST',
      entityId: postId,
      description: 'Post excluído',
      metadata: undefined,
    });

    return res.status(200).json({ message: 'Postagem deletada com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const createCommentPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const user = req.user;
    const commentData = req.body;

    const updatedPost = await postService.createCommentPost(postId, commentData, user);

    return res.status(200).json({ message: 'Comentário adicionado com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const updateCommentPost = async (req, res) => {
  try {
    const data = req.body;
    const postCommentId = req.params.id;
    const user = req.user;

    const updatedPostComment = await postService.updateCommentPost(postCommentId, data, user);

    return res.status(200).json({ message: 'Comentário atualizado com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const deleteCommentPost = async (req, res) => {
  try {
    const postCommentId = req.params.id;
    const user = req.user;

    const updatedPostComment = await postService.deleteCommentPost(postCommentId, user);

    return res.status(200).json({ message: 'Comentário deletado com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const createLikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const user = req.user;

    const updatedPost = await postService.createLikePost(postId, user);

    return res.status(200).json(updatedPost);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

/*
export const deleteLikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const user = req.user;

    const updatedPost = await postService.deleteLikePost(postId, user);

    return res.status(200).json({ message: 'Curtida removida com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};
*/
