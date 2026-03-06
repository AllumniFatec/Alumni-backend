import { PrismaClient } from '../generated/prisma/index.js';
import CustomError from '../utils/CustomError.js';

const prisma = new PrismaClient();

export const createPost = async (postData, userToken) => {
  const user_id = userToken.id;
  const post_content = postData.content;

  if (!post_content) {
    throw new CustomError('O conteúdo da postagem é obrigatório', 400);
  }

  if (post_content.length > 2000) {
    throw new CustomError('O conteúdo da postagem não pode exceder 2000 caracteres', 400);
  }

  const user = await prisma.user.findUnique({
    where: {
      user_id: user_id,
    },
  });

  if (!user) {
    throw new CustomError('Usuário não encontrado', 404);
  }

  if (user.user_status !== 'Active') {
    throw new CustomError('Usuário não autorizado a postar', 403);
  }

  const post = await prisma.post.create({
    data: {
      content: post_content,
      author_id: user_id,
    },
  });

  return post;
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

  const user = await prisma.user.findUnique({
    where: {
      user_id: user_id,
    },
  });

  if (!user) {
    throw new CustomError('Usuário não encontrado', 404);
  }

  if (user.user_status !== 'Active') {
    throw new CustomError('Usuário não autorizado a atualizar postagens', 403);
  }

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
};

export const deletePost = async (postId, userToken) => {
  const user_id = userToken.id;
  const post_id = postId;

  const user = await prisma.user.findUnique({
    where: {
      user_id: user_id,
    },
  });

  if (!user) {
    throw new CustomError('Usuário não encontrado', 404);
  }

  if (user.user_status !== 'Active') {
    throw new CustomError('Usuário não autorizado a deletar postagens', 403);
  }

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

  const user = await prisma.user.findUnique({
    where: {
      user_id: user_id,
    },
  });

  if (!user) {
    throw new CustomError('Usuário não encontrado', 404);
  }

  if (user.user_status !== 'Active') {
    throw new CustomError('Usuário não autorizado a comentar', 403);
  }

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
      user_id: user.user_id,
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
};
