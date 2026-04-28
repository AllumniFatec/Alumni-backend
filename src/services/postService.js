import prisma from '../config/prisma.js';
import CustomError from '../utils/CustomError.js';
import { authenticateUser } from './userService.js';
import { formatPost, postSelectForApi } from '../utils/postApiFormatter.js';
import { enqueueNotificationForAudience } from './notificationService.js';
import { notificationTypes } from '../utils/notificationTypes.js';
import { env } from '../config/env.js';
import { getPageNumber } from '../utils/validations.js';

const actions = {
  createPost: 'criar postagem',
  updatePost: 'atualizar postagem',
  deletePost: 'deletar postagem',
  createCommentPost: 'criar comentário',
  updateCommentPost: 'atualizar comentário',
  deleteCommentPost: 'deletar comentário',
  createLikePost: 'curtir postagem',
  deleteLikePost: 'remover curtida',
  getPostById: 'carregar postagem',
  getPostsByUser: 'carregar postagens do usuário',
};

export const createPost = async (postData, userToken) => {
  const user_id = userToken.id;
  const post_content = postData.content;

  if (!post_content) {
    throw new CustomError('O conteúdo da postagem é obrigatório', 400);
  }

  if (post_content.length < 10 || post_content.length > 2000) {
    throw new CustomError('O conteúdo da postagem deve ter entre 10 e 2000 caracteres', 400);
  }

  return authenticateUser(user_id, actions.createPost, async (user) => {
    const created = await prisma.post.create({
      data: {
        content: post_content,
        author_id: user.user_id,
      },
    });
    const full = await prisma.post.findUnique({
      where: { post_id: created.post_id },
      select: postSelectForApi,
    });
    return formatPost(full);
  });
};

export const getPostById = async (userToken, postId) => {
  const user_id = userToken.id;
  const post_id = postId;

  return authenticateUser(user_id, actions.getPostById, async (user) => {
    const post = await prisma.post.findUnique({
      where: {
        post_id: post_id,
      },
      select: postSelectForApi,
    });

    if (!post || post.status === 'Deleted') {
      throw new CustomError('Postagem não encontrada', 404);
    }

    const formattedPost = formatPost(post);

    return formattedPost;
  });
};

export const updatePost = async (postId, postData, userToken) => {
  const user_id = userToken.id;
  const post_content = postData.content;
  const post_id = postId;

  if (!post_content) {
    throw new CustomError('O conteúdo da postagem é obrigatório', 400);
  }

  if (post_content.length < 10 || post_content.length > 2000) {
    throw new CustomError('O conteúdo da postagem deve ter entre 10 e 2000 caracteres', 400);
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

    const full = await prisma.post.findUnique({
      where: { post_id: post_id },
      select: postSelectForApi,
    });
    return formatPost(full);
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

  if (comment_content.length < 1 || comment_content.length > 1000) {
    throw new CustomError('O conteúdo do comentário deve ter entre 1 e 1000 caracteres', 400);
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

    const newComment = await prisma.postComments.create({
      data: {
        content: comment_content,
        author_id: user.user_id,
        post_id: post_id,
      },
      select: {
        post_id: true,
      },
    });

    const commentsCount = await prisma.postComments.count({
      where: {
        post_id: newComment.post_id,
      },
    });

    await prisma.post.update({
      where: {
        post_id: post_id,
      },
      data: {
        comments_count: commentsCount,
      },
    });

    if (newComment && post.author_id !== user.user_id) {
      await enqueueNotificationForAudience({
        type: notificationTypes.POST_COMMENTED,
        title: 'Postagem comentada',
        message: `${user.name} comentou em sua postagem`,
        authorId: user.user_id,
        userIds: [post.author_id],
        postId: post.post_id,
        link: `${env.host}/posts/${post.post_id}`,
      });
    }

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

  if (post_comment_content.length < 1 || post_comment_content.length > 1000) {
    throw new CustomError('O conteúdo do comentário deve ter entre 1 e 1000 caracteres', 400);
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

    const deletedComment = await prisma.postComments.update({
      where: {
        comment_id: post_comment_id,
      },
      data: {
        status: 'Deleted',
      },
      select: {
        post_id: true,
      },
    });

    const commentsCount = await prisma.postComments.count({
      where: {
        post_id: deletedComment.post_id,
      },
    });

    await prisma.post.update({
      where: {
        post_id: postComment.post_id,
      },
      data: {
        comments_count: commentsCount,
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
        const newLike = await tx.postLikes.create({
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

        return { message: 'Postagem curtida com sucesso!', data: newLike };
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
        const likedPost = await tx.postLikes.update({
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

        return { message: 'Postagem curtida com sucesso!', data: likedPost };
      }
    });

    if (result.data) {
      const postLiked = await prisma.post.findUnique({
        where: {
          post_id: result.data.post_id,
        },
        select: {
          author_id: true,
          post_id: true,
        },
      });

      if (postLiked?.author_id && postLiked.author_id !== user.user_id) {
        await enqueueNotificationForAudience({
          type: notificationTypes.POST_LIKED,
          title: 'Postagem curtida',
          message: `${user.name} curtiu sua postagem`,
          authorId: user.user_id,
          userIds: [postLiked.author_id],
          postId: result.data.post_id,
          link: `${env.host}/posts/${postLiked.post_id}`,
        });
      }
    }

    return result.message;
  });
};

export const getPostsByUser = async (userToken, userId, page = 1) => {
  const user_id = userToken.id;
  const target_user_id = userId;
  const currentPageNumber = getPageNumber(page);
  const limit = 10;
  const skip = (currentPageNumber - 1) * limit;

  return authenticateUser(user_id, actions.getPostsByUser, async (user) => {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          author_id: target_user_id,
          status: 'Active',
        },
        take: limit,
        skip: skip,
        orderBy: {
          create_date: 'desc',
        },
        select: postSelectForApi,
      }),

      prisma.post.count({
        where: {
          author_id: target_user_id,
          status: 'Active',
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      posts: posts.map(formatPost),
      pagination: {
        page: currentPageNumber,
        limit: limit,
        totalItems: total,
        totalPages: totalPages,
        hasNextPage: currentPageNumber < totalPages,
        hasPreviousPage: currentPageNumber > 1,
      },
    };
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
