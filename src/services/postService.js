import { PrismaClient } from '../generated/prisma/index.js';
import CustomError from '../utils/CustomError.js';
import { authenticateUser } from './userService.js';

const prisma = new PrismaClient();

const actions = {
  createPost: 'criar postagem',
  updatePost: 'atualizar postagem',
  deletePost: 'deletar postagem',
  createCommentPost: 'criar comentário',
  updateCommentPost: 'atualizar comentário',
  deleteCommentPost: 'deletar comentário',
  createLikePost: 'curtir postagem',
  deleteLikePost: 'remover curtida',
};

export const createPost = async (postData, userToken) => {
  const user_id = userToken.id;
  const post_content = postData.content;

  if (!post_content) {
    throw new CustomError('O conteúdo da postagem é obrigatório', 400);
  }

  if (post_content.length > 2000) {
    throw new CustomError('O conteúdo da postagem não pode exceder 2000 caracteres', 400);
  }

  return authenticateUser(user_id, actions.createPost, async (user) => {
    const post = await prisma.post.create({
      data: {
        content: post_content,
        author_id: user.user_id,
      },
    });
    return post;
  });
};

export const updatePost = async (postId, postData, userToken) => {
  const user_id = userToken.id;
  const post_content = postData.content;
  const post_id = postId;

  if (!post_content) {
    throw new CustomError('O conteúdo da postagem é obrigatório', 400);
  }

  if (post_content.length > 2000) {
    throw new CustomError('O conteúdo da postagem não pode exceder 2000 caracteres', 400);
  }

  return authenticateUser(user_id, actions.updatePost, async (user) => {
    const post = await prisma.post.findUnique({
      where: {
        post_id: post_id,
      },
    });

    if (!post) {
      throw new CustomError('Postagem não encontrada', 404);
    }

    if (user.user_type !== 'Admin') {
      if (post.author_id !== user_id) {
        throw new CustomError('Usuário não autorizado a atualizar esta postagem', 403);
      }
    }

    await prisma.post.update({
      where: {
        post_id: post_id,
      },
      data: {
        content: post_content,
        updated_at: new Date(),
      },
    });

    return { message: 'Postagem atualizada com sucesso!' };
  });
};

export const deletePost = async (postId, userToken) => {
  const user_id = userToken.id;
  const post_id = postId;

  return authenticateUser(user_id, actions.deletePost, async (user) => {
    const post = await prisma.post.findUnique({
      where: {
        post_id: post_id,
      },
    });

    if (!post) {
      throw new CustomError('Postagem não encontrada', 404);
    }

    if (user.user_type !== 'Admin') {
      if (post.author_id !== user_id) {
        throw new CustomError('Usuário não autorizado a deletar esta postagem', 403);
      }
    }

    await prisma.post.update({
      where: {
        post_id: post_id,
      },
      data: {
        status: 'Deleted',
      },
    });

    return { message: 'Postagem deletada com sucesso!' };
  });
};

export const createCommentPost = async (postId, commentData, userToken) => {
  const user_id = userToken.id;
  const post_id = postId;
  const comment_content = commentData.content;

  if (!comment_content) {
    throw new CustomError('O conteúdo do comentário é obrigatório', 400);
  }

  if (comment_content.length > 1000) {
    throw new CustomError('O conteúdo do comentário não pode exceder 1000 caracteres', 400);
  }

  return authenticateUser(user_id, actions.createCommentPost, async (user) => {
    const post = await prisma.post.findUnique({
      where: {
        post_id: post_id,
      },
    });

    if (!post) {
      throw new CustomError('Postagem não encontrada', 404);
    }

    await prisma.postComments.create({
      data: {
        content: comment_content,
        author_id: user.user_id,
        post_id: post_id,
      },
    });

    await prisma.post.update({
      where: {
        post_id: post_id,
      },
      data: {
        comments_count: { increment: 1 },
      },
    });

    return { message: 'Comentário adicionado com sucesso!' };
  });
};

export const updateCommentPost = async (postCommentId, postCommentData, userToken) => {
  const user_id = userToken.id;
  const post_comment_content = postCommentData.content;
  const post_comment_id = postCommentId;

  if (!post_comment_content) {
    throw new CustomError('O conteúdo do comentário é obrigatório', 400);
  }

  if (post_comment_content.length > 1000) {
    throw new CustomError('O conteúdo do comentário não pode exceder 1000 caracteres', 400);
  }

  return authenticateUser(user_id, actions.updateCommentPost, async (user) => {
    const postComment = await prisma.postComments.findUnique({
      where: {
        comment_id: post_comment_id,
      },
    });

    if (!postComment) {
      throw new CustomError('Comentário não encontrado', 404);
    }

    if (user.user_type !== 'Admin') {
      if (postComment.author_id !== user_id) {
        throw new CustomError('Usuário não autorizado a atualizar este comentário', 403);
      }
    }

    await prisma.postComments.update({
      where: {
        comment_id: post_comment_id,
      },
      data: {
        content: post_comment_content,
        updated_at: new Date(),
      },
    });

    return { message: 'Comentário atualizado com sucesso!' };
  });
};

