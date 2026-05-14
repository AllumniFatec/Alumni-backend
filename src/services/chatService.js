import prisma from '../config/prisma.js';
import CustomError from '../utils/CustomError.js';
import { authenticateUser } from './userService.js';
import { getPageNumber } from '../utils/validations.js';

const actions = {
  startChat: 'iniciar chat',
  getChats: 'listar chats',
  getChatMessages: 'listar mensagens de um chat',
  saveMessage: 'enviar mensagem',
  markMessageAsRead: 'marcar mensagens como lidas',
  validateChatParticipation: 'acessar chat',
  getUnreadCount: 'listar mensagens não lidas',
};

export const validateChatParticipation = async (userId, chatId) => {
  const user_id = userId;
  const chat_id = chatId;

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
};

export const startChat = async (userToken, targetUserId) => {
  const user_id = userToken.id;
  const target_user_id = targetUserId;

  return authenticateUser(user_id, actions.startChat, async () => {
    if (user_id === target_user_id) {
      throw new CustomError('Não é possível iniciar chat consigo mesmo', 400);
    }

    const dm_key = [user_id, target_user_id].sort().join(':');

    const chat = await prisma.chat.upsert({
      where: { dm_key },
      update: {},
      create: {
        dm_key,
        participants: {
          create: [{ user_id }, { user_id: target_user_id }],
        },
      },
      select: {
        chat_id: true,
        last_message: true,
        last_message_at: true,
        participants: {
          select: {
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
    });

    return chat;
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
          last_message_at: true,
          participants: {
            select: {
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

    const chatIds = chats.map((c) => c.chat_id);
    const unreadCounts = await prisma.message.groupBy({
      by: ['chat_id'],
      where: {
        chat_id: { in: chatIds },
        sender_id: { not: user_id },
        NOT: { read_by: { has: user_id } },
      },
      _count: { message_id: true },
    });
    const unreadMap = new Map(unreadCounts.map((r) => [r.chat_id, r._count.message_id]));

    const chatsWithUnread = chats.map((chat) => ({
      ...chat,
      unreadCount: unreadMap.get(chat.chat_id) ?? 0,
    }));

    return {
      chats: chatsWithUnread,
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

export const getChatMessages = async (userToken, chatId, cursor) => {
  const user_id = userToken.id;
  const chat_id = chatId;

  return authenticateUser(user_id, actions.getChatMessages, async (user) => {
    await validateChatParticipation(user_id, chat_id);

    const limit = 20;

    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 20;

    const queryOptions = {
      where: {
        chat_id: chat_id,
      },
      orderBy: [{ created_at: 'desc' }, { message_id: 'desc' }],
      select: {
        message_id: true,
        content: true,
        read_by: true,
        sender_id: true,
        created_at: true,
        chat_id: true,
      },
      take: safeLimit + 1,
    };

    if (cursor) {
      queryOptions.cursor = { message_id: cursor };
      queryOptions.skip = 1;
    }

    const fetched = await prisma.message.findMany(queryOptions);

    const hasMore = fetched.length > safeLimit;
    const messages = hasMore ? fetched.slice(0, safeLimit) : fetched;
    const nextCursor =
      hasMore && messages.length > 0 ? messages[messages.length - 1].message_id : null;

    return {
      messages: messages,
      pagination: {
        limit: safeLimit,
        nextCursor: nextCursor,
        hasMore: hasMore,
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

    const chat = await validateChatParticipation(user_id, chat_id);
    const participantIds = chat.participants.map((p) => p.user_id);

    const validReadBy = Array.from(
      new Set([user_id, ...readByUserIds].filter((id) => participantIds.includes(id)))
    );

    const messageTimestamp = new Date();

    const [message] = await Promise.all([
      prisma.message.create({
        data: {
          chat_id: chat_id,
          sender_id: user_id,
          content: textContent,
          read_by: validReadBy,
          created_at: messageTimestamp,
        },
      }),
      prisma.chat.update({
        where: {
          chat_id: chat_id,
        },
        data: {
          last_message: textContent,
          last_message_at: messageTimestamp,
        },
      }),
    ]);

    return { message, participantIds };
  });
};

export const getUnreadCount = async (userToken) => {
  const user_id = userToken.id ?? userToken;

  return authenticateUser(user_id, actions.getUnreadCount, async (user) => {
    const totalUnread = await prisma.message.count({
      where: {
        chat: { participants: { some: { user_id: user_id } } },
        sender_id: { not: user_id },
        NOT: { read_by: { has: user_id } },
      },
    });

    return totalUnread;
  });
};

export const getChatUnreadCount = async (userId, chatId) => {
  return prisma.message.count({
    where: {
      chat_id: chatId,
      sender_id: { not: userId },
      NOT: { read_by: { has: userId } },
    },
  });
};

export const getChatParticipantIds = async (chatId) => {
  const rows = await prisma.chatParticipant.findMany({
    where: { chat_id: chatId },
    select: { user_id: true },
  });
  return rows.map((r) => r.user_id);
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
