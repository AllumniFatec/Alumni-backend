import { PrismaClient } from '../generated/prisma/index.js';
//import prisma from '../config/prisma.js';
import CustomError from '../utils/CustomError.js';
import { authenticateUser } from './userService.js';
import { getPageNumber } from '../utils/validations.js';

const prisma = new PrismaClient();

const actions = {
  startChat: 'iniciar chat',
  getChats: 'listar chats',
  getChatMessages: 'listar mensagens de um chat',
  saveMessage: 'enviar mensagem',
  markMessageAsRead: 'marcar mensagens como lidas',
  validateChatParticipation: 'acessar chat',
};

export const validateChatParticipation = async (userId, chatId) => {
  const user_id = userId;
  const chat_id = chatId;

  return authenticateUser(user_id, actions.validateChatParticipation, async (user) => {
    const chat = await prisma.chat.findUnique({
      where: {
        chat_id: chat_id,
      },
      include: {
        participants: true,
      },
    });

    if (!chat) {
      throw new CustomError('Chat não encontrado', 404);
    }

    const participant = chat.participants.find((p) => p.user_id === user_id);
    if (!participant) {
      throw new CustomError('Usuário não participante do chat', 403);
    }

    return chat;
  });
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

    const existingChat = chats.find((chat) => {
      const participants = chat.participants.map((p) => p.user_id);
      return (
        participants.includes(user_id) &&
        participants.includes(target_user_id) &&
        participants.length === 2
      );
    });

    if (existingChat) {
      return existingChat;
    }

    const newChat = await prisma.chat.create({
      data: {
        participants: {
          create: [{ user_id: user_id }, { user_id: target_user_id }],
        },
      },
    });

    return newChat;
  });
};

export const getChats = async (userToken, page = 1) => {
  const user_id = userToken.id;

  return authenticateUser(user_id, actions.getChats, async (user) => {
    const currentPageNumber = getPageNumber(page);
    const limit = 10;
    const skip = (currentPageNumber - 1) * limit;

    const [chats, totalChats] = await Promise.all([
      prisma.chat.findMany({
        where: {
          participants: {
            some: {
              user_id: user_id,
            },
          },
        },
        select: {
          chat_id: true,
          last_message: true,
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  user_id: true,
                  name: true,
                  perfil_photo: true,
                },
              },
            },
          },
        },
        orderBy: {
          last_message_at: 'desc',
        },
        skip: skip,
        take: limit,
      }),

      prisma.chat.count({
        where: {
          participants: {
            some: {
              user_id: user_id,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalChats / limit);

    return {
      chats: chats,
      pagination: {
        page: currentPageNumber,
        limit: limit,
        totalItems: totalChats,
        totalPages: totalPages,
        hasNextPage: currentPageNumber < totalPages,
        hasPreviousPage: currentPageNumber > 1,
      },
    };
  });
};

export const getChatMessages = async (userToken, chatId, page = 1) => {
  const user_id = userToken.id;
  const chat_id = chatId;

  return authenticateUser(user_id, actions.getChatMessages, async (user) => {
    await validateChatParticipation(user_id, chat_id);

    const currentPageNumber = getPageNumber(page);
    const limit = 20;
    const skip = (currentPageNumber - 1) * limit;

    const [messages, totalMessages] = await Promise.all([
      prisma.message.findMany({
        where: {
          chat_id: chat_id,
        },
        orderBy: {
          created_at: 'desc',
        },
        select: {
          message_id: true,
          content: true,
          read_by: true,
          sender_id: true,
          created_at: true,
          chat_id: true,
        },
        skip: skip,
        take: limit,
      }),

      prisma.message.count({
        where: {
          chat_id: chat_id,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalMessages / limit);

    return {
      messages: messages,
      pagination: {
        page: currentPageNumber,
        limit: limit,
        totalItems: totalMessages,
        totalPages: totalPages,
        hasNextPage: currentPageNumber < totalPages,
        hasPreviousPage: currentPageNumber > 1,
      },
    };
  });
};

export const saveMessage = async (userToken, chatId, content, readByUserIds = []) => {
  const user_id = userToken.id;
  const chat_id = chatId;
  const textContent = typeof content === 'string' ? content.trim() : '';

  return authenticateUser(user_id, actions.saveMessage, async (user) => {
    if (!textContent) {
      throw new CustomError('O conteúdo da mensagem é obrigatório', 400);
    }

    if (textContent.length < 1 || textContent.length > 1000) {
      throw new CustomError('O conteúdo da mensagem deve ter entre 1 e 1000 caracteres', 400);
    }

    await validateChatParticipation(user_id, chat_id);

    const validReadBy = Array.from(
      new Set([user_id, ...readByUserIds].filter((id) => participantIds.includes(id)))
    );

    const message = await prisma.message.create({
      data: {
        chat_id: chat_id,
        sender_id: user_id,
        content: textContent,
        read_by: validReadBy,
      },
    });

    await prisma.chat.update({
      where: {
        chat_id: chat_id,
      },
      data: {
        last_message: textContent,
        last_message_at: new Date(),
      },
    });

    return message;
  });
};

export const markMessageAsRead = async (userId, chatId) => {
  const user_id = userId;
  const chat_id = chatId;

  return authenticateUser(user_id, actions.markMessageAsRead, async (user) => {
    await validateChatParticipation(user_id, chat_id);

    await prisma.message.updateMany({
      where: {
        chat_id: chat_id,
        sender_id: { not: user_id },
        NOT: {
          read_by: { has: user_id },
        },
      },
      data: {
        read_by: { push: user_id },
      },
    });

    return { message: 'Mensagens marcadas como lidas com sucesso!' };
  });
};