export const deleteCommentPost = async (postCommentId, userToken) => {
  const user_id = userToken.id;
  const post_comment_id = postCommentId;

  return authenticateUser(user_id, actions.deleteCommentPost, async (user) => {
    const postComment = await prisma.postComments.findUnique({
      where: {
        comment_id: post_comment_id,
      },
    });

    if (!postComment) {
      throw new CustomError('Comentário não encontrado', 404);
    }

    if (user.user_type !== 'Admin') {
      if (postComment.author_id !== user_id) {
        throw new CustomError('Usuário não autorizado a deletar este comentário', 403);
      }
    }

    await prisma.postComments.update({
      where: {
        comment_id: post_comment_id,
      },
      data: {
        status: 'Deleted',
      },
    });

    await prisma.post.update({
      where: {
        post_id: postComment.post_id,
      },
      data: {
        comments_count: { decrement: 1 },
      },
    });

    return { message: 'Comentário deletado com sucesso!' };
  });
};

export const createLikePost = async (postId, userToken) => {
  const user_id = userToken.id;
  const post_id = postId;

  return authenticateUser(user_id, actions.createLikePost, async (user) => {
    const post = await prisma.post.findUnique({
      where: {
        post_id: post_id,
      },
    });

    if (!post) {
      throw new CustomError('Postagem não encontrada', 404);
    }

    // Usar transação para garantir atomicidade e evitar race conditions
    const result = await prisma.$transaction(async (tx) => {
      const existingLike = await tx.postLikes.findFirst({
        where: {
          post_id: post.post_id,
          author_id: user.user_id,
        },
      });

      if (!existingLike) {
        // Criar novo like
        await tx.postLikes.create({
          data: {
            post_id: post.post_id,
            author_id: user.user_id,
          },
        });

        await tx.post.update({
          where: {
            post_id: post_id,
          },
          data: {
            likes_count: { increment: 1 },
          },
        });

        return { message: 'Postagem curtida com sucesso!' };
      }

      if (existingLike.status === 'Active') {
        await tx.postLikes.update({
          where: {
            like_id: existingLike.like_id,
          },
          data: {
            status: 'Inactive',
            create_date: new Date(),
          },
        });

        await tx.post.update({
          where: {
            post_id: post_id,
          },
          data: {
            likes_count: { decrement: 1 },
          },
        });

        return { message: 'Curtida removida com sucesso!' };
      }

      if (existingLike.status === 'Inactive') {
        await tx.postLikes.update({
          where: {
            like_id: existingLike.like_id,
          },
          data: {
            status: 'Active',
            create_date: new Date(),
          },
        });

        await tx.post.update({
          where: {
            post_id: post_id,
          },
          data: {
            likes_count: { increment: 1 },
          },
        });

        return { message: 'Postagem curtida com sucesso!' };
      }
    });

    return result;
  });
};

/*
export const deleteLikePost = async (postId, userToken) => {
  const user_id = userToken.id;
  const post_id = postId;

  return authenticateUser(user_id, actions.deleteLikePost, async (user) => {
    const post = await prisma.post.findUnique({
      where: {
        post_id: post_id,
      },
    });

    if (!post) {
      throw new CustomError('Postagem não encontrada', 404);
    }

    // Usar transação para garantir atomicidade e evitar race conditions
    const result = await prisma.$transaction(async (tx) => {
      const existingLike = await tx.postLikes.findFirst({
        where: {
          post_id: post_id,
          author_id: user_id,
        },
      });

      if (!existingLike || existingLike.status === 'Deleted') {
        throw new CustomError('Usuário não curtiu esta postagem', 400);
      }

      await tx.postLikes.update({
        where: {
          like_id: existingLike.like_id,
        },
        data: {
          status: 'Deleted',
        },
      });

      await tx.post.update({
        where: {
          post_id: post_id,
        },
        data: {
          likes_count: { decrement: 1 },
        },
      });

      return { message: 'Curtida removida com sucesso!' };
    });

    return result;
  });
};
*/
