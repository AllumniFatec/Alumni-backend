import { PrismaClient } from '../generated/prisma/index.js';
import CustomError from '../utils/CustomError.js';
import { authenticateUser } from './userService.js';

const prisma = new PrismaClient();

const actions = {
  getWorkplace: 'listar locais de trabalho',
};

export const getWorkplaces = async (userToken) => {
  const user_id = userToken.id;

  return authenticateUser(user_id, actions.getWorkplace, async (user) => {
    const workplaces = await prisma.workplace.findMany({
      orderBy: {
        company: 'asc',
      },
      select: {
        workplace_id: true,
        company: true,
      },
    });

    if (workplaces.length === 0) {
      return [];
    }

    return workplaces;
  });
};
