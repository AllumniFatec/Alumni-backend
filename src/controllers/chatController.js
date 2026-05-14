import * as chatService from '../services/chatService.js';
import CustomError from '../utils/CustomError.js';
import { getIo } from '../config/socket.js';

export const startChat = async (req, res) => {
  try {
    const user = req.user;
    const targetUserId = req.params.id;

    const chat = await chatService.startChat(user, targetUserId);

    return res.status(201).json(chat);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('chatController(startChat) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const getChats = async (req, res) => {
  try {
    const user = req.user;
    const page = req.query.page || 1;

    const chats = await chatService.getChats(user, page);

    return res.status(200).json(chats);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('chatController(getChats) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const user = req.user;
    const chatId = req.params.id;
    const cursor = req.query.lastmsg || null;

    const messages = await chatService.getChatMessages(user, chatId, cursor);

    return res.status(200).json(messages);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('chatController(getChatMessages) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const user = req.user;
    const chatId = req.params.id;
    const { content } = req.body || {};

    const { message, participantIds } = await chatService.saveMessage(user, chatId, content, [user.id]);

    const io = getIo();
    io?.to(`chat:${chatId}`).emit('receive-message', {
      message,
      authorId: user.id,
    });

    if (io) {
      const recipientIds = participantIds.filter((id) => id !== user.id);

      await Promise.all(
        recipientIds.map(async (recipientId) => {
          const [total, chatUnread] = await Promise.all([
            chatService.getUnreadCount(recipientId),
            chatService.getChatUnreadCount(recipientId, chatId),
          ]);
          io.to(`user:${recipientId}`).emit('unread-count-update', { total, chatId, chatUnread });
        })
      );
    }

    return res.status(201).json(message);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('chatController(sendMessage) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const user = req.user;

    const total = await chatService.getUnreadCount(user);

    return res.status(200).json(total);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('chatController(getUnreadCount) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const user = req.user;
    const chatId = req.params.id;

    const result = await chatService.markMessageAsRead(user.id, chatId);

    getIo()?.to(`chat:${chatId}`).emit('messages-read', {
      chatId,
      userId: user.id,
    });

    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('chatController(markAsRead) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};
