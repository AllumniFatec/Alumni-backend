import prisma from '../config/prisma.js';
import { authenticateUser } from './userService.js';

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
