import { PrismaClient } from '../generated/prisma/index.js';
//import prisma from '../config/prisma.js';
import { authenticateUser } from './userService.js';

const prisma = new PrismaClient();

const actions = {
  getSkills: 'listar habilidades',
};

export const getSkills = async (userToken) => {
  const user_id = userToken.id;

  return authenticateUser(user_id, actions.getSkills, async (user) => {
    const skills = await prisma.skill.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        skill_id: true,
        name: true,
      },
    });

    if (skills.length === 0) {
      return [];
    }

    return skills;
  });
};
