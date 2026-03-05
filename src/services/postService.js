import { PrismaClient } from '../generated/prisma/index.js';
import CustomError from '../utils/CustomError.js';

const prisma = new PrismaClient();

export const create = async (postData, userToken) => {
  const user_id = userToken.id;
  const post_content = postData.content;

  if (!post_content) {
    throw new CustomError('O conteúdo da postagem é obrigatório', 400);
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
