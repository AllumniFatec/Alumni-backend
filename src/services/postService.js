import { PrismaClient } from '../generated/prisma/index.js';
import CustomError from '../utils/CustomError.js';

const prisma = new PrismaClient();

export const create = async (postData, userToken) => {
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

export const update = async (postId, postData, userToken) => {
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
