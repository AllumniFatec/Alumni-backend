import { PrismaClient } from '../generated/prisma/index.js';
//import prisma from '../config/prisma.js';
import CustomError from '../utils/CustomError.js';
import { authenticateUser } from './userService.js';
import { getPageNumber } from '../utils/validations.js';

const prisma = new PrismaClient();

const actions = {
  startChat: 'iniciar chat',
};

export const startChat = async (userToken, targetUserId) => {
  const user_id = userToken.id;
  const target_user_id = targetUserId;

  return authenticateUser(user_id, actions.startChat, async (user) => {
    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            user_id: user_id,
          },
        },
      },
      include: {
        participants: true,
      },
    });
  });
};
