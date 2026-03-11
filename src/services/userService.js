import { PrismaClient } from '../generated/prisma/index.js';
import CustomError from '../utils/CustomError.js';

const prisma = new PrismaClient();

export const authenticateUser = async (userId, action, func) => {
  const user_id = userId;

  const user = await prisma.user.findUnique({
    where: {
      user_id: user_id,
    },
  });

  if (!user) {
    throw new CustomError('Usuário não encontrado', 404);
  }

  if (user.user_status !== 'Active') {
    throw new CustomError('Usuário não autorizado a realizar esta ação: ' + action, 403);
  }

  if (typeof func === 'function') {
    return func(user);
  }

  return user;
};
